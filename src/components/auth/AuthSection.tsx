// src/components/AuthSection.tsx
// This component handles user authentication UI, including login, logout,
// user profile display, and toggling between the main game, admin dashboard,
// and user dashboard.

import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, User, LayoutDashboard, Gamepad2, BarChart2, School, UserCog } from 'lucide-react';

interface AuthSectionProps {
    isAuthReady: boolean;
    user: any;
    userPhotoUrl: string | null;
    userRole: string | null;
    isGuestMode?: boolean;
    handleGoogleSignIn: () => Promise<void>;
    handleSignOut: () => Promise<void>;
    showAdminDashboard: boolean;
    setShowAdminDashboard: (value: boolean) => void;
    showUserDashboard: boolean;
    setShowUserDashboard: (value: boolean) => void;
    onGoToClassroom?: () => void; // navigate to /teacher or /my-classroom
    onGoToProfile?: () => void;   // navigate to /profile
    pendingClassroomCount?: number; // D1 — pending tests/exams badge
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
    isGuestMode = false,
    handleGoogleSignIn,
    handleSignOut,
    showAdminDashboard,
    setShowAdminDashboard,
    showUserDashboard,
    setShowUserDashboard,
    onGoToClassroom,
    onGoToProfile,
    pendingClassroomCount = 0,
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
        setShowUserDashboard(!showUserDashboard);
        // Ensure other dashboards are closed
        if (!showUserDashboard) {
            setShowAdminDashboard(false);
        }
    };
    
    // Toggle function for the Admin Dashboard
    const toggleAdminDashboard = () => {
        setShowAdminDashboard(!showAdminDashboard);
        // Ensure other dashboards are closed
        if (!showAdminDashboard) {
            setShowUserDashboard(false);
        }
    };

    return (
        <div className="p-4" style={{
            borderBottom: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)',
            background: 'var(--color-sidebar-hover, var(--color-sidebar))',
        }}>
            {isAuthReady ? (
                user ? (
                    <div className="max-w-4xl mx-auto">
                        {/* Desktop Layout */}
                        <div className="hidden xl:block">
                            {/* User Info */}
                            <div className="flex items-center gap-3 mb-3">
                                {renderUserAvatar()}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-sidebar-text)' }}>
                                        {user.displayName || 'ผู้ใช้ Google'}
                                    </p>
                                    <p className="text-xs truncate" style={{ color: 'var(--color-sidebar-muted, #94A3B8)' }}>{user.email}</p>
                                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded mt-0.5 inline-block"
                                        style={{ background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)', color: 'var(--color-accent)' }}>
                                        {userRole || '...'}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                {(userRole === 'superAdmin' || userRole === 'admin') && (
                                    <button onClick={toggleAdminDashboard}
                                        className="flex items-center gap-1.5 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-all hover:opacity-90 hover:scale-105"
                                        style={{ background: 'var(--color-primary)' }}>
                                        {showAdminDashboard ? <><Gamepad2 size={13} /> หน้าเกม</> : <><LayoutDashboard size={13} /> แดชบอร์ด</>}
                                    </button>
                                )}
                                {onGoToClassroom && (
                                    <button onClick={onGoToClassroom}
                                        className="relative flex items-center gap-1.5 font-medium py-1.5 px-3 rounded-lg text-xs transition-all hover:opacity-90 hover:scale-105 text-white"
                                        style={{ background: (userRole === 'teacher' || userRole === 'superAdmin') ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-primary) 70%, var(--color-accent))' }}>
                                        <School size={13} />
                                        {(userRole === 'teacher' || userRole === 'superAdmin') ? 'จัดการห้อง' : 'ห้องเรียน'}
                                        {pendingClassroomCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-white text-[10px] font-bold px-1"
                                                style={{ background: 'var(--color-error)' }}>
                                                {pendingClassroomCount > 9 ? '9+' : pendingClassroomCount}
                                            </span>
                                        )}
                                    </button>
                                )}
                                <button onClick={toggleUserDashboard}
                                    className="flex items-center gap-1.5 font-medium py-1.5 px-3 rounded-lg text-xs transition-all hover:opacity-90 hover:scale-105"
                                    style={{ background: 'var(--color-accent)', color: 'var(--color-sidebar)' }}>
                                    {showUserDashboard ? <><Gamepad2 size={13} /> หน้าเกม</> : <><BarChart2 size={13} /> สถิติของฉัน</>}
                                </button>
                                {onGoToProfile && (
                                    <button onClick={onGoToProfile}
                                        className="flex items-center gap-1.5 font-medium py-1.5 px-3 rounded-lg text-xs transition-all hover:opacity-90 hover:scale-105"
                                        style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                                        <UserCog size={13} /> โปรไฟล์
                                    </button>
                                )}
                                <button onClick={() => setShowConfirmSignOut(true)}
                                    className="flex items-center gap-1.5 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-all hover:opacity-90 hover:scale-105"
                                    style={{ background: 'var(--color-error)' }}>
                                    <LogOut size={13} /> ออก
                                </button>
                            </div>
                        </div>

                        {/* Mobile Layout */}
                        <div className="block xl:hidden">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {renderUserAvatar()}
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-sidebar-text)' }}>
                                            {user.displayName || 'ผู้ใช้ Google'}
                                        </p>
                                        <span className="text-xs font-medium px-1.5 py-0.5 rounded inline-block"
                                            style={{ background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)', color: 'var(--color-accent)' }}>
                                            {userRole || '...'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {(userRole === 'superAdmin' || userRole === 'admin') && (
                                        <button onClick={toggleAdminDashboard}
                                            className="flex items-center gap-1 text-white font-medium py-1.5 px-2.5 rounded-lg text-xs transition-all hover:opacity-90"
                                            style={{ background: 'var(--color-primary)' }}>
                                            {showAdminDashboard ? <><Gamepad2 size={12} /> เกม</> : <><LayoutDashboard size={12} /> แดช</>}
                                        </button>
                                    )}
                                    {onGoToClassroom && (
                                        <button onClick={onGoToClassroom}
                                            className="flex items-center gap-1 text-white font-medium py-1.5 px-2.5 rounded-lg text-xs transition-all hover:opacity-90"
                                            style={{ background: 'color-mix(in srgb, var(--color-primary) 70%, var(--color-accent))' }}>
                                            <School size={12} /> ห้อง
                                        </button>
                                    )}
                                    <button onClick={toggleUserDashboard}
                                        className="flex items-center gap-1 font-medium py-1.5 px-2.5 rounded-lg text-xs transition-all hover:opacity-90"
                                        style={{ background: 'var(--color-accent)', color: 'var(--color-sidebar)' }}>
                                        {showUserDashboard ? <><Gamepad2 size={12} /> เกม</> : <><BarChart2 size={12} /> สถิติ</>}
                                    </button>
                                    {onGoToProfile && (
                                        <button onClick={onGoToProfile}
                                            className="flex items-center gap-1 font-medium py-1.5 px-2.5 rounded-lg text-xs transition-all hover:opacity-90"
                                            style={{ background: 'var(--color-border)', color: 'var(--color-text)' }}>
                                            <UserCog size={12} />
                                        </button>
                                    )}
                                    <button onClick={() => setShowConfirmSignOut(true)}
                                        className="flex items-center gap-1 text-white font-medium py-1.5 px-2.5 rounded-lg text-xs transition-all hover:opacity-90"
                                        style={{ background: 'var(--color-error)' }}>
                                        <LogOut size={12} /> ออก
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : isGuestMode ? (
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-xs font-medium px-3 py-1.5 rounded-lg text-center w-full"
                            style={{ background: 'color-mix(in srgb, var(--color-warning) 15%, transparent)', color: 'var(--color-warning)', border: '1px solid color-mix(in srgb, var(--color-warning) 30%, transparent)' }}>
                            โหมดทดลอง — คะแนนไม่ถูกบันทึก
                        </p>
                        <button onClick={handleGoogleSignIn}
                            className="flex items-center gap-2 font-medium py-2 px-5 rounded-xl hover:scale-105 transition-all text-sm w-full justify-center"
                            style={{ background: 'var(--color-accent)', color: 'var(--color-sidebar)' }}>
                            <LogIn size={16} /> เข้าสู่ระบบเพื่อบันทึกคะแนน
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <button onClick={handleGoogleSignIn}
                            className="flex items-center gap-2 font-medium py-2.5 px-6 rounded-xl hover:scale-105 transition-all text-sm"
                            style={{ background: 'var(--color-accent)', color: 'var(--color-sidebar)' }}>
                            <LogIn size={16} /> เข้าสู่ระบบด้วย Google
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
                                className="flex-1 py-2.5 px-4 text-white rounded-lg transition-all font-medium text-sm"
                                style={{ background: 'var(--color-error)' }}
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
