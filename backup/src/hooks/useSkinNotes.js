import { useState, useEffect } from 'react';
import { getTodayDate } from '../utils/date';

const STORAGE_KEY = 'skinNotes';

export default function useSkinNotes() {
    const [skinNotes, setSkinNotes] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    });

    const saveSkinNote = (note) => {
        const newNotes = [...skinNotes.filter(n => n.date !== note.date), note];
        setSkinNotes(newNotes);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
    };

    const deleteTodayNote = () => {
        const today = getTodayDate();
        const newNotes = skinNotes.filter(n => n.date !== today);
        setSkinNotes(newNotes);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
    };

    return { skinNotes, saveSkinNote, deleteTodayNote };
}
