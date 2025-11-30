import React from 'react';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import { Trash2, Calendar, ClipboardList } from 'lucide-react';

/**
 * 스킨 노트 기록 목록을 보여주는 페이지 컴포넌트
 * @param {Array<object>} notes - 저장된 스킨 노트 기록 배열
 * @param {function} onGoHome - 홈 페이지로 이동하는 함수
 * @param {function} onDeleteNote - 특정 날짜의 노트를 삭제하는 함수
 */
const SkinNoteHistoryPage = ({ notes, onGoHome, onDeleteNote }) => {
    // 최신 기록이 위로 오도록 날짜 기준 내림차순 정렬
    const sortedNotes = [...notes].sort((a, b) => new Date(b.date) - new Date(a.date));

    // 기록 카드 컴포넌트
    const NoteCard = ({ note }) => (
        <Card className="p-4 mb-4 border border-indigo-100 transition duration-200 hover:shadow-md">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center text-lg font-bold text-indigo-700">
                    <Calendar size={18} className="mr-2 flex-shrink-0" />
                    {note.date}
                </div>
                <button
                    onClick={() => onDeleteNote(note.date)}
                    className="p-1 text-red-500 hover:text-red-700 transition"
                    aria-label={`${note.date} 기록 삭제`}
                >
                    <Trash2 size={20} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                {/* 진단 사진 */}
                <div className="col-span-1">
                    <p className="text-sm font-semibold text-gray-500 mb-1">진단 사진</p>
                    <img
                        src={note.photoUrl}
                        alt={`${note.date} 진단 사진`}
                        className="w-full h-auto object-cover rounded-lg shadow-sm aspect-square"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/eeeeee/333333?text=No+Photo" }}
                    />
                </div>
                
                {/* 결과 요약 */}
                <div className="col-span-1">
                    <p className="text-sm font-semibold text-gray-500 mb-1">AI 분석 요약</p>
                    <div className="bg-gray-50 p-3 rounded-lg h-full overflow-hidden">
                        <p className="text-sm text-gray-700 line-clamp-6 whitespace-pre-wrap">
                            {note.summary || '요약 정보 없음'}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 pt-3 border-t">
                 <p className="text-sm font-semibold text-gray-500 flex items-center mb-1">
                    <ClipboardList size={14} className="mr-1" />
                    상세 기록
                 </p>
                 <div className="bg-white p-3 border rounded-lg">
                    <p className="text-xs text-gray-600 line-clamp-3">
                        {note.detail || '상세 진단 기록이 저장되어 있지 않습니다.'}
                    </p>
                 </div>
            </div>
        </Card>
    );

    return (
        <div className="skin-note-history-page p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                나의 스킨 노트 기록
            </h2>

            {sortedNotes.length > 0 ? (
                <div className="max-w-xl mx-auto">
                    <p className="text-sm text-gray-500 mb-4 text-center">
                        총 <span className="font-bold text-indigo-600">{sortedNotes.length}</span>개의 진단 기록이 있습니다.
                    </p>
                    {sortedNotes.map(note => (
                        <NoteCard key={note.date} note={note} />
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12 max-w-md mx-auto">
                    <ClipboardList size={48} className="mx-auto text-indigo-400 mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-4">
                        아직 저장된 스킨 노트 기록이 없습니다.
                    </p>
                    <Button variant="primary" onClick={onGoHome} className="mt-3">
                        새로운 피부 진단 시작하기
                    </Button>
                </Card>
            )}

            <div className="text-center mt-8">
                <Button variant="secondary" onClick={onGoHome}>
                    &lt; 메인으로 돌아가기
                </Button>
            </div>
        </div>
    );
};

export default SkinNoteHistoryPage;