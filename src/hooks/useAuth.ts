// src/hooks/useAuth.ts

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { ref, set, get, onValue, update } from 'firebase/database';
import { auth, realtimeDb } from '../firebase/firebaseConfig';
import type { LevelStats } from '../types/types';
import { languages } from '../data/data'; // Import languages data

interface AuthState {
    user: FirebaseUser | null;
    isAuthReady: boolean;
    userPhotoUrl: string | null;
    userRole: string | null;
    latestUserStats: LevelStats | null;
    userLevelProgress: { [levelId: string]: LevelStats | undefined };
    isUserProgressLoaded: boolean;
    handleGoogleSignIn: () => Promise<void>;
    handleSignOut: () => Promise<void>;
    isLevelUnlocked: (levelId: string) => boolean;
}

/**
 * @hook useAuth
 * @description Custom hook for managing Firebase authentication state and user data.
 * @param {string} appId - The application ID for Realtime Database paths.
 * @param {string} currentLevelId - The ID of the currently selected level.
 * @returns {AuthState} - An object containing authentication state and functions.
 */
export const useAuth = (appId: string, currentLevelId: string): AuthState => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
    const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [latestUserStats, setLatestUserStats] = useState<LevelStats | null>(null);
    const [userLevelProgress, setUserLevelProgress] = useState<{ [levelId: string]: LevelStats | undefined }>({});
    const [isUserProgressLoaded, setIsUserProgressLoaded] = useState<boolean>(false);

    // Function to create a safer photo URL (avoiding rate limits)
    const getSafePhotoUrl = (originalUrl: string | null): string | null => {
        if (!originalUrl) return null;

        // If it's a Google Photos URL, try to modify it to a more stable format
        if (originalUrl.includes('googleusercontent.com')) {
            // Remove size parameters and add a more stable size
            const baseUrl = originalUrl.split('=')[0];
            return `${baseUrl}=s64-c`; // Use smaller size to reduce rate limiting
        }

        return originalUrl;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setIsAuthReady(true);
            console.log("Auth State Changed. User:", currentUser ? currentUser.uid : "null");
            console.log(currentUser?.displayName)
            if (currentUser) {
                // Reference to user profile in Realtime Database
                const userRef = ref(realtimeDb, `artifacts/${appId}/users/${currentUser.uid}/profile`);

                try {
                    const snapshot = await get(userRef);
                    const safePhotoUrl = getSafePhotoUrl(currentUser.photoURL);

                    if (!snapshot.exists()) {
                        // New user - create profile with safe photo URL
                        const profileData = {
                            uid: currentUser.uid,
                            displayName: currentUser.displayName,
                            email: currentUser.email,
                            photoURL: safePhotoUrl,
                            originalPhotoURL: currentUser.photoURL, // Keep original for reference
                            role: 'user',
                            createdAt: Date.now(),
                            lastPhotoUpdate: Date.now()
                        };

                        await set(userRef, profileData);
                        setUserRole('user');
                        setUserPhotoUrl(safePhotoUrl);
                        console.log("New user profile created with safe photo URL");
                    } else {
                        // Existing user - always update profile data on login
                        const userData = snapshot.val();
                        setUserRole(userData.role || 'user'); // Keep existing role if present

                        const updates: any = {
                            displayName: currentUser.displayName,
                            email: currentUser.email,
                            photoURL: safePhotoUrl,
                            originalPhotoURL: currentUser.photoURL,
                            lastPhotoUpdate: Date.now()
                        };

                        await update(userRef, updates); // Perform update every time
                        setUserPhotoUrl(safePhotoUrl);
                        console.log("Existing user profile updated on login.");
                    }
                } catch (error) {
                    console.error("Error managing user profile in RealtimeDB:", error);
                    // Fallback to safe photo URL without database
                    const safePhotoUrl = getSafePhotoUrl(currentUser.photoURL);
                    setUserPhotoUrl(safePhotoUrl);
                    setUserRole('user');
                }

                // Listen for user stats for the current level
                const userStatsRef = ref(realtimeDb, `artifacts/${appId}/users/${currentUser.uid}/stats/${currentLevelId}`);
                const unsubscribeStats = onValue(userStatsRef, (snapshot) => {
                    if (snapshot.exists()) {
                        setLatestUserStats(snapshot.val() as LevelStats);
                    } else {
                        setLatestUserStats(null);
                    }
                });

                // Listen for ALL user level progress
                const allUserStatsRef = ref(realtimeDb, `artifacts/${appId}/users/${currentUser.uid}/stats`);
                const unsubscribeAllStats = onValue(allUserStatsRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const progress = snapshot.val() as { [levelId: string]: LevelStats };
                        setUserLevelProgress(progress);
                        console.log("User Level Progress Loaded:", progress);
                    } else {
                        setUserLevelProgress({});
                        console.log("No User Level Progress found.");
                    }
                    setIsUserProgressLoaded(true);
                    console.log("isUserProgressLoaded set to TRUE (from currentUser block)");
                });

                return () => {
                    unsubscribeStats();
                    unsubscribeAllStats();
                };

            } else {
                setUserRole(null);
                setLatestUserStats(null);
                setUserLevelProgress({});
                setUserPhotoUrl(null);
                setIsUserProgressLoaded(true);
                console.log("isUserProgressLoaded set to TRUE (from !currentUser block)");
            }
        });

        return () => unsubscribe();
    }, [auth, realtimeDb, appId, currentLevelId]);

    const handleGoogleSignIn = async () => {
        if (!auth) {
            console.error("Firebase Auth not initialized.");
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google:", error);
        }
    };

    const handleSignOut = async () => {
        if (!auth) {
            console.error("Firebase Auth not initialized.");
            return;
        }
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    /**
     * @function isLevelUnlocked
     * @description ตรวจสอบว่าด่านถูกปลดล็อกหรือไม่
     * @param {string} levelId - ID ของด่านที่ต้องการตรวจสอบ
     * @returns {boolean} - true ถ้าปลดล็อก, false ถ้าล็อก
     */
    const isLevelUnlocked = useCallback((levelId: string): boolean => {
        // If user is not logged in, unlock all levels
        if (!user) {
            return true;
        }

        // The very first level is always unlocked (for logged-in users)
        // ปลดล็อก แบบฝึกหัดย่อยที่ 1.1 
        if (levelId === 'thai-practice-1-1-1') {
            return true;
        }
        // if (levelId === 'thai-practice-1-1-2') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-1-3') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-1-4') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-1-5') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-1-6') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-1-7') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-1-8') {
        //     return true;
        // }

        // // ปลดล็อก แบบฝึกหัดย่อยที่ 1.2 
        // if (levelId === 'thai-practice-1-2-1') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-2-2') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-2-3') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-2-4') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-2-5') {
        //     return true;
        // }

        // // ปลดล็อก แบบฝึกหัดย่อยที่ 1.3
        // if (levelId === 'thai-practice-1-3-1') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-3-2') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-3-3') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-3-4') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-3-5') {
        //     return true;
        // }

        // // ปลดล็อก แบบฝึกหัดย่อยที่ 1.4
        // if (levelId === 'thai-practice-1-4-1') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-4-2') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-4-3') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-4-4') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-1-4-5') {
        //     return true;
        // }

        // // ปลดล็อก แบบฝึกหัดย่อยที่ 2.1
        // if (levelId === 'thai-practice-2-1-1') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-1-2') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-1-3') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-1-4') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-1-5') {
        //     return true;
        // }

        // // ปลดล็อก แบบฝึกหัดย่อยที่ 2.2
        // if (levelId === 'thai-practice-2-2-1') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-2-2') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-2-3') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-2-4') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-2-5') {
        //     return true;
        // }

        // // ปลดล็อก แบบฝึกหัดย่อยที่ 2.3
        // if (levelId === 'thai-practice-2-3-1') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-3-2') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-3-3') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-3-4') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-3-5') {
        //     return true;
        // }

        // // ปลดล็อก แบบฝึกหัดย่อยที่ 2.4
        // if (levelId === 'thai-practice-2-4-1') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-4-2') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-4-3') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-4-4') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-2-4-5') {
        //     return true;
        // }
        // if (levelId === 'thai-practice-3-1-1') {
        //     return true;
        // }

        // Flatten all levels into a single array for easier lookup
        const allLevels = languages.flatMap(lang =>
            lang.units.flatMap(unit =>
                unit.sessions.flatMap(session => session.levels)
            )
        );

        const currentLevelIndex = allLevels.findIndex(level => level.id === levelId);

        // If the current level is not found, consider it locked
        if (currentLevelIndex === -1) {
            return false;
        }

        // If it's the first level and not 'thai-practice-1-1-1', it should be locked
        if (currentLevelIndex === 0) {
            return false;
        }

        const previousLevel = allLevels[currentLevelIndex - 1];

        // Check if there is a previous level
        if (!previousLevel) {
            return false;
        }

        const previousLevelStats = userLevelProgress[previousLevel.id];
        const previousLevelPlayCount = previousLevelStats?.playCount || 0;
        const previousLevelScore = previousLevelStats?.score10Point || 0;

        const requiredPlayCount = 1;
        const requiredScore = 0;

        return previousLevelPlayCount >= requiredPlayCount && previousLevelScore > requiredScore;
    }, [user, userLevelProgress, languages]);

    return {
        user,
        isAuthReady,
        userPhotoUrl,
        userRole,
        latestUserStats,
        userLevelProgress,
        isUserProgressLoaded,
        handleGoogleSignIn,
        handleSignOut,
        isLevelUnlocked,
    };
};
