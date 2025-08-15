// src/components/UserDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Settings, User, BarChart, Gamepad2, Loader2, ChevronDown, ChevronUp, ChevronsDown, ChevronsUp, Target, Clock, LineChart } from 'lucide-react';
import { ref, onValue, off } from 'firebase/database';
import { realtimeDb } from '../firebase/firebaseConfig';
import { languages } from '../data/data';
import type {
    Language,
    Level
} from '../types/types';

// Define interfaces for user data and level stats to ensure type safety
interface LevelStats {
    wpm: number;
    accuracy: number;
    totalErrors: number;
    playCount: number;
    score10Point: number;
    grade: string;
    lastPlayed: number; // Timestamp
}

interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    role: string;
    createdAt: number;
}

interface UserData {
    profile: UserProfile;
    stats: { [levelId: string]: LevelStats };
}

interface UserDashboardProps {
    user: any; // Firebase User object
    setShowUserDashboard: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * @component UserDashboard
 * @description Displays the personal dashboard for the current user, showing their profile and typing statistics.
 * @param {UserDashboardProps} props - Props for UserDashboard component.
 */
const UserDashboard: React.FC<UserDashboardProps> = ({ user, setShowUserDashboard }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // States for expanding/collapsing sections
    const [expandedLanguages, setExpandedLanguages] = useState<{ [langId: string]: boolean }>({});
    const [expandedUnits, setExpandedUnits] = useState<{ [unitId: string]: boolean }>({});
    const [expandedSessions, setExpandedSessions] = useState<{ [sessionId: string]: boolean }>({});

    // State to manage image load error
    const [imageError, setImageError] = useState<boolean>(false);

    // Get appId safely from window object
    const appId = (window as any).__app_id || 'default-app-id';

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setError("คุณต้องเข้าสู่ระบบเพื่อดูแดชบอร์ดส่วนตัว");
            return;
        }

        setLoading(true);
        setError(null);

        // Reference to the current user's data in Realtime Database
        const userRef = ref(realtimeDb, `artifacts/${appId}/users/${user.uid}`);

        // Set up a listener for real-time data updates
        const unsubscribe = onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setUserData({
                    profile: data.profile || { uid: user.uid, displayName: 'N/A', email: 'N/A', role: 'user', createdAt: 0 },
                    stats: data.stats || {}
                });
            } else {
                setUserData({
                    profile: { uid: user.uid, displayName: user.displayName || 'N/A', email: user.email || 'N/A', role: 'user', createdAt: Date.now() },
                    stats: {}
                });
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching user data:", err);
            setError("เกิดข้อผิดพลาดในการดึงข้อมูลสถิติของคุณ");
            setLoading(false);
        });

        // Clean up the listener when the component unmounts
        return () => {
            off(userRef, 'value', unsubscribe);
        };
    }, [user, appId]); // Dependencies for useEffect

    /**
     * @function calculateOverallStats
     * @description Calculates overall average WPM, Accuracy, and Score for a given user across all levels.
     * @param {object} userStats - The stats object for a specific user.
     * @returns {object} - Object containing average WPM, Accuracy, Score, total errors, play count, levels completed, and overall completion percentage.
     */
    const calculateOverallStats = (userStats: { [levelId: string]: LevelStats }) => {
        let totalWpm = 0;
        let totalAccuracy = 0;
        let totalErrors = 0;
        let totalPlayCount = 0;
        let totalScore = 0;
        let levelsPlayedCount = 0;

        Object.values(userStats).forEach(stats => {
            totalWpm += stats.wpm;
            totalAccuracy += stats.accuracy;
            totalErrors += stats.totalErrors;
            totalPlayCount += stats.playCount;
            totalScore += stats.score10Point;
            levelsPlayedCount++;
        });

        // Calculate total available levels in the system
        let totalAvailableLevels = 0;
        languages.forEach(lang => {
            lang.units.forEach(unit => {
                unit.sessions.forEach(session => {
                    totalAvailableLevels += session.levels.length;
                });
            });
        });

        const overallCompletionPercentage = totalAvailableLevels > 0 ? ((levelsPlayedCount / totalAvailableLevels) * 100).toFixed(0) : '0';

        return {
            avgWpm: levelsPlayedCount > 0 ? (totalWpm / levelsPlayedCount).toFixed(1) : '0',
            avgAccuracy: levelsPlayedCount > 0 ? (totalAccuracy / levelsPlayedCount).toFixed(1) : '0',
            totalErrors,
            totalPlayCount,
            avgScore: levelsPlayedCount > 0 ? (totalScore / levelsPlayedCount).toFixed(1) : '0',
            levelsCompleted: levelsPlayedCount,
            overallCompletionPercentage: overallCompletionPercentage,
            totalAvailableLevels: totalAvailableLevels,
        };
    };

    /**
     * @function calculateGroupStats
     * @description Calculates average WPM, Accuracy, Score, and completion percentage for a given group of levels (e.g., Language, Unit, Session).
     * @param {Level[]} levelsInGroup - An array of Level objects belonging to the group.
     * @param {object} userStats - The stats object for a specific user.
     * @returns {object} - Object containing average WPM, Accuracy, Score, levels played, total levels in group, and completion percentage.
     */
    const calculateGroupStats = (levelsInGroup: Level[], userStats: { [levelId: string]: LevelStats }) => {
        let totalWpm = 0;
        let totalAccuracy = 0;
        let totalScore = 0;
        let playedLevelCount = 0;

        levelsInGroup.forEach(level => {
            const stats = userStats[level.id];
            if (stats) {
                totalWpm += stats.wpm;
                totalAccuracy += stats.accuracy;
                totalScore += stats.score10Point;
                playedLevelCount++;
            }
        });

        const totalLevelsInGroup = levelsInGroup.length;
        const completionPercentage = totalLevelsInGroup > 0 ? ((playedLevelCount / totalLevelsInGroup) * 100).toFixed(0) : '0';

        return {
            avgWpm: playedLevelCount > 0 ? (totalWpm / playedLevelCount).toFixed(1) : 'ไม่มีสถิติ',
            avgAccuracy: playedLevelCount > 0 ? (totalAccuracy / playedLevelCount).toFixed(1) : 'ไม่มีสถิติ',
            avgScore: playedLevelCount > 0 ? (totalScore / playedLevelCount).toFixed(1) : 'ไม่มีสถิติ',
            levelsPlayedInGroup: playedLevelCount,
            totalLevelsInGroup: totalLevelsInGroup,
            completionPercentage: completionPercentage,
        };
    };

    const toggleLanguage = (langId: string) => {
        setExpandedLanguages(prev => ({ ...prev, [langId]: !prev[langId] }));
    };

    const toggleUnit = (unitId: string) => {
        setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
    };

    const toggleSession = (sessionId: string) => {
        setExpandedSessions(prev => ({ ...prev, [sessionId]: !prev[sessionId] }));
    };

    // Global toggle function for all levels
    const toggleAll = (expand: boolean) => {
        const newExpandedLanguages: { [langId: string]: boolean } = {};
        const newExpandedUnits: { [unitId: string]: boolean } = {};
        const newExpandedSessions: { [sessionId: string]: boolean } = {};

        languages.forEach(lang => {
            newExpandedLanguages[lang.id] = expand;
            lang.units.forEach(unit => {
                newExpandedUnits[unit.id] = expand;
                unit.sessions.forEach(session => {
                    newExpandedSessions[session.id] = expand;
                });
            });
        });

        setExpandedLanguages(newExpandedLanguages);
        setExpandedUnits(newExpandedUnits);
        setExpandedSessions(newExpandedSessions);
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const overallStats = userData ? calculateOverallStats(userData.stats) : null;

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 font-inter">
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8 lg:p-10 text-center max-w-full w-full relative">
                {/* Button to go back to the game page */}
                <button
                    onClick={() => setShowUserDashboard(false)}
                    className="absolute top-4 right-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-sm"
                >
                    <Gamepad2 size={16} /> กลับไปหน้าเกม
                </button>

                <div className="flex items-center justify-center mb-6">
                    <User size={48} className="text-blue-600 mr-4" />
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                        แดชบอร์ดส่วนตัว
                    </h1>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-blue-500 mr-3" size={24} />
                        <span className="text-blue-500">กำลังโหลดข้อมูล...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">ข้อผิดพลาด:</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                {!loading && !error && userData && overallStats && (
                    <>
                        {/* Profile Section */}
                        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-md border border-gray-200">
                            <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                                <div className="flex-shrink-0">
                                    {user.photoURL && !imageError ? (
                                        <img
                                            src={user.photoURL}
                                            alt="User Profile"
                                            className="h-20 w-20 rounded-full border-4 border-white shadow-lg object-cover ring-2 ring-blue-100"
                                            onError={handleImageError}
                                        />
                                    ) : (
                                        <div className="h-20 w-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold ring-2 ring-blue-100 shadow-lg">
                                            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={24} />}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow text-center sm:text-left">
                                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{user.displayName || 'ผู้ใช้ไม่ระบุชื่อ'}</h3>
                                    <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                            <span className="font-medium">{user.email || 'ไม่ระบุ'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-md font-mono">{user.uid?.substring(0, 8)}...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Overall Stats Section */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 pb-2 text-left flex items-center gap-2">
                            <BarChart className="w-6 h-6 text-blue-500" />
                            สถิติโดยรวม
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 flex flex-col items-center justify-center border border-blue-200 hover:shadow-lg transition-shadow">
                                <BarChart size={36} className="text-blue-500 mb-3" />
                                <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">คะแนนเฉลี่ย</span>
                                <span className="text-3xl font-bold text-blue-600 mt-1">{overallStats.avgScore}</span>
                                <span className="text-xs text-gray-500">จาก 10</span>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 flex flex-col items-center justify-center border border-green-200 hover:shadow-lg transition-shadow">
                                <Clock size={36} className="text-green-500 mb-3" />
                                <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">WPM เฉลี่ย</span>
                                <span className="text-3xl font-bold text-green-600 mt-1">{overallStats.avgWpm}</span>
                                <span className="text-xs text-gray-500">คำต่อนาที</span>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 flex flex-col items-center justify-center border border-purple-200 hover:shadow-lg transition-shadow">
                                <Target size={36} className="text-purple-500 mb-3" />
                                <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">ความแม่นยำเฉลี่ย</span>
                                <span className="text-3xl font-bold text-purple-600 mt-1">{overallStats.avgAccuracy}%</span>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${overallStats.avgAccuracy}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-md p-6 flex flex-col items-center justify-center border border-orange-200 hover:shadow-lg transition-shadow">
                                <LineChart size={36} className="text-orange-500 mb-3" />
                                <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">ระดับที่เล่นแล้ว</span>
                                <span className="text-3xl font-bold text-orange-600 mt-1">{overallStats.levelsCompleted}</span>
                                <span className="text-xs text-gray-500">จาก {overallStats.totalAvailableLevels} ระดับ</span>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-md p-6 flex flex-col items-center justify-center border border-indigo-200 hover:shadow-lg transition-shadow">
                                <svg className="w-9 h-9 text-indigo-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">ความคืบหน้า</span>
                                <span className="text-3xl font-bold text-indigo-600 mt-1">{overallStats.overallCompletionPercentage}%</span>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${overallStats.overallCompletionPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Stats Section */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 pb-2 text-left flex items-center gap-2">
                            <Settings className="w-6 h-6 text-blue-500" />
                            สถิติรายละเอียด
                        </h2>

                        {/* Toggle All Controls */}
                        <div className="flex justify-end gap-2 mb-6">
                            <button
                                onClick={() => toggleAll(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                <ChevronsDown size={16} /> ขยายทั้งหมด
                            </button>
                            <button
                                onClick={() => toggleAll(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                <ChevronsUp size={16} /> ยุบทั้งหมด
                            </button>
                        </div>

                        <div className="text-left">
                            {languages.map((language: Language) => {
                                const languageLevels = language.units.flatMap(unit => unit.sessions.flatMap(session => session.levels));
                                const langStats = calculateGroupStats(languageLevels, userData.stats);

                                return (
                                    <div key={language.id} className="mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                        <button
                                            onClick={() => toggleLanguage(language.id)}
                                            className="w-full flex items-center justify-between p-3 font-semibold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-left"
                                        >
                                            <span className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                {language.name}
                                                <span className="ml-2 text-sm text-gray-600 font-normal bg-blue-50 px-2 py-1 rounded-md">
                                                    WPM: {langStats.avgWpm}, ความแม่นยำ: {langStats.avgAccuracy}%, คะแนน: {langStats.avgScore}, เล่นแล้ว: {langStats.levelsPlayedInGroup}/{langStats.totalLevelsInGroup} ({langStats.completionPercentage}%)
                                                </span>
                                            </span>
                                            {expandedLanguages[language.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                        {expandedLanguages[language.id] && (
                                            <div className="ml-4 mt-3">
                                                {language.units.map(unit => {
                                                    const unitLevels = unit.sessions.flatMap(session => session.levels);
                                                    const unitStats = calculateGroupStats(unitLevels, userData.stats);
                                                    return (
                                                        <div key={unit.id} className="mb-3 bg-purple-50 p-3 rounded-lg border border-purple-100">
                                                            <button
                                                                onClick={() => toggleUnit(unit.id)}
                                                                className="w-full flex items-center justify-between p-2 font-medium text-purple-700 hover:bg-purple-100 rounded-md transition-colors text-left"
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                                    {unit.name}
                                                                    <span className="ml-2 text-sm text-gray-600 font-normal bg-purple-100 px-2 py-0.5 rounded">
                                                                        WPM: {unitStats.avgWpm}, ความแม่นยำ: {unitStats.avgAccuracy}%, คะแนน: {unitStats.avgScore}, เล่นแล้ว: {unitStats.levelsPlayedInGroup}/{unitStats.totalLevelsInGroup} ({unitStats.completionPercentage}%)
                                                                    </span>
                                                                </span>
                                                                {expandedUnits[unit.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                            </button>
                                                            {expandedUnits[unit.id] && (
                                                                <div className="ml-4 mt-2">
                                                                    {unit.sessions.map(session => {
                                                                        const sessionLevels = session.levels;
                                                                        const sessStats = calculateGroupStats(sessionLevels, userData.stats);
                                                                        return (
                                                                            <div key={session.id} className="mb-2 bg-green-50 p-3 rounded-lg border border-green-100">
                                                                                <button
                                                                                    onClick={() => toggleSession(session.id)}
                                                                                    className="w-full flex items-center justify-between p-2 font-normal text-green-700 hover:bg-green-100 rounded-md transition-colors text-left"
                                                                                >
                                                                                    <span className="flex items-center gap-2">
                                                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                                                        {session.name}
                                                                                        <span className="ml-2 text-sm text-gray-600 font-normal bg-green-100 px-2 py-0.5 rounded">
                                                                                            WPM: {sessStats.avgWpm}, ความแม่นยำ: {sessStats.avgAccuracy}%, คะแนน: {sessStats.avgScore}, เล่นแล้ว: {sessStats.levelsPlayedInGroup}/{sessStats.totalLevelsInGroup} ({sessStats.completionPercentage}%)
                                                                                        </span>
                                                                                    </span>
                                                                                    {expandedSessions[session.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                                                </button>
                                                                                {expandedSessions[session.id] && (
                                                                                    <div className="ml-4 mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                                                        {session.levels.map(level => {
                                                                                            const stats = userData.stats[level.id];
                                                                                            return (
                                                                                                <div key={level.id} className={`p-4 rounded-lg shadow-sm border-2 transition-all duration-200 ${stats
                                                                                                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md'
                                                                                                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 opacity-75'
                                                                                                    }`}>
                                                                                                    <h6 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                                                                                                        <div className={`w-2 h-2 rounded-full ${stats ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                                                                        {level.name}
                                                                                                    </h6>
                                                                                                    {stats ? (
                                                                                                        <div className="text-xs text-gray-700 space-y-1">
                                                                                                            <div className="flex justify-between">
                                                                                                                <span>ความแม่นยำ:</span>
                                                                                                                <span className="font-bold text-emerald-600">{stats.accuracy}%</span>
                                                                                                            </div>
                                                                                                            <div className="flex justify-between">
                                                                                                                <span>ข้อผิดพลาด:</span>
                                                                                                                <span className="font-bold text-red-600">{stats.totalErrors}</span>
                                                                                                            </div>
                                                                                                            <div className="flex justify-between">
                                                                                                                <span>คะแนน:</span>
                                                                                                                <span className="font-bold text-pink-600">{stats.score10Point}/10</span>
                                                                                                            </div>
                                                                                                            <div className="flex justify-between">
                                                                                                                <span>เกรด:</span>
                                                                                                                <span className="font-bold text-indigo-600">{stats.grade}</span>
                                                                                                            </div>
                                                                                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                                                                                <div className="text-xs text-gray-500">เล่นล่าสุด: {new Date(stats.lastPlayed).toLocaleDateString('th-TH')}</div>
                                                                                                                <div className="mt-1">
                                                                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                                                                        </svg>
                                                                                                                        เล่นแล้ว
                                                                                                                    </span>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ) : (
                                                                                                        <div className="text-center py-3">
                                                                                                            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                                                            </svg>
                                                                                                            <div className="text-xs text-gray-500 italic font-medium">ยังไม่ได้เล่น</div>
                                                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                                                                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                                                                </svg>
                                                                                                                รอเล่น
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary Section */}
                        {overallStats.levelsCompleted === 0 && (
                            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-lg font-bold text-yellow-800">เริ่มต้นการเดินทาง</h3>
                                </div>
                                <p className="text-yellow-700 text-sm">
                                    ยังไม่มีสถิติการเล่น เริ่มเล่นเกมพิมพ์ดีดเพื่อดูความคืบหน้าของคุณ!
                                </p>
                            </div>
                        )}

                        {overallStats.levelsCompleted > 0 && (
                            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-lg font-bold text-green-800">สรุปผลงาน</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="font-bold text-green-700">{overallStats.totalPlayCount}</div>
                                        <div className="text-gray-600">ครั้งที่เล่น</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-red-700">{overallStats.totalErrors}</div>
                                        <div className="text-gray-600">ข้อผิดพลาดรวม</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-blue-700">{overallStats.levelsCompleted}</div>
                                        <div className="text-gray-600">ระดับที่ผ่าน</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-purple-700">{overallStats.overallCompletionPercentage}%</div>
                                        <div className="text-gray-600">ความคืบหน้า</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {!loading && !error && !userData && (
                    <div className="text-center py-8">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">ไม่พบข้อมูลผู้ใช้</p>
                        <p className="text-gray-400 text-sm mt-1">กรุณาลองใหม่อีกครั้ง</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
