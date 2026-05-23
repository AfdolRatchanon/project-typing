import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import type { LevelStats, UserRole, UserProfile } from '../types/types';
import { languages } from '../data/data';

interface AuthState {
    user: FirebaseUser | null;
    isAuthReady: boolean;
    userPhotoUrl: string | null;
    userRole: UserRole | null;
    userProfile: UserProfile | null;
    latestUserStats: LevelStats | null;
    userLevelProgress: { [levelId: string]: LevelStats | undefined };
    isUserProgressLoaded: boolean;
    handleGoogleSignIn: () => Promise<void>;
    handleSignOut: () => Promise<void>;
    isLevelUnlocked: (levelId: string) => boolean;
}

const getSafePhotoUrl = (originalUrl: string | null): string | null => {
    if (!originalUrl) return null;
    if (originalUrl.includes('googleusercontent.com')) {
        return `${originalUrl.split('=')[0]}=s64-c`;
    }
    return originalUrl;
};

const normalizeRole = (role: string | undefined): UserRole => {
    if (role === 'admin' || role === 'superAdmin') return 'superAdmin';
    if (role === 'teacher') return 'teacher';
    return 'student';
};

export const useAuth = (currentLevelId: string): AuthState => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
    const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [latestUserStats, setLatestUserStats] = useState<LevelStats | null>(null);
    const [userLevelProgress, setUserLevelProgress] = useState<{ [levelId: string]: LevelStats | undefined }>({});
    const [isUserProgressLoaded, setIsUserProgressLoaded] = useState<boolean>(false);

    useEffect(() => {
        // เก็บ unsubscribe functions ไว้ที่ scope นี้ เพื่อ cleanup ได้ถูกต้อง
        let unsubProfile: (() => void) | null = null;
        let unsubCurrentStat: (() => void) | null = null;
        let unsubAllStats: (() => void) | null = null;

        const cleanupListeners = () => {
            unsubProfile?.();
            unsubCurrentStat?.();
            unsubAllStats?.();
            unsubProfile = null;
            unsubCurrentStat = null;
            unsubAllStats = null;
        };

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            cleanupListeners(); // cleanup listener ชุดเก่าทุกครั้งที่ auth เปลี่ยน

            setUser(currentUser);
            setIsAuthReady(true);

            if (!currentUser) {
                setUserRole(null);
                setUserProfile(null);
                setLatestUserStats(null);
                setUserLevelProgress({});
                setUserPhotoUrl(null);
                setIsUserProgressLoaded(true);
                return;
            }

            const safePhotoUrl = getSafePhotoUrl(currentUser.photoURL);
            const profileRef = doc(db, 'users', currentUser.uid);

            try {
                const snap = await getDoc(profileRef);

                if (!snap.exists()) {
                    // first login — สร้าง profile เริ่มต้น
                    const profileData: UserProfile = {
                        uid: currentUser.uid,
                        displayName: currentUser.displayName || '',
                        firstName: '',
                        lastName: '',
                        email: currentUser.email || '',
                        photoURL: safePhotoUrl,
                        originalPhotoURL: currentUser.photoURL,
                        role: 'student',
                        classroomIds: [],
                        isProfileComplete: false,
                        createdAt: Date.now(),
                        lastPhotoUpdate: Date.now(),
                    };
                    await setDoc(profileRef, profileData);
                } else {
                    // อัปเดตเฉพาะ photo/email ไม่แตะ displayName/firstName/lastName/role
                    const existing = snap.data();
                    if (existing.email !== currentUser.email || existing.photoURL !== safePhotoUrl) {
                        await updateDoc(profileRef, {
                            email: currentUser.email,
                            photoURL: safePhotoUrl,
                            originalPhotoURL: currentUser.photoURL,
                            lastPhotoUpdate: Date.now(),
                        });
                    }
                }
                setUserPhotoUrl(safePhotoUrl);
            } catch (error) {
                console.error('Error managing user profile:', error);
                setUserPhotoUrl(safePhotoUrl);
                setUserRole('student');
            }

            // real-time listener — profile (จับการเปลี่ยน isProfileComplete, role, isDeactivated)
            unsubProfile = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
                if (snap.exists()) {
                    const userData = snap.data() as UserProfile;
                    // SA4 — enforce deactivation in real-time
                    if (userData.isDeactivated) {
                        signOut(auth);
                        return;
                    }
                    const role = normalizeRole(userData.role);
                    setUserRole(role);
                    setUserProfile({ ...userData, role });
                }
            });

            // real-time listener — stats ของ level ปัจจุบัน
            unsubCurrentStat = onSnapshot(
                doc(db, 'users', currentUser.uid, 'stats', currentLevelId),
                (snap) => {
                    setLatestUserStats(snap.exists() ? (snap.data() as LevelStats) : null);
                }
            );

            // real-time listener — stats ทุก level
            unsubAllStats = onSnapshot(
                collection(db, 'users', currentUser.uid, 'stats'),
                (snap) => {
                    const progress: { [levelId: string]: LevelStats } = {};
                    snap.forEach(d => { progress[d.id] = d.data() as LevelStats; });
                    setUserLevelProgress(progress);
                    setIsUserProgressLoaded(true);
                }
            );
        });

        return () => {
            unsubscribeAuth();
            cleanupListeners();
        };
    }, [currentLevelId]);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, new GoogleAuthProvider());
        } catch (error) {
            console.error('Error signing in:', error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const isLevelUnlocked = useCallback((levelId: string): boolean => {
        if (userRole === 'teacher' || userRole === 'superAdmin') return true;
        if (!user) return true;
        if (levelId === 'thai-practice-1-1-1') return true;

        const allLevels = languages.flatMap(lang =>
            lang.units.flatMap(unit =>
                unit.sessions.flatMap(session => session.levels)
            )
        );

        const currentLevelIndex = allLevels.findIndex(level => level.id === levelId);
        if (currentLevelIndex <= 0) return false;

        const previousLevel = allLevels[currentLevelIndex - 1];
        if (!previousLevel) return false;

        return (userLevelProgress[previousLevel.id]?.playCount || 0) >= 1;
    }, [user, userRole, userLevelProgress]);

    return {
        user,
        isAuthReady,
        userPhotoUrl,
        userRole,
        userProfile,
        latestUserStats,
        userLevelProgress,
        isUserProgressLoaded,
        handleGoogleSignIn,
        handleSignOut,
        isLevelUnlocked,
    };
};
