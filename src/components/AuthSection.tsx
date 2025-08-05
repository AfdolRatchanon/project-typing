// src/components/AuthSection.tsx

import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, User, LayoutDashboard, Gamepad2 } from 'lucide-react';

interface AuthSectionProps {
    isAuthReady: boolean;
    user: any; // Firebase User object
    userPhotoUrl: string | null;
    userRole: string | null;
    handleGoogleSignIn: () => Promise<void>;
    handleSignOut: () => Promise<void>; // This prop will now trigger the confirmation
    // New props for admin toggle
    showAdminDashboard: boolean;
    setShowAdminDashboard: React.Dispatch<React.SetStateAction<boolean>>;
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
    handleSignOut, // This prop will now trigger the confirmation
    showAdminDashboard,
    setShowAdminDashboard,
}) => {
    // State to track if the user's photo failed to load due to any error (including 429)
    const [imageError, setImageError] = useState(false);
    // State to control the visibility of the sign-out confirmation modal
    const [showConfirmSignOut, setShowConfirmSignOut] = useState(false);

    // Reset the imageError state whenever the user object changes
    useEffect(() => {
        if (user) {
            setImageError(false); // Reset error state when user data is available
        }
    }, [user]);

    // Function to handle the actual sign-out after confirmation
    const confirmSignOut = async () => {
        setShowConfirmSignOut(false); // Close the modal
        await handleSignOut(); // Call the actual sign-out function passed from App.tsx
    };

    // Function to cancel sign-out
    const cancelSignOut = () => {
        setShowConfirmSignOut(false); // Close the modal
    };

    return (
        <div className="p-3 sm:p-4 lg:p-5 border-b border-gray-200 bg-gray-50 flex justify-center items-center">
            {isAuthReady ? (
                user ? (
                    <div className="flex flex-col items-center">
                        <div>
                            {/* Render user photo if available and no error, otherwise show placeholder icon */}
                            {userPhotoUrl && !imageError ? (
                                <img
                                    src={userPhotoUrl}
                                    alt="User Avatar"
                                    className="w-16 h-16 rounded-full mb-2 border-2 border-blue-400 shadow-md"
                                    onError={(e) => {
                                        setImageError(true);
                                        console.warn("Failed to load user photo. This could be due to a network error or rate-limiting (429 Too Many Requests).");
                                        console.error("Error loading image URL:", (e.target as HTMLImageElement).src);
                                        console.log("imageError state set to true.");
                                    }}
                                />
                            ) : (
                                // This is the fallback icon displayed when userPhotoUrl is null or the image fails to load
                                <User size={64} className="text-gray-400 mb-2" />
                            )}
                        </div>
                        <div className='flex flex-col items-center mb-4'>
                            <p className="text-sm sm:text-base font-semibold text-gray-800 break-all">{user.displayName || 'ผู้ใช้ Google'}</p>
                            <p className="text-xs text-gray-600 mb-2 break-all">{user.email} </p>
                            <p className="text-xs text-gray-500 mb-2">บทบาท: <span className="font-bold">{userRole || 'กำลังโหลด...'}</span></p>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            {userRole === 'admin' && (
                                <button
                                    onClick={() => setShowAdminDashboard(prev => !prev)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-sm w-full justify-center"
                                >
                                    {showAdminDashboard ? (
                                        <>
                                            <Gamepad2 size={16} /> ไปหน้าเกม
                                        </>
                                    ) : (
                                        <>
                                            <LayoutDashboard size={16} /> ไปหน้า Dashboard
                                        </>
                                    )}
                                </button>
                            )}
                            <button
                                onClick={() => setShowConfirmSignOut(true)} // Show confirmation modal on click
                                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-sm w-full justify-center"
                            >
                                <LogOut size={16} /> ออกจากระบบ
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleGoogleSignIn}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base"
                    >
                        <LogIn size={18} /> เข้าสู่ระบบ
                    </button>
                )
            ) : (
                <div className="flex items-center text-gray-500">
                    <User size={18} className="animate-pulse mr-2" /> กำลังโหลดผู้ใช้...
                </div>
            )}

            {/* Sign-out Confirmation Modal */}
            {showConfirmSignOut && (
                <div className="fixed inset-0  flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full text-center animate-modal-fade-in">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">ยืนยันการออกจากระบบ</h3>
                        <p className="text-gray-700 mb-6">คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={cancelSignOut}
                                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300 ease-in-out font-medium"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={confirmSignOut}
                                className="px-5 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 ease-in-out font-medium"
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
