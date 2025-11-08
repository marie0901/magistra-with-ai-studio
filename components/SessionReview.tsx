
import React from 'react';
import { AudioPlayer } from './AudioPlayer';

interface SessionReviewProps {
    translationText: string;
}

export const SessionReview: React.FC<SessionReviewProps> = ({ translationText }) => {

    return (
        <div className="my-4 p-4 bg-green-100 dark:bg-green-900/50 rounded-lg text-left animate-slide-in-up">
            <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold text-green-800 dark:text-green-300">SESSION TRANSLATION</p>
                <AudioPlayer text={translationText} language="es-ES" />
            </div>
            <p className="text-sm text-green-900 dark:text-green-200 text-justify">
                {translationText}
            </p>
        </div>
    );
};
