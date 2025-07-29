// src/components/AuthSection.tsx

import React from 'react';
import { LogIn, LogOut, User } from 'lucide-react';
// import type { LevelStats } from '../types/types'; // Import LevelStats if needed for user info display

interface AuthSectionProps {
    isAuthReady: boolean;
    user: any; // Firebase User object
    userPhotoUrl: string | null;
    userRole: string | null;
    handleGoogleSignIn: () => Promise<void>;
    handleSignOut: () => Promise<void>;
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
}) => {
    return (
        <div className="p-3 sm:p-4 lg:p-5 border-b border-gray-200 bg-gray-50 flex justify-center items-center">
            {isAuthReady ? (
                user ? (
                    <div className="flex flex-col items-center">
                        <div>
                            {userPhotoUrl ? (
                                <img
                                    src={userPhotoUrl}
                                    alt="User Avatar"
                                    className="w-16 h-16 rounded-full mb-2 border-2 border-blue-400 shadow-md"
                                    onError={(e) => {
                                        // Fallback to a placeholder image if the original image fails to load
                                        (e.target as HTMLImageElement).src = `https://placehold.co/64x64/A78BFA/ffffff?text=User`;
                                        console.warn("Failed to load user photo, using placeholder.");
                                    }}
                                />
                            ) : (
                                <User size={64} className="text-gray-400 mb-2" />
                            )}
                        </div>
                        <div className='flex flex-col items-center'>
                            <p className="text-sm sm:text-base font-semibold text-gray-800 break-all">{user.displayName || 'ผู้ใช้ Google'}</p>
                            <p className="text-xs text-gray-600 mb-2 break-all">{user.email} </p>
                            <p className="text-xs text-gray-500 mb-2">บทบาท: <span className="font-bold">{userRole || 'กำลังโหลด...'}</span></p>
                        </div>
                        <div className='flex flex-col items-center'>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-sm"
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
        </div>
    );
};

export default AuthSection;
