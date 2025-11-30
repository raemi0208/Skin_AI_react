import React, { useMemo } from 'react';
import NoteCard from '../Note/NoteCard'; // NoteCard는 NoteList의 바로 상위 폴더에 위치

/**
 * 스킨 노트 목록을 표시하는 컴포넌트
 * @param {Array<object>} notes - 노트 객체 배열
 * @param {function} onEdit - 노트 수정 핸들러
 * @param {function} onDelete - 노트 삭제 핸들러
 */
const NoteList = ({ notes, onEdit, onDelete }) => {
    // 날짜 역순으로 정렬 (최신 노트가 상단에)
    const sortedNotes = useMemo(() => {
        return [...notes].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [notes]);

    if (sortedNotes.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p className="text-lg">아직 기록된 노트가 없습니다.</p>
                <p className="text-sm mt-2">새로운 기록을 남겨보세요!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sortedNotes.map(note => (
                <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default NoteList;