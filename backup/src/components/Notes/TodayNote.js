import React from 'react';
import { BookOpen } from 'lucide-react';

/**
 * HomePage에서 오늘 기록한 노트를 요약 표시하는 컴포넌트
 * @param {object} note - 오늘 기록한 노트 객체
 */
const TodayNote = ({ note }) => {
    // 내용이 너무 길 경우를 대비해 일정 길이만 표시
    const summary = note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '');

    return (
        <div className="p-4 space-y-2">
            <div className="flex items-center text-gray-600 text-sm font-medium mb-2">
                <BookOpen size={18} className="mr-1 text-indigo-500" />
                <span>오늘의 기록 요약</span>
            </div>
            {note.diagnosisSummary && (
                <p className="text-sm text-green-600 bg-green-50 p-2 rounded-md border border-green-200">
                    <span className="font-semibold mr-1">AI 요약:</span> {note.diagnosisSummary}
                </p>
            )}
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {summary}
            </p>
        </div>
    );
};

export default TodayNote;