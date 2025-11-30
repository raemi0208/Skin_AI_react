import React, { useState, useMemo, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NoteList from '../components/Notes/NoteList';
import NoteInput from '../components/Notes/NoteInput';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import useSkinNotes from '../hooks/useSkinNotes';
import { getTodayDate } from '../utils/date';

// ----------------------------------------------------
// UI/Interaction Props:
// - goHome: 홈 페이지로 이동
// ----------------------------------------------------

const NotesPage = ({ goHome }) => {
    const { skinNotes, addNote, deleteNote, updateNote } = useSkinNotes();
    const [isInputOpen, setIsInputOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);

    // 오늘 날짜의 노트
    const today = getTodayDate();
    const todayNote = useMemo(() => {
        return skinNotes.find(note => note.date === today) || null;
    }, [skinNotes, today]);

    // 노트 입력/수정 시작
    const handleStartEdit = useCallback((note = null) => {
        setEditingNote(note);
        setIsInputOpen(true);
    }, []);

    // 노트 저장 처리
    const handleSaveNote = useCallback((noteContent) => {
        if (editingNote) {
            // 수정
            updateNote(editingNote.id, noteContent);
        } else {
            // 새 기록 (오늘 날짜)
            const newNote = {
                id: Date.now().toString(),
                date: today,
                content: noteContent,
                createdAt: new Date().toISOString(),
            };
            addNote(newNote);
        }
        setIsInputOpen(false);
        setEditingNote(null);
    }, [editingNote, addNote, updateNote, today]);

    // 노트 입력/수정 취소
    const handleCancelEdit = useCallback(() => {
        setIsInputOpen(false);
        setEditingNote(null);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header title="📝 스킨케어 기록" onBackClick={goHome} />

            <main className="flex-grow p-4 space-y-6 max-w-xl mx-auto w-full">
                {/* 섹션 1: 오늘의 노트 입력/수정 */}
                <Card title={todayNote ? "수정하기: 오늘의 기록" : "새 기록: 오늘 날짜"} className="bg-white shadow-lg border-t-4 border-blue-500">
                    {isInputOpen ? (
                        <NoteInput
                            initialContent={editingNote ? editingNote.content : (todayNote ? todayNote.content : '')}
                            onSave={handleSaveNote}
                            onCancel={handleCancelEdit}
                        />
                    ) : (
                        <div className="flex justify-center p-4">
                            <Button
                                onClick={() => handleStartEdit(todayNote)}
                                variant="primary"
                                className="w-full max-w-xs"
                            >
                                {todayNote ? '오늘의 기록 수정' : '오늘의 기록 남기기'}
                            </Button>
                        </div>
                    )}
                </Card>

                {/* 섹션 2: 전체 노트 목록 */}
                <Card title="📖 전체 기록 목록" className="bg-white shadow-lg">
                    <NoteList
                        notes={skinNotes}
                        onEdit={handleStartEdit}
                        onDelete={deleteNote}
                    />
                </Card>
            </main>

            <Footer />
        </div>
    );
};

export default NotesPage;