// src/hooks/useAuth.ts

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { ref, set, get, onValue } from 'firebase/database';
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setIsAuthReady(true);
            console.log("Auth State Changed. User:", currentUser ? currentUser.uid : "null");

            if (currentUser) {
                const userRef = ref(realtimeDb, `artifacts/${appId}/users/${currentUser.uid}/profile`);
                try {
                    const snapshot = await get(userRef);

                    if (!snapshot.exists()) {
                        // New user or user data not yet saved
                        await set(userRef, {
                            uid: currentUser.uid,
                            displayName: currentUser.displayName,
                            email: currentUser.email,
                            photoURL: currentUser.photoURL, // Save the photoURL from auth
                            role: 'user', // Default role
                            createdAt: Date.now(),
                        });
                        setUserRole('user');
                        // Use the photoURL from the current user (which was just saved)
                        setUserPhotoUrl(currentUser.photoURL || null);
                    } else {
                        // User exists, retrieve their role and photoURL from RealtimeDB
                        const userData = snapshot.val();
                        setUserRole(userData.role || 'user');
                        // *** ดึง photoURL จาก Realtime Database แทน ***
                        setUserPhotoUrl(userData.photoURL || null);
                    }
                } catch (error) {
                    console.error("Error managing user profile in RealtimeDB:", error);
                    // Fallback to photoURL from currentUser if there's a DB error
                    setUserPhotoUrl(currentUser.photoURL || null);
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
                setUserPhotoUrl(null); // Clear photo URL on sign out
                setUserRole(null);
                setLatestUserStats(null);
                setUserLevelProgress({});
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
        if (!user) {
            return true; // Unlock all levels when not logged in
        }

        if (levelId === 'thai-practice-1-1-1') {
            return true;
        }

        const allLevels = languages.flatMap(lang =>
            lang.units.flatMap(unit =>
                unit.sessions.flatMap(session => session.levels)
            )
        );

        const currentLevelIndex = allLevels.findIndex(level => level.id === levelId);

        if (currentLevelIndex === -1) {
            return false;
        }

        if (currentLevelIndex === 0) {
            return false;
        }

        const previousLevel = allLevels[currentLevelIndex - 1];

        if (!previousLevel) {
            return false;
        }

        const previousLevelStats = userLevelProgress[previousLevel.id];
        const previousLevelPlayCount = previousLevelStats?.playCount || 0;
        const previousLevelScore = previousLevelStats?.score10Point || 0;

        const requiredPlayCount = 3;
        const requiredScore = 5;

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
