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

    // Access __initial_auth_token safely
    // const initialAuthToken = typeof window !== 'undefined' ? window.__initial_auth_token : undefined;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setUserPhotoUrl(currentUser?.photoURL || null);
            setIsAuthReady(true);
            // Log to track authentication status
            console.log("Auth State Changed. User:", currentUser ? currentUser.uid : "null");

            if (currentUser) {
                // Save user data to Realtime Database if not exists
                const userRef = ref(realtimeDb, `artifacts/${appId}/users/${currentUser.uid}/profile`);
                try {
                    const snapshot = await get(userRef);

                    if (!snapshot.exists()) {
                        // New user or user data not yet saved
                        await set(userRef, {
                            uid: currentUser.uid,
                            displayName: currentUser.displayName,
                            email: currentUser.email,
                            photoURL: currentUser.photoURL,
                            role: 'user', // Default role
                            createdAt: Date.now(),
                        });
                        setUserRole('user');
                    } else {
                        // User exists, retrieve their role
                        setUserRole(snapshot.val().role || 'user');
                    }
                } catch (error) {
                    console.error("Error managing user profile in RealtimeDB:", error);
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
                        // Log to confirm progress data is loaded
                        console.log("User Level Progress Loaded:", progress);
                    } else {
                        setUserLevelProgress({});
                        console.log("No User Level Progress found.");
                    }
                    setIsUserProgressLoaded(true);
                    // Log to confirm isUserProgressLoaded is true
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
                setIsUserProgressLoaded(true); // This should make it true even when not logged in
                // Log to confirm isUserProgressLoaded is true even when not logged in
                console.log("isUserProgressLoaded set to TRUE (from !currentUser block)");
            }
        });

        return () => unsubscribe();
    }, [auth, realtimeDb, appId, currentLevelId]); // currentLevelId added to dependencies to re-listen for specific level stats

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
            return true; // Unlock all levels when not logged in
        }

        // The very first level is always unlocked (for logged-in users)
        if (levelId === 'thai-practice-1-1-1') {
            return true;
        }

        // Flatten all levels into a single array for easier lookup
        // Combine all levels from all languages, units, and sessions into a single array
        const allLevels = languages.flatMap(lang =>
            lang.units.flatMap(unit =>
                unit.sessions.flatMap(session => session.levels)
            )
        );

        const currentLevelIndex = allLevels.findIndex(level => level.id === levelId);

        // If the current level is not found, consider it locked (should not happen if levelId is correct)
        if (currentLevelIndex === -1) {
            return false;
        }

        // If it's the first level (currentLevelIndex === 0) and not 'thai-practice-1-1-1' (which is handled above),
        // or if there's no previous level (e.g., it's the first level of a session/unit/language that is not 'thai-practice-1-1-1'),
        // it should be locked.
        if (currentLevelIndex === 0) {
            return false; // The first level that is not 'thai-practice-1-1-1' should be locked
        }

        const previousLevel = allLevels[currentLevelIndex - 1];

        // Check if there is a previous level
        if (!previousLevel) {
            return false; // If no previous level, it indicates an issue or it's an unassigned first level
        }

        const previousLevelStats = userLevelProgress[previousLevel.id];
        const previousLevelPlayCount = previousLevelStats?.playCount || 0;
        const previousLevelScore = previousLevelStats?.score10Point || 0; // Get score for the previous level

        const requiredPlayCount = 3; // Required play count to unlock the next level
        const requiredScore = 5;    // Required score (out of 10) to unlock the next level

        // Return true if the previous level has been played the required number of times
        // AND achieved the required score
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
