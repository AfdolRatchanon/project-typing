import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

import LandingPage from './pages/LandingPage';
import PracticePage from './pages/PracticePage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import TeacherPage from './pages/TeacherPage';
import StudentClassroomPage from './pages/StudentClassroomPage';
import ClassroomPracticePage from './pages/ClassroomPracticePage';
import PrePostTestRoom from './pages/PrePostTestRoom';
import ExamRoom from './pages/ExamRoom';
import SurveyPage from './pages/SurveyPage';
import ProfilePage from './pages/ProfilePage';
import UserDashboard from './components/dashboard/UserDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import ProtectedRoute from './components/shared/ProtectedRoute';
import ThemeSwitch from './components/shared/ThemeSwitch';
import ErrorBoundary from './components/shared/ErrorBoundary';

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
                        allowedRoles={['teacher', 'superAdmin']}
                    >
                        {userRole === 'superAdmin'
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
                        allowedRoles={['teacher', 'superAdmin']}
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
                    <ProtectedRoute isAuthReady={isAuthReady} user={user} userRole={userRole} userProfile={userProfile}>
                        <PrePostTestRoom user={user} />
                    </ProtectedRoute>
                }
            />

            {/* Exam room */}
            <Route
                path="/exam/:examId"
                element={
                    <ProtectedRoute isAuthReady={isAuthReady} user={user} userRole={userRole} userProfile={userProfile}>
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
        <AppRoutes />
        <ThemeSwitch />
    </ErrorBoundary>
);

export default App;
