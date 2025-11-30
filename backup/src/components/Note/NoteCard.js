import React, { useState, useCallback } from 'react';
import Button from '../Common/Button';
import { Trash2, Edit } from 'lucide-react';
import { formatDate } from '../../utils/date';

/**
 * 노트 목록에서 개별 노트를 표시하는 컴포넌트
 * @param {object} note - 노트 객체 ({id, date, content, createdAt, diagnosisSummary?})
 * @param {function} onEdit - 수정 버튼 클릭 핸들러
 * @param {function} onDelete - 삭제 버튼 클릭 핸들러
 */
const NoteCard = ({ note, onEdit, onDelete }) => {
    const [isConfirming, setIsConfirming] = useState(false);

    const handleDeleteClick = useCallback(() => {
        if (isConfirming) {
            onDelete(note.id);
        } else {
            setIsConfirming(true);
            // 2초 후 자동 취소
            setTimeout(() => setIsConfirming(false), 2000);
        }
    }, [isConfirming, note.id, onDelete]);

    const handleEditClick = useCallback(() => {
        onEdit(note);
    }, [note, onEdit]);

    return (
        <div className="bg-white border-l-4 border-indigo-400 p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200 space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">
                    {formatDate(note.date)}
                </span>
                {note.diagnosisSummary && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                        AI 분석 포함
                    </span>
                )}
            </div>
            
            <p className="text-gray-800 whitespace-pre-wrap line-clamp-3">
                {note.content}
            </p>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <Button variant="secondary" onClick={handleEditClick} className="p-1 h-8 w-8 flex items-center justify-center">
                    <Edit size={16} />
                </Button>
                
                {isConfirming ? (
                    <Button variant="primary" onClick={handleDeleteClick} className="bg-red-500 hover:bg-red-600 p-1 h-8 w-auto text-sm">
                        <Trash2 size={16} className="mr-1" />
                        확인
                    </Button>
                ) : (
                    <Button variant="outline" onClick={handleDeleteClick} className="p-1 h-8 w-8 flex items-center justify-center text-red-500 border-red-500 hover:bg-red-50">
                        <Trash2 size={16} />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default NoteCard;