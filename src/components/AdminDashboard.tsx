// src/components/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Settings, Users, BarChart, Gamepad2, Loader2, ChevronDown, ChevronUp, ChevronsDown, ChevronsUp, User } from 'lucide-react';
import { ref, onValue, off } from 'firebase/database';
import { realtimeDb } from '../firebase/firebaseConfig';
import { languages } from '../data/data';
import type {
    // Language, Unit, Session, 
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

interface AdminDashboardProps {
    user: any; // Firebase User object
    userRole: string | null;
    setShowAdminDashboard: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * @component AdminDashboard
 * @description Displays the dashboard interface for admin users, including user management and statistics.
 * @param {AdminDashboardProps} props - Props for AdminDashboard component.
 */
const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, userRole, setShowAdminDashboard }) => {
    const [allUsersData, setAllUsersData] = useState<{ [uid: string]: UserData }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    // States for expanding/collapsing sections within user details
    const [expandedLanguages, setExpandedLanguages] = useState<{ [langId: string]: boolean }>({});
    const [expandedUnits, setExpandedUnits] = useState<{ [unitId: string]: boolean }>({});
    const [expandedSessions, setExpandedSessions] = useState<{ [sessionId: string]: boolean }>({});

    // State to manage image load errors for all users
    // This maps userId to a boolean indicating if their image failed to load
    const [userImageErrors, setUserImageErrors] = useState<{ [uid: string]: boolean }>({});

    // Filter states
    const [filterDisplayName, setFilterDisplayName] = useState<string>('');
    const [filterEmail, setFilterEmail] = useState<string>('');
    const [filterRole, setFilterRole] = useState<string>('all'); // 'all', 'admin', 'user'

    // Sort states
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Get appId safely from window object
    const appId = (window as any).__app_id || 'default-app-id';

    useEffect(() => {
        if (!user || userRole !== 'admin') {
            setLoading(false);
            setError("คุณไม่มีสิทธิ์เข้าถึงหน้าผู้ดูแลระบบ");
            return;
        }

        setLoading(true);
        setError(null);

        // Reference to the users data in Realtime Database
        const usersRef = ref(realtimeDb, `artifacts/${appId}/users`);

        // Set up a listener for real-time data updates
        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const users = snapshot.val();
                const loadedUsersData: { [uid: string]: UserData } = {};
                const initialImageErrors: { [uid: string]: boolean } = {};

                Object.keys(users).forEach(uid => {
                    const userData = users[uid];
                    loadedUsersData[uid] = {
                        profile: userData.profile || { uid, displayName: 'N/A', email: 'N/A', role: 'user', createdAt: 0 },
                        stats: userData.stats || {}
                    };
                    // Preserve existing error state or set to false for new users
                    initialImageErrors[uid] = userImageErrors[uid] || false;
                });
                setAllUsersData(loadedUsersData);
                setUserImageErrors(initialImageErrors);
            } else {
                setAllUsersData({});
                setUserImageErrors({}); // Clear errors if no users
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching all users data:", err);
            setError("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้");
            setLoading(false);
        });

        // Clean up the listener when the component unmounts
        return () => {
            off(usersRef, 'value', unsubscribe);
        };
    }, [user, userRole, appId]); // Dependencies for useEffect

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
            avgWpm: levelsPlayedCount > 0 ? (totalWpm / levelsPlayedCount).toFixed(1) : 'N/A',
            avgAccuracy: levelsPlayedCount > 0 ? (totalAccuracy / levelsPlayedCount).toFixed(1) : 'N/A',
            totalErrors,
            totalPlayCount,
            avgScore: levelsPlayedCount > 0 ? (totalScore / levelsPlayedCount).toFixed(1) : 'N/A',
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

    // Function to toggle individual user's detailed view
    const toggleUserExpansion = (uid: string) => {
        setExpandedUser(prevUid => (prevUid === uid ? null : uid));
        // Reset all language/unit/session expansions when a new user is expanded
        setExpandedLanguages({});
        setExpandedUnits({});
        setExpandedSessions({});
    };

    // Toggle functions for language, unit, session
    const toggleLanguage = (langId: string) => {
        setExpandedLanguages(prev => ({ ...prev, [langId]: !prev[langId] }));
    };

    const toggleUnit = (unitId: string) => {
        setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
    };

    const toggleSession = (sessionId: string) => {
        setExpandedSessions(prev => ({ ...prev, [sessionId]: !prev[sessionId] }));
    };

    // Global toggle function for all levels within an expanded user
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

    // Function to handle column sorting
    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Filtered users based on search criteria
    const filteredUsers = Object.entries(allUsersData).filter(([_uid, userData]) => {
        const displayNameMatch = userData.profile.displayName?.toLowerCase().includes(filterDisplayName.toLowerCase());
        const emailMatch = userData.profile.email?.toLowerCase().includes(filterEmail.toLowerCase());
        const roleMatch = filterRole === 'all' || userData.profile.role === filterRole;

        return displayNameMatch && emailMatch && roleMatch;
    }).sort(([, a], [, b]) => { // Apply sorting here
        if (!sortColumn) return 0;

        let valueA: any;
        let valueB: any;

        const statsA = calculateOverallStats(a.stats);
        const statsB = calculateOverallStats(b.stats);

        switch (sortColumn) {
            case 'displayName':
                valueA = a.profile.displayName || '';
                valueB = b.profile.displayName || '';
                break;
            case 'email':
                valueA = a.profile.email || '';
                valueB = b.profile.email || '';
                break;
            case 'role':
                valueA = a.profile.role || '';
                valueB = b.profile.role || '';
                break;
            case 'avgWpm':
                valueA = parseFloat(statsA.avgWpm as string) || 0;
                valueB = parseFloat(statsB.avgWpm as string) || 0;
                break;
            case 'avgAccuracy':
                valueA = parseFloat(statsA.avgAccuracy as string) || 0;
                valueB = parseFloat(statsB.avgAccuracy as string) || 0;
                break;
            case 'levelsCompleted':
                valueA = statsA.levelsCompleted || 0;
                valueB = statsB.levelsCompleted || 0;
                break;
            case 'avgScore':
                valueA = parseFloat(statsA.avgScore as string) || 0;
                valueB = parseFloat(statsB.avgScore as string) || 0;
                break;
            case 'overallCompletionPercentage':
                valueA = parseFloat(statsA.overallCompletionPercentage as string) || 0;
                valueB = parseFloat(statsB.overallCompletionPercentage as string) || 0;
                break;
            case 'createdAt':
                valueA = a.profile.createdAt || 0;
                valueB = b.profile.createdAt || 0;
                break;
            default:
                return 0;
        }

        if (valueA < valueB) {
            return sortDirection === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
            return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // Helper to render sort icon
    const renderSortIcon = (column: string) => {
        if (sortColumn === column) {
            return sortDirection === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />;
        }
        return null;
    };


    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 font-inter">
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8 lg:p-10 text-center max-w-full w-full relative">
                {/* Button to go back to the game page */}
                <button
                    onClick={() => setShowAdminDashboard(false)}
                    className="absolute top-4 right-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-sm"
                >
                    <Gamepad2 size={16} /> กลับไปหน้าเกม
                </button>

                <div className="flex items-center justify-center mb-6">
                    <Settings size={48} className="text-blue-600 mr-4" />
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                        Admin Dashboard
                    </h1>
                </div>
                {/* <p className="text-lg text-gray-700 mb-4">
                    ยินดีต้อนรับ, <span className="font-semibold text-blue-700">{user?.displayName || 'ผู้ดูแลระบบ'}</span>!
                </p>
                <p className="text-md text-gray-600 mb-8">
                    คุณเข้าสู่ระบบในฐานะ <span className="font-bold text-purple-700">{userRole}</span>.
                    หน้านี้สำหรับจัดการระบบ
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
                    <div className="bg-blue-50 p-4 sm:p-6 rounded-lg shadow-md border border-blue-200 flex items-center justify-center flex-col">
                        <Users size={32} className="text-blue-500 mb-3" />
                        <h3 className="text-lg font-semibold text-blue-800">การจัดการผู้ใช้</h3>
                        <p className="text-sm text-gray-600 mt-2">
                            จัดการบัญชีผู้ใช้, บทบาท, และความคืบหน้า
                        </p>
                    </div>
                    <div className="bg-purple-50 p-4 sm:p-6 rounded-lg shadow-md border border-purple-200 flex items-center justify-center flex-col">
                        <BarChart size={32} className="text-purple-500 mb-3" />
                        <h3 className="text-lg font-semibold text-purple-800">รายงานและสถิติ</h3>
                        <p className="text-sm text-gray-600 mt-2">
                            ดูข้อมูลสถิติการใช้งานและประสิทธิภาพของระบบ
                        </p>
                    </div>
                </div> */}

                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 pb-2">
                    สถิติผู้ใช้ทั้งหมด
                </h2>

                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-blue-500 mr-3" size={24} />
                        <span className="text-blue-500">กำลังโหลดข้อมูลผู้ใช้...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">ข้อผิดพลาด:</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                {!loading && !error && (
                    <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-md border border-blue-100/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-blue-500 rounded-lg shadow-sm">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ตัวกรองผู้ใช้
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="group">
                                <label htmlFor="filterDisplayName" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
                                    <User className="w-3 h-3 text-blue-500" />
                                    ชื่อที่แสดง
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="filterDisplayName"
                                        className="block w-full rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ease-in-out text-sm p-2.5 placeholder:text-gray-400 group-hover:border-blue-300"
                                        value={filterDisplayName}
                                        onChange={(e) => setFilterDisplayName(e.target.value)}
                                        placeholder="ค้นหาจากชื่อ..."
                                    />
                                    {filterDisplayName && (
                                        <button
                                            onClick={() => setFilterDisplayName('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                                        >
                                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="group">
                                <label htmlFor="filterEmail" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
                                    <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                    อีเมล
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="filterEmail"
                                        className="block w-full rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 ease-in-out text-sm p-2.5 placeholder:text-gray-400 group-hover:border-purple-300"
                                        value={filterEmail}
                                        onChange={(e) => setFilterEmail(e.target.value)}
                                        placeholder="ค้นหาจากอีเมล..."
                                    />
                                    {filterEmail && (
                                        <button
                                            onClick={() => setFilterEmail('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                                        >
                                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="group">
                                <label htmlFor="filterRole" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
                                    <Settings className="w-3 h-3 text-indigo-500" />
                                    บทบาท
                                </label>
                                <div className="relative">
                                    <select
                                        id="filterRole"
                                        className="block w-full rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 ease-in-out text-sm p-2.5 appearance-none cursor-pointer group-hover:border-indigo-300"
                                        value={filterRole}
                                        onChange={(e) => setFilterRole(e.target.value)}
                                    >
                                        <option value="all">ทั้งหมด</option>
                                        <option value="admin">ผู้ดูแลระบบ</option>
                                        <option value="user">ผู้ใช้</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* แสดงสถิติการกรอง */}
                        <div className="mt-4 pt-4 border-t border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                    <span className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        แสดงผล: <span className="font-semibold text-blue-600">{filteredUsers.length}</span> ผู้ใช้
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                        ทั้งหมด: <span className="font-semibold text-gray-700">{Object.keys(allUsersData).length}</span> ผู้ใช้
                                    </span>
                                </div>

                                {(filterDisplayName || filterEmail || filterRole !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setFilterDisplayName('');
                                            setFilterEmail('');
                                            setFilterRole('all');
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-xs font-medium"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        รีเซ็ต
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!loading && !error && Object.keys(allUsersData).length === 0 && (
                    <p className="text-gray-600 text-center py-8">
                        ไม่พบข้อมูลผู้ใช้
                    </p>
                )}

                {!loading && !error && Object.keys(allUsersData).length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Header ตาราง */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <BarChart className="w-5 h-5 text-blue-500" />
                                รายชื่อผู้ใช้และสถิติ
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    {filteredUsers.length} ผู้ใช้
                                </span>
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <tr>
                                        <th scope="col" className="group px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-colors duration-200" onClick={() => handleSort('displayName')}>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-blue-500" />
                                                <span>ผู้ใช้</span>
                                                {renderSortIcon('displayName')}
                                            </div>
                                        </th>
                                        <th scope="col" className="group px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100 transition-colors duration-200" onClick={() => handleSort('email')}>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                </svg>
                                                <span>อีเมล</span>
                                                {renderSortIcon('email')}
                                            </div>
                                        </th>
                                        <th scope="col" className="group px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-green-100 transition-colors duration-200" onClick={() => handleSort('role')}>
                                            <div className="flex items-center gap-2">
                                                <Settings className="w-4 h-4 text-green-500" />
                                                <span>บทบาท</span>
                                                {renderSortIcon('role')}
                                            </div>
                                        </th>
                                        <th scope="col" className="group px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-orange-100 transition-colors duration-200" onClick={() => handleSort('avgWpm')}>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                <span>WPM เฉลี่ย</span>
                                                {renderSortIcon('avgWpm')}
                                            </div>
                                        </th>
                                        <th scope="col" className="group px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-emerald-100 transition-colors duration-200" onClick={() => handleSort('avgAccuracy')}>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>ความแม่นยำ</span>
                                                {renderSortIcon('avgAccuracy')}
                                            </div>
                                        </th>
                                        <th scope="col" className="group px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-teal-100 transition-colors duration-200" onClick={() => handleSort('levelsCompleted')}>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                <span>ด่านที่เล่น</span>
                                                {renderSortIcon('levelsCompleted')}
                                            </div>
                                        </th>
                                        <th scope="col" className="group px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-pink-100 transition-colors duration-200" onClick={() => handleSort('avgScore')}>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                                <span>คะแนนเฉลี่ย</span>
                                                {renderSortIcon('avgScore')}
                                            </div>
                                        </th>
                                        <th scope="col" className="group px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-100 transition-colors duration-200" onClick={() => handleSort('overallCompletionPercentage')}>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                <span>ความคืบหน้า</span>
                                                {renderSortIcon('overallCompletionPercentage')}
                                            </div>
                                        </th>
                                        <th scope="col" className="group px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200" onClick={() => handleSort('createdAt')}>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>สมัครเมื่อ</span>
                                                {renderSortIcon('createdAt')}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map(([uid, userData]) => {
                                            const overallStats = calculateOverallStats(userData.stats);

                                            const handleImageError = () => {
                                                setUserImageErrors(prevErrors => ({
                                                    ...prevErrors,
                                                    [uid]: true
                                                }));
                                            };

                                            return (
                                                <React.Fragment key={uid}>
                                                    <tr
                                                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-blue-400"
                                                        onClick={() => toggleUserExpansion(uid)}
                                                    >
                                                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            <div className="flex items-center">
                                                                {userData.profile.photoURL && !userImageErrors[uid] ? (
                                                                    <img
                                                                        src={userData.profile.photoURL}
                                                                        alt={userData.profile.displayName || 'User'}
                                                                        className="h-10 w-10 rounded-full mr-3 object-cover flex-shrink-0 ring-2 ring-blue-100"
                                                                        onError={handleImageError}
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-full mr-3 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-blue-100">
                                                                        {userData.profile.displayName ? userData.profile.displayName.charAt(0).toUpperCase() : <User size={18} />}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div className="text-sm font-bold text-gray-900">{userData.profile.displayName || 'ไม่มีชื่อ'}</div>
                                                                    <div className="text-xs text-left text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-mono">{uid.substring(0, 8)}...</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                                                            <div className="flex items-center">
                                                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                                </svg>
                                                                <span className="truncate max-w-xs">{userData.profile.email || 'ไม่มีอีเมล'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-sm">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${userData.profile.role === 'admin'
                                                                ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 ring-1 ring-purple-300'
                                                                : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 ring-1 ring-green-300'
                                                                }`}>
                                                                {userData.profile.role === 'admin' ? (
                                                                    <Settings className="w-3 h-3 mr-1" />
                                                                ) : (
                                                                    <User className="w-3 h-3 mr-1" />
                                                                )}
                                                                {userData.profile.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-sm">
                                                            <div className="flex items-center">
                                                                <div className="flex-1">
                                                                    <div className="text-lg font-bold text-orange-600">{overallStats.avgWpm}</div>
                                                                    <div className="text-xs text-gray-500">คำต่อนาที</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-sm">
                                                            <div className="flex items-center">
                                                                <div className="flex-1">
                                                                    <div className="text-lg font-bold text-emerald-600">{overallStats.avgAccuracy}%</div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                                        <div
                                                                            className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-300"
                                                                            style={{ width: `${overallStats.avgAccuracy === 'N/A' ? 0 : overallStats.avgAccuracy}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-sm">
                                                            <div className="flex items-center">
                                                                <div className="flex-1">
                                                                    <div className="text-lg font-bold text-teal-600">{overallStats.levelsCompleted}</div>
                                                                    <div className="text-xs text-gray-500">ด่าน</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-sm">
                                                            <div className="flex items-center">
                                                                <div className="flex-1">
                                                                    <div className="text-lg font-bold text-pink-600">{overallStats.avgScore}</div>
                                                                    <div className="text-xs text-gray-500">จาก 10</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-sm">
                                                            <div className="flex items-center">
                                                                <div className="flex-1">
                                                                    <div className="text-lg font-bold text-indigo-600">{overallStats.overallCompletionPercentage}%</div>
                                                                    <div className="text-xs text-gray-500">({overallStats.levelsCompleted}/{overallStats.totalAvailableLevels})</div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                                        <div
                                                                            className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                                                            style={{ width: `${overallStats.overallCompletionPercentage}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                                                            <div className="flex items-center">
                                                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                <div>
                                                                    <div className="font-medium">{new Date(userData.profile.createdAt).toLocaleDateString('th-TH')}</div>
                                                                    <div className="text-xs text-gray-400">{new Date(userData.profile.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {expandedUser === uid && (
                                                        <tr>
                                                            <td colSpan={9} className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 border-l-4 border-blue-400">
                                                                <div className="flex justify-end gap-2 mb-4">
                                                                    <button
                                                                        onClick={() => toggleAll(true)}
                                                                        className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md"
                                                                    >
                                                                        <ChevronsDown size={16} /> ขยายทั้งหมด
                                                                    </button>
                                                                    <button
                                                                        onClick={() => toggleAll(false)}
                                                                        className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md"
                                                                    >
                                                                        <ChevronsUp size={16} /> ยุบทั้งหมด
                                                                    </button>
                                                                </div>
                                                                <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                                                    <BarChart className="w-5 h-5 text-blue-500" />
                                                                    สถิติรายด่านสำหรับ {userData.profile.displayName || 'ผู้ใช้'}
                                                                </h4>
                                                                {languages.map(language => {
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
                                                                                                                                                    <span>WPM:</span>
                                                                                                                                                    <span className="font-bold text-orange-600">{stats.wpm}</span>
                                                                                                                                                </div>
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
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <p className="text-gray-500 text-lg font-medium">ไม่พบผู้ใช้ที่ตรงกับตัวกรอง</p>
                                                    <p className="text-gray-400 text-sm mt-1">ลองปรับเปลี่ยนเงื่อนไขการค้นหา</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
