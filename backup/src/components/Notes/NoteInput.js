import React, { useState } from 'react';
import Button from '../Common/Button';

export default function NoteInput({ initialContent = '', onSave, onCancel, placeholder }) {
    const [content, setContent] = useState(initialContent);

    return (
        <div className="space-y-2">
            <textarea
                className="w-full p-2 border rounded"
                rows={5}
                value={content}
                placeholder={placeholder}
                onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex gap-2">
                <Button onClick={() => onSave(content)}>저장</Button>
                <Button onClick={onCancel} variant="secondary">취소</Button>
            </div>
        </div>
    );
}
