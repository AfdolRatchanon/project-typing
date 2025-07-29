// src/components/GameControls.tsx

import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface GameControlsProps {
    isStarted: boolean;
    isPaused: boolean;
    isFinished: boolean;
    handleStartPause: () => void;
    handleResetGame: () => void;
}

/**
 * @component GameControls
 * @description Renders the Start/Pause/Resume and Reset buttons for the game.
 * @param {GameControlsProps} props - Props for GameControls component.
 */
const GameControls: React.FC<GameControlsProps> = ({
    isStarted,
    isPaused,
    isFinished,
    handleStartPause,
    handleResetGame,
}) => {
    return (
        <div className="mb-3 lg:mb-4 text-center flex gap-2 justify-center">
            <button
                onClick={handleStartPause}
                disabled={isFinished}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 lg:py-3 lg:px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 text-sm lg:text-base"
            >
                {!isStarted ? (<><Play size={16} />เริ่ม</>) : isPaused ? (<><Play size={16} />ดำเนินต่อ</>) : (<><Pause size={16} />หยุด</>)}
            </button>
            <button
                onClick={handleResetGame}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 lg:py-3 lg:px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300 text-sm lg:text-base"
            >
                <RotateCcw size={16} />
                เริ่มใหม่
            </button>
        </div>
    );
};

export default GameControls;
