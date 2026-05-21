import React from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole, UserProfile } from '../../types/types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    isAuthReady: boolean;
    user: any;
    userRole: UserRole | null;
    userProfile?: UserProfile | null;
    allowedRoles?: UserRole[];
    allowGuest?: boolean;
    isGuestMode?: boolean;
    skipProfileCheck?: boolean;  // ใช้เฉพาะ route /complete-profile
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    isAuthReady,
    user,
    userRole,
    userProfile,
    allowedRoles,
    allowGuest = false,
    isGuestMode = false,
    skipProfileCheck = false,
}) => {
    if (!isAuthReady) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#003087' }}>
                <div className="text-center text-white">
                    <div className="w-10 h-10 border-4 border-[#FFB800] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-white/60">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    if (allowGuest && isGuestMode) return <>{children}</>;

    if (!user) return <Navigate to="/" replace />;

    // redirect ไปกรอก profile ถ้ายังไม่สมบูรณ์
    if (!skipProfileCheck && userProfile && userProfile.isProfileComplete === false) {
        return <Navigate to="/complete-profile" replace />;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        return <Navigate to="/practice" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
