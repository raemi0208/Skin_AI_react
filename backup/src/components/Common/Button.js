import React from 'react';

export default function Button({ onClick, children, variant = 'primary', className = '' }) {
    const baseStyle = 'px-4 py-2 rounded font-semibold';
    const variantStyle = variant === 'primary'
        ? 'bg-blue-500 text-white hover:bg-blue-600'
        : variant === 'secondary'
        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        : 'border border-gray-400 text-gray-700';
    return (
        <button onClick={onClick} className={`${baseStyle} ${variantStyle} ${className}`}>
            {children}
        </button>
    );
}
