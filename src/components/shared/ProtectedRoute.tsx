import React from 'react';
import { Navigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
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
    isExamRoute?: boolean;       // X2 — show session modal instead of redirect
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
    isExamRoute = false,
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

    // X2 — session expired during exam: show modal overlay instead of redirecting
    if (!user && isExamRoute) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.75)' }}>
                <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="text-4xl mb-3">⏱</div>
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                        เซสชันหมดอายุ
                    </h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                        กรุณาเข้าสู่ระบบใหม่เพื่อกลับมาสอบต่อ
                    </p>
                    <button
                        onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                        style={{ background: 'var(--color-primary)' }}>
                        เข้าสู่ระบบด้วย Google
                    </button>
                </div>
            </div>
        );
    }

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
