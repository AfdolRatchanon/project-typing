// App.tsx

// Declare global variables by extending the Window interface
// This makes them accessible via window.__app_id and window.__initial_auth_token
// and helps TypeScript recognize them correctly during build.
declare global {
    interface Window {
        __app_id?: string;
        __initial_auth_token?: string;
    }
}

import React, { useState, useEffect } from 'react'; // Import useEffect
import { Target } from 'lucide-react'; // Removed LayoutDashboard, Gamepad2 as they are now in AuthSection
import './App.css'; // Assuming App.css contains global styles

// Import components
import AuthSection from './components/AuthSection';
import LevelSelector from './components/LevelSelector';
import StatsDisplay from './components/StatsDisplay';
import TypingArea from './components/TypingArea';
import GameControls from './components/GameControls';
import VirtualKeyboard from './components/VirtualKeyboard';
import NextCharGuidance from './components/NextCharGuidance';
import GameResults from './components/GameResults';
import LevelScoringCriteria from './components/LevelScoringCriteria';
import AdminDashboard from './components/AdminDashboard'; // Import the new AdminDashboard component

// Import hooks
import { useAuth } from './hooks/useAuth';
import { useTypingGame } from './hooks/useTypingGame';

// Import data
import { languages } from './data/data';

const App: React.FC = () => {
    // Get appId safely from window object
    const appId = window.__app_id || 'default-app-id';

    // State for current level selection (managed here as it affects both auth and game logic)
    const [currentLevelId, setCurrentLevelId] = useState<string>(languages[0].units[0].sessions[0].levels[0].id);

    // Add states for LevelSelector expansion
    const [expandedLanguage, setExpandedLanguage] = useState<string>('');
    const [expandedUnits, setExpandedUnits] = useState<{ [key: string]: boolean }>({});
    const [expandedSessions, setExpandedSessions] = useState<{ [key: string]: boolean }>({});

    // Auth Hook
    const {
        user,
        isAuthReady,
        userPhotoUrl,
        userRole, // Get userRole from useAuth
        latestUserStats,
        userLevelProgress,
        isUserProgressLoaded,
        handleGoogleSignIn,
        handleSignOut,
        isLevelUnlocked,
    } = useAuth(appId, currentLevelId);

    // Typing Game Hook
    const {
        fullTextContent,
        segments,
        currentSegmentIndex,
        textToType,
        typedText,
        isStarted,
        isPaused,
        isFinished,
        timer,
        totalErrors,
        totalCorrectChars,
        totalTypedChars,
        wpm,
        accuracy,
        timeLimit,
        remainingTime,
        isTimeUp,
        nextChar,
        activeFinger,
        highlightedKeys,
        keyboardLanguage,
        isShiftActive,
        isCapsLockActive,
        inputRef,
        handleInputChange,
        handleStartPause,
        handleResetGame,
        getCurrentLevel,
    } = useTypingGame({ currentLevelId, user, appId });

    const currentLevel = getCurrentLevel();

    // useEffect to automatically expand LevelSelector sections
    useEffect(() => {
        if (!currentLevel) {
            // If currentLevel is null, maybe collapse everything or set a default
            setExpandedLanguage('');
            setExpandedUnits({});
            setExpandedSessions({});
            return;
        }

        let foundLangId: string = '';
        const newExpandedUnits: { [key: string]: boolean } = {};
        const newExpandedSessions: { [key: string]: boolean } = {};

        // Loop through languages, units, and sessions to find the current level
        // and set the expanded states accordingly.
        for (const lang of languages) {
            let isLangActive = false;
            for (const unit of lang.units) {
                let isUnitActive = false;
                for (const session of unit.sessions) {
                    // Check if the current level is in this session
                    const isSessionActive = session.levels.some(level => level.id === currentLevelId);
                    if (isSessionActive) {
                        newExpandedSessions[session.id] = true;
                        isUnitActive = true; // Mark unit as active
                        isLangActive = true; // Mark language as active
                    } else {
                        newExpandedSessions[session.id] = false; // Explicitly collapse if not active
                    }
                }
                if (isUnitActive) {
                    newExpandedUnits[unit.id] = true;
                } else {
                    newExpandedUnits[unit.id] = false; // Explicitly collapse if not active
                }
            }
            if (isLangActive) {
                foundLangId = lang.id;
            }
        }

        // Update the states after determining all expanded states
        setExpandedLanguage(foundLangId);
        setExpandedUnits(newExpandedUnits);
        setExpandedSessions(newExpandedSessions);

        console.log(`Auto-expanding: Language=${foundLangId}`);
        console.log('New Expanded Units State:', newExpandedUnits);
        console.log('New Expanded Sessions State:', newExpandedSessions);

    }, [currentLevelId, languages, currentLevel]);


    // Calculate progress for display
    let completedCharsReal = 0;
    for (let i = 0; i < currentSegmentIndex; i++) {
        completedCharsReal += segments[i].length + 1;
    }
    const totalProgress = completedCharsReal + typedText.length;
    const totalCharsActual = fullTextContent.length;

    // New state to manage admin view toggle
    const [showAdminDashboard, setShowAdminDashboard] = useState(false);

    // Conditional rendering based on userRole and showAdminDashboard state
    if (userRole === 'admin') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center justify-start p-2 sm:p-4 font-inter">
                {/* The toggle button is now inside AuthSection, so no button here */}
                {showAdminDashboard ? (
                    <AdminDashboard user={user} userRole={userRole} setShowAdminDashboard={setShowAdminDashboard} />
                    /* Pass setShowAdminDashboard */
                ) : (
                    // Render the main game application for admin when toggled
                    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col xl:flex-row p-2 sm:p-4 font-inter gap-3 lg:gap-6 w-full">
                        {/* ======================= เมนูเลือกบทเรียน (ซ้าย) ======================= */}
                        <aside className="bg-white rounded-xl lg:rounded-2xl shadow-2xl w-full xl:w-80 2xl:w-96 border border-gray-200 h-150 sm:h-200 lg:h-500 lg:max-h-[90vh] flex flex-col">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 lg:p-5 rounded-t-xl lg:rounded-t-2xl shadow-lg">
                                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-center flex items-center justify-center gap-2">
                                    <Target size={16} className="sm:w-5 sm:h-5" />
                                    เลือกบทเรียน
                                </h2>
                            </div>

                            {/* Firebase Login/User Info Section */}
                            <AuthSection
                                isAuthReady={isAuthReady}
                                user={user}
                                userPhotoUrl={userPhotoUrl}
                                userRole={userRole}
                                handleGoogleSignIn={handleGoogleSignIn}
                                handleSignOut={handleSignOut}
                                showAdminDashboard={showAdminDashboard} // Pass state
                                setShowAdminDashboard={setShowAdminDashboard} // Pass setter
                            />

                            {/* Level Selector */}
                            <LevelSelector
                                languages={languages}
                                currentLevelId={currentLevelId}
                                setCurrentLevelId={setCurrentLevelId}
                                isStarted={isStarted}
                                isPaused={isPaused}
                                expandedLanguage={expandedLanguage}
                                setExpandedLanguage={setExpandedLanguage}
                                expandedUnits={expandedUnits}
                                setExpandedUnits={setExpandedUnits}
                                expandedSessions={expandedSessions}
                                setExpandedSessions={setExpandedSessions}
                                isLevelUnlocked={isLevelUnlocked}
                                userLevelProgress={userLevelProgress}
                                isUserProgressLoaded={isUserProgressLoaded}
                                user={user}
                            />

                            <div className="border-t border-gray-200 p-2 sm:p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl lg:rounded-b-2xl">
                                <div className="text-xs text-gray-600 text-center">
                                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="font-semibold text-gray-700 text-xs sm:text-sm">กำลังเรียน:</span>
                                    </div>
                                    <div className="font-bold text-blue-700 truncate px-2 py-1 bg-white rounded-md shadow-sm border text-xs sm:text-sm">
                                        {currentLevel?.name || 'กำลังโหลด...'}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* ======================= ส่วนเนื้อหาหลัก (ขวา) ======================= */}
                        <main className="bg-white p-4 lg:p-8 rounded-xl lg:rounded-2xl shadow-2xl flex-1 border border-gray-200 min-h-0">
                            {/* Stats Display */}
                            <StatsDisplay
                                timer={timer}
                                timeLimit={timeLimit}
                                remainingTime={remainingTime}
                                wpm={wpm}
                                accuracy={accuracy}
                                totalErrors={totalErrors}
                                totalProgress={totalProgress}
                                totalCharsActual={totalCharsActual}
                            />

                            {/* Typing Area */}
                            <TypingArea
                                textToType={textToType}
                                typedText={typedText}
                                currentSegmentIndex={currentSegmentIndex}
                                segments={segments}
                                isFinished={isFinished}
                                isPaused={isPaused}
                                inputRef={inputRef}
                                handleInputChange={handleInputChange}
                            />

                            {/* Game Controls */}
                            <GameControls
                                isStarted={isStarted}
                                isPaused={isPaused}
                                isFinished={isFinished}
                                handleStartPause={handleStartPause}
                                handleResetGame={handleResetGame}
                            />

                            {/* Virtual Keyboard and Next Char Guidance */}
                            <div className="flex flex-col-reverse lg:flex-row gap-3 lg:gap-4">
                                <VirtualKeyboard
                                    highlightedKeys={highlightedKeys}
                                    isShiftActive={isShiftActive}
                                    isCapsLockActive={isCapsLockActive}
                                    keyboardLanguage={keyboardLanguage}
                                />
                                <NextCharGuidance
                                    nextChar={nextChar}
                                    activeFinger={activeFinger}
                                    typedTextLength={typedText.length}
                                    textToTypeLength={textToType.length}
                                    currentSegmentIndex={currentSegmentIndex}
                                    segmentsLength={segments.length}
                                    isFinished={isFinished}
                                    isPaused={isPaused}
                                />
                            </div>

                            {/* Game Results */}
                            <GameResults
                                isFinished={isFinished}
                                isTimeUp={isTimeUp}
                                timer={timer}
                                wpm={wpm}
                                accuracy={accuracy}
                                totalErrors={totalErrors}
                                totalCorrectChars={totalCorrectChars}
                                totalTypedChars={totalTypedChars}
                                fullTextContentLength={fullTextContent.length}
                                currentLevelId={currentLevelId}
                                user={user}
                                latestUserStats={latestUserStats}
                            />

                            {/* Level Scoring Criteria */}
                            <LevelScoringCriteria
                                currentLevelId={currentLevelId}
                                timeLimit={timeLimit}
                                currentLevelName={currentLevel?.name || null}
                            />

                            {/* New: Latest Level Stats Display - แสดงสถิติการเล่นล่าสุดของด่านนี้ */}
                            {user && latestUserStats && (
                                <div className="bg-blue-50 p-4 rounded-xl shadow-inner mt-4 border border-blue-200">
                                    <h3 className="text-lg font-bold text-blue-800 mb-3 text-center">สถิติการเล่นล่าสุดของด่านนี้</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-blue-700">
                                        <div className="flex justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm">
                                            <span className="font-medium">WPM:</span>
                                            <span className="font-semibold text-blue-900">{latestUserStats.wpm}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm">
                                            <span className="font-medium">ความแม่นยำ:</span>
                                            <span className="font-semibold text-blue-900">{latestUserStats.accuracy}%</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm">
                                            <span className="font-medium">ข้อผิดพลาด:</span>
                                            <span className="font-semibold text-blue-900">{latestUserStats.totalErrors}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm">
                                            <span className="font-medium">จำนวนครั้งที่เล่น:</span>
                                            <span className="font-semibold text-blue-900">{latestUserStats.playCount}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm">
                                            <span className="font-medium">คะแนน (10):</span>
                                            <span className="font-semibold text-blue-900">{latestUserStats.score10Point}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm">
                                            <span className="font-medium">เกรด:</span>
                                            <span className="font-semibold text-blue-900">{latestUserStats.grade}</span>
                                        </div>
                                        <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-xs text-blue-600 mt-2">
                                            <span className="font-medium">เล่นล่าสุด:</span> {new Date(latestUserStats.lastPlayed).toLocaleString('th-TH')}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </main>
                    </div>
                )}
            </div>
        );
    }

    // Default rendering for 'user' role or unauthenticated users
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col xl:flex-row p-2 sm:p-4 font-inter gap-3 lg:gap-6">
            {/* ======================= เมนูเลือกบทเรียน (ซ้าย) ======================= */}
            <aside className="bg-white rounded-xl lg:rounded-2xl shadow-2xl w-full xl:w-80 2xl:w-96 border border-gray-200 h-150 sm:h-200 lg:h-500 lg:max-h-[90vh] flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 lg:p-5 rounded-t-xl lg:rounded-t-2xl shadow-lg">
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-center flex items-center justify-center gap-2">
                        <Target size={16} className="sm:w-5 sm:h-5" />
                        เลือกบทเรียน
                    </h2>
                </div>

                {/* Firebase Login/User Info Section */}
                <AuthSection
                    isAuthReady={isAuthReady}
                    user={user}
                    userPhotoUrl={userPhotoUrl}
                    userRole={userRole}
                    handleGoogleSignIn={handleGoogleSignIn}
                    handleSignOut={handleSignOut}
                    showAdminDashboard={showAdminDashboard} // Pass state
                    setShowAdminDashboard={setShowAdminDashboard} // Pass setter
                />

                {/* Level Selector */}
                <LevelSelector
                    languages={languages}
                    currentLevelId={currentLevelId}
                    setCurrentLevelId={setCurrentLevelId}
                    isStarted={isStarted}
                    isPaused={isPaused}
                    expandedLanguage={expandedLanguage}
                    setExpandedLanguage={setExpandedLanguage}
                    expandedUnits={expandedUnits}
                    setExpandedUnits={setExpandedUnits}
                    expandedSessions={expandedSessions}
                    setExpandedSessions={setExpandedSessions}
                    isLevelUnlocked={isLevelUnlocked}
                    userLevelProgress={userLevelProgress}
                    isUserProgressLoaded={isUserProgressLoaded}
                    user={user}
                />

                <div className="border-t border-gray-200 p-2 sm:p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl lg:rounded-b-2xl">
                    <div className="text-xs text-gray-600 text-center">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-semibold text-gray-700 text-xs sm:text-sm">กำลังเรียน:</span>
                        </div>
                        <div className="font-bold text-blue-700 truncate px-2 py-1 bg-white rounded-md shadow-sm border text-xs sm:text-sm">
                            {currentLevel?.name || 'กำลังโหลด...'}
                        </div>
                    </div>
                </div>
            </aside>

            {/* ======================= ส่วนเนื้อหาหลัก (ขวา) ======================= */}
            <main className="bg-white p-4 lg:p-8 rounded-xl lg:rounded-2xl shadow-2xl flex-1 border border-gray-200 min-h-0">
                {/* Stats Display */}
                <StatsDisplay
                    timer={timer}
                    timeLimit={timeLimit}
                    remainingTime={remainingTime}
                    wpm={wpm}
                    accuracy={accuracy}
                    totalErrors={totalErrors}
                    totalProgress={totalProgress}
                    totalCharsActual={totalCharsActual}
                />

                {/* Typing Area */}
                <TypingArea
                    textToType={textToType}
                    typedText={typedText}
                    currentSegmentIndex={currentSegmentIndex}
                    segments={segments}
                    isFinished={isFinished}
                    isPaused={isPaused}
                    inputRef={inputRef}
                    handleInputChange={handleInputChange}
                />

                {/* Game Controls */}
                <GameControls
                    isStarted={isStarted}
                    isPaused={isPaused}
                    isFinished={isFinished}
                    handleStartPause={handleStartPause}
                    handleResetGame={handleResetGame}
                />

                {/* Virtual Keyboard and Next Char Guidance */}
                <div className="flex flex-col-reverse lg:flex-row gap-3 lg:gap-4">
                    <VirtualKeyboard
                        highlightedKeys={highlightedKeys}
                        isShiftActive={isShiftActive}
                        isCapsLockActive={isCapsLockActive}
                        keyboardLanguage={keyboardLanguage}
                    />
                    <NextCharGuidance
                        nextChar={nextChar}
                        activeFinger={activeFinger}
                        typedTextLength={typedText.length}
                        textToTypeLength={textToType.length}
                        currentSegmentIndex={currentSegmentIndex}
                        segmentsLength={segments.length}
                        isFinished={isFinished}
                        isPaused={isPaused}
                    />
                </div>

                {/* Game Results */}
                <GameResults
                    isFinished={isFinished}
                    isTimeUp={isTimeUp}
                    timer={timer}
                    wpm={wpm}
                    accuracy={accuracy}
                    totalErrors={totalErrors}
                    totalCorrectChars={totalCorrectChars}
                    totalTypedChars={totalTypedChars}
                    fullTextContentLength={fullTextContent.length}
                    currentLevelId={currentLevelId}
                    user={user}
                    latestUserStats={latestUserStats}
                />

                {/* Level Scoring Criteria */}
                <LevelScoringCriteria
                    currentLevelId={currentLevelId}
                    timeLimit={timeLimit}
                    currentLevelName={currentLevel?.name || null}
                />

                {/* New: Latest Level Stats Display - แสดงสถิติการเล่นล่าสุดของด่านนี้ */}
                {user && latestUserStats && (
                    <div className="bg-blue-50 p-4 rounded-xl shadow-inner mt-4 border border-blue-200">
                        <h3 className="text-lg font-bold text-blue-800 mb-3 text-center">สถิติการเล่นล่าสุดของด่านนี้</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-blue-700">
                            <div className="flex justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm">
                                <span className="font-medium">WPM:</span>
                                <span className="font-semibold text-blue-900">{latestUserStats.wpm}</span>
                            </div>
                            <div className="flex justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm">
                                <span className="font-medium">ความแม่นยำ:</span>
                                <span className="font-semibold text-blue-900">{latestUserStats.accuracy}%</span>
                            </div>
                            <div className="flex justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm">
                                <span className="font-medium">ข้อผิดพลาด:</span>
                                <span className="font-semibold text-blue-900">{latestUserStats.totalErrors}</span>
                            </div>
                            <div className="flex justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm">
                                <span className="font-medium">จำนวนครั้งที่เล่น:</span>
                                <span className="font-semibold text-blue-900">{latestUserStats.playCount}</span>
                            </div>
                            <div className="flex justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm">
                                <span className="font-medium">คะแนน (10):</span>
                                <span className="font-semibold text-blue-900">{latestUserStats.score10Point}</span>
                            </div>
                            <div className="flex justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm">
                                <span className="font-medium">เกรด:</span>
                                <span className="font-semibold text-blue-900">{latestUserStats.grade}</span>
                            </div>
                            <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center text-xs text-blue-600 mt-2">
                                <span className="font-medium">เล่นล่าสุด:</span> {new Date(latestUserStats.lastPlayed).toLocaleString('th-TH')}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
