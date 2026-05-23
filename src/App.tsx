import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// Eager load — ใช้บ่อย/เล็ก/ต้องการทันที
import LandingPage from './pages/LandingPage';
import PracticePage from './pages/PracticePage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/shared/ProtectedRoute';
import ThemeSwitch from './components/shared/ThemeSwitch';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { SkeletonPage } from './components/shared/SkeletonCard';

// Lazy load — heavy pages โหลดเมื่อต้องการเท่านั้น
const TeacherPage          = lazy(() => import('./pages/TeacherPage'));
const StudentClassroomPage = lazy(() => import('./pages/StudentClassroomPage'));
const ClassroomPracticePage = lazy(() => import('./pages/ClassroomPracticePage'));
const PrePostTestRoom      = lazy(() => import('./pages/PrePostTestRoom'));
const ExamRoom             = lazy(() => import('./pages/ExamRoom'));
const SurveyPage           = lazy(() => import('./pages/SurveyPage'));
const UserDashboard        = lazy(() => import('./components/dashboard/UserDashboard'));
const AdminDashboard       = lazy(() => import('./components/dashboard/AdminDashboard'));
const TeacherDashboard     = lazy(() => import('./components/dashboard/TeacherDashboard'));

import { useAuth } from './hooks/useAuth';
import { languages } from './data/data';

// currentLevelId ต้องมีค่าเริ่มต้นสำหรับ useAuth
const defaultLevelId = languages[0].units[0].sessions[0].levels[0].id;

const AppRoutes: React.FC = () => {
    const navigate = useNavigate();
    const [isGuestMode, setIsGuestMode] = useState(false);

    const {
        user, isAuthReady, userPhotoUrl, userRole, userProfile,
        latestUserStats, userLevelProgress, isUserProgressLoaded,
        handleGoogleSignIn, handleSignOut, isLevelUnlocked,
    } = useAuth(defaultLevelId);

    // เมื่อ login สำเร็จ ออกจาก guest mode
    useEffect(() => {
        if (user && isGuestMode) setIsGuestMode(false);
    }, [user]);

    // Dev-only: expose navigate so Playwright can do in-SPA navigation without page reload
    useEffect(() => {
        if (import.meta.env.VITE_USE_EMULATOR === 'true') {
            (window as any).__devNavigate = navigate;
        }
    }, [navigate]);

    const handleGuestStart = () => {
        setIsGuestMode(true);
        navigate('/practice');
    };

    const handleSignIn = async () => {
        await handleGoogleSignIn();
    };

    // auth props ที่ส่งไปยัง PracticePage
    const authProps = {
        user, isAuthReady, userPhotoUrl, userRole, isGuestMode,
        latestUserStats, userLevelProgress, isUserProgressLoaded,
        handleGoogleSignIn, handleSignOut, isLevelUnlocked,
    };

    return (
        <Routes>
            {/* Landing */}
            <Route
                path="/"
                element={
                    !isAuthReady ? null :
                    (user || isGuestMode)
                        ? <Navigate to="/practice" replace />
                        : <LandingPage
                            onGuestStart={handleGuestStart}
                            onSignIn={handleSignIn}
                            isAuthReady={isAuthReady}
                          />
                }
            />

            {/* Complete Profile — บังคับกรอกครั้งแรก */}
            <Route
                path="/complete-profile"
                element={
                    <ProtectedRoute
                        isAuthReady={isAuthReady}
                        user={user}
                        userRole={userRole}
                        skipProfileCheck
                    >
                        <CompleteProfilePage user={user} userRole={userRole} />
                    </ProtectedRoute>
                }
            />

            {/* Practice */}
            <Route
                path="/practice"
                element={
                    <ProtectedRoute
                        isAuthReady={isAuthReady}
                        user={user}
                        userRole={userRole}
                        userProfile={userProfile}
                        allowGuest
                        isGuestMode={isGuestMode}
                    >
                        <PracticePage {...authProps} />
                    </ProtectedRoute>
                }
            />

            {/* Student Dashboard */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute isAuthReady={isAuthReady} user={user} userRole={userRole} userProfile={userProfile}>
                        <UserDashboard user={user} setShowUserDashboard={() => navigate('/practice')} />
                    </ProtectedRoute>
                }
            />

            {/* Admin / Teacher Dashboard */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute
                        isAuthReady={isAuthReady}
                        user={user}
                        userRole={userRole}
                        userProfile={userProfile}
                        allowedRoles={['teacher', 'admin', 'superAdmin']}
                    >
                        {(userRole === 'superAdmin' || userRole === 'admin')
                            ? <AdminDashboard user={user} userRole={userRole} setShowAdminDashboard={() => navigate('/practice')} />
                            : <TeacherDashboard user={user} setShowTeacherDashboard={() => navigate('/practice')} />
                        }
                    </ProtectedRoute>
                }
            />

            {/* Teacher classroom management */}
            <Route
                path="/teacher"
                element={
                    <ProtectedRoute
                        isAuthReady={isAuthReady}
                        user={user}
                        userRole={userRole}
                        userProfile={userProfile}
                        allowedRoles={['teacher', 'admin', 'superAdmin']}
                    >
                        <TeacherPage user={user} userRole={userRole} />
                    </ProtectedRoute>
                }
            />

            {/* Student — my classrooms */}
            <Route
                path="/my-classroom"
                element={
                    <ProtectedRoute isAuthReady={isAuthReady} user={user} userRole={userRole} userProfile={userProfile}>
                        <StudentClassroomPage user={user} />
                    </ProtectedRoute>
                }
            />

            {/* Classroom custom lesson practice */}
            <Route
                path="/classroom/:classroomId/lesson/:lessonId"
                element={
                    <ProtectedRoute isAuthReady={isAuthReady} user={user} userRole={userRole} userProfile={userProfile}>
                        <ClassroomPracticePage user={user} />
                    </ProtectedRoute>
                }
            />

            {/* Pre/Post Test exam room */}
            <Route
                path="/test/:testId"
                element={
                    <ProtectedRoute isAuthReady={isAuthReady} user={user} userRole={userRole} userProfile={userProfile} isExamRoute>
                        <PrePostTestRoom user={user} />
                    </ProtectedRoute>
                }
            />

            {/* Exam room */}
            <Route
                path="/exam/:examId"
                element={
                    <ProtectedRoute isAuthReady={isAuthReady} user={user} userRole={userRole} userProfile={userProfile} isExamRoute>
                        <ExamRoom user={user} />
                    </ProtectedRoute>
                }
            />

            {/* Profile edit page */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute isAuthReady={isAuthReady} user={user} userRole={userRole} userProfile={userProfile} skipProfileCheck>
                        <ProfilePage user={user} userProfile={userProfile} />
                    </ProtectedRoute>
                }
            />

            {/* Survey page for students */}
            <Route
                path="/survey/:surveyId"
                element={
                    <ProtectedRoute isAuthReady={isAuthReady} user={user} userRole={userRole} userProfile={userProfile}>
                        <SurveyPage user={user} />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => (
    <ErrorBoundary>
        <Suspense fallback={<SkeletonPage />}>
            <AppRoutes />
        </Suspense>
        <ThemeSwitch />
    </ErrorBoundary>
);

export default App;
