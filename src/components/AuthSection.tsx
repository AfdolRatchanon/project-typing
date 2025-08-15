// src/components/AuthSection.tsx
// This component handles user authentication UI, including login, logout,
// user profile display, and toggling between the main game, admin dashboard,
// and user dashboard.

import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, User, LayoutDashboard, Gamepad2, BarChart2 } from 'lucide-react';

interface AuthSectionProps {
    isAuthReady: boolean;
    user: any; // Firebase User object
    userPhotoUrl: string | null;
    userRole: string | null;
    handleGoogleSignIn: () => Promise<void>;
    handleSignOut: () => Promise<void>;
    // New props for admin toggle
    showAdminDashboard: boolean;
    setShowAdminDashboard: React.Dispatch<React.SetStateAction<boolean>>;
    // New props for user dashboard toggle
    showUserDashboard: boolean;
    setShowUserDashboard: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * @component AuthSection
 * @description Displays user authentication status, login/logout buttons, and user info.
 * @param {AuthSectionProps} props - Props for AuthSection component.
 */
const AuthSection: React.FC<AuthSectionProps> = ({
    isAuthReady,
    user,
    userPhotoUrl,
    userRole,
    handleGoogleSignIn,
    handleSignOut,
    showAdminDashboard,
    setShowAdminDashboard,
    showUserDashboard,
    setShowUserDashboard,
}) => {
    // State to track if the user's photo failed to load
    const [imageError, setImageError] = useState(false);
    // State to control the visibility of the sign-out confirmation modal
    const [showConfirmSignOut, setShowConfirmSignOut] = useState(false);
    // State to track retry attempts
    const [retryCount, setRetryCount] = useState(0);

    // Reset the imageError state whenever userPhotoUrl changes
    useEffect(() => {
        if (userPhotoUrl) {
            setImageError(false);
            setRetryCount(0);
        }
    }, [userPhotoUrl]);

    // Function to handle image loading errors with minimal logging
    const handleImageError = () => {
        // Only log error once to avoid spam
        if (retryCount === 0) {
            console.info("Using fallback avatar - photo from cache may be temporarily unavailable");
        }

        setImageError(true);
        setRetryCount(prev => prev + 1);
    };

    // Function to handle the actual sign-out after confirmation
    const confirmSignOut = async () => {
        setShowConfirmSignOut(false);
        await handleSignOut();
    };

    // Function to cancel sign-out
    const cancelSignOut = () => {
        setShowConfirmSignOut(false);
    };

    // Function to render user avatar
    const renderUserAvatar = () => {
        // Show placeholder if no photo URL or if image failed to load
        if (!userPhotoUrl || imageError) {
            return (
                <div className="w-12 h-12 rounded-full border-2 border-indigo-300 bg-gradient-to-br from-indigo-100 to-purple-200 flex items-center justify-center shadow-sm">
                    <User size={20} className="text-indigo-600" />
                </div>
            );
        }

        return (
            <img
                src={userPhotoUrl}
                alt="User Avatar"
                className="w-12 h-12 rounded-full border-2 border-indigo-400 shadow-md object-cover"
                onError={handleImageError}
                loading="lazy"
            />
        );
    };
    
    // Toggle function for the User Dashboard
    const toggleUserDashboard = () => {
        setShowUserDashboard(prev => !prev);
        // Ensure other dashboards are closed
        if (!showUserDashboard) {
            setShowAdminDashboard(false);
        }
    };
    
    // Toggle function for the Admin Dashboard
    const toggleAdminDashboard = () => {
        setShowAdminDashboard(prev => !prev);
        // Ensure other dashboards are closed
        if (!showAdminDashboard) {
            setShowUserDashboard(false);
        }
    };

    return (
        <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {isAuthReady ? (
                user ? (
                    <div className="max-w-4xl mx-auto">
                        {/* Desktop Layout */}
                        <div className="hidden xl:block">
                            {/* User Info Section */}
                            <div className="flex items-center gap-3 mb-3">
                                {renderUserAvatar()}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                        {user.displayName || 'ผู้ใช้ Google'}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                                    <p className="text-xs text-indigo-600 font-medium">
                                        บทบาท: {userRole || 'กำลังโหลด...'}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons Section */}
                            <div className="flex items-center justify-center gap-3">
                                {userRole === 'admin' && (
                                    <button
                                        onClick={toggleAdminDashboard}
                                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-xl shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl hover:scale-105 text-sm"
                                    >
                                        {showAdminDashboard ? (
                                            <>
                                                <Gamepad2 size={16} /> หน้าเกม
                                            </>
                                        ) : (
                                            <>
                                                <LayoutDashboard size={16} /> แดชบอร์ด
                                            </>
                                        )}
                                    </button>
                                )}
                                <button
                                    onClick={toggleUserDashboard}
                                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-xl shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl hover:scale-105 text-sm"
                                >
                                    {showUserDashboard ? (
                                        <>
                                            <Gamepad2 size={16} /> หน้าเกม
                                        </>
                                    ) : (
                                        <>
                                            <BarChart2 size={16} /> สถิติของฉัน
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowConfirmSignOut(true)}
                                    className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-xl shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl hover:scale-105 text-sm"
                                >
                                    <LogOut size={16} /> ออกจากระบบ
                                </button>
                            </div>
                        </div>

                        {/* Mobile Layout */}
                        <div className="block xl:hidden">
                            <div className="flex items-center justify-between">
                                {/* User Info Section */}
                                <div className="flex items-center gap-3">
                                    {renderUserAvatar()}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                            {user.displayName || 'ผู้ใช้ Google'}
                                        </p>
                                        <p className="text-xs text-gray-600 truncate">{user.email}</p>
                                        <p className="text-xs text-indigo-600 font-medium">
                                            {userRole || 'กำลังโหลด...'}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons Section */}
                                <div className="flex items-center gap-2">
                                    {userRole === 'admin' && (
                                        <button
                                            onClick={toggleAdminDashboard}
                                            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-1.5 px-3 rounded-lg shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl text-xs"
                                        >
                                            {showAdminDashboard ? (
                                                <>
                                                    <Gamepad2 size={14} /> เกม
                                                </>
                                            ) : (
                                                <>
                                                    <LayoutDashboard size={14} /> แดช
                                                </>
                                            )}
                                        </button>
                                    )}
                                    <button
                                        onClick={toggleUserDashboard}
                                        className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700 text-white font-medium py-1.5 px-3 rounded-lg shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl text-xs"
                                    >
                                        {showUserDashboard ? (
                                            <>
                                                <Gamepad2 size={14} /> เกม
                                            </>
                                        ) : (
                                            <>
                                                <BarChart2 size={14} /> สถิติ
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowConfirmSignOut(true)}
                                        className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium py-1.5 px-3 rounded-lg shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl text-xs"
                                    >
                                        <LogOut size={14} /> ออก
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <button
                            onClick={handleGoogleSignIn}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl hover:scale-105 text-sm"
                        >
                            <LogIn size={18} /> เข้าสู่ระบบด้วย Google
                        </button>
                    </div>
                )
            ) : (
                <div className="flex justify-center">
                    <div className="flex items-center text-gray-500">
                        <User size={16} className="animate-pulse mr-2" />
                        <span className="text-sm">กำลังโหลดผู้ใช้...</span>
                    </div>
                </div>
            )}

            {/* Sign-out Confirmation Modal */}
            {showConfirmSignOut && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center transform transition-all duration-300 ease-out scale-100 border border-gray-100">
                        <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LogOut size={24} className="text-rose-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">ยืนยันการออกจากระบบ</h3>
                        <p className="text-gray-600 mb-6 text-sm">คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelSignOut}
                                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 rounded-lg transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={confirmSignOut}
                                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthSection;
