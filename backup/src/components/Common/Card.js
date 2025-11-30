import React from 'react';

export default function Card({ title, children, className = '' }) {
    return (
        <div className={`rounded-lg shadow p-4 bg-white ${className}`}>
            {title && <h2 className="font-bold mb-2">{title}</h2>}
            {children}
        </div>
    );
}
