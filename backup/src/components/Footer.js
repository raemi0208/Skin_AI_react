import React from 'react';

/**
 * 앱 하단 푸터 컴포넌트
 */
const Footer = () => {
    return (
        <footer className="w-full bg-gray-100 p-4 text-center text-sm text-gray-500 mt-8">
            <p>© {new Date().getFullYear()} Skin Care Diary. All rights reserved.</p>
            <p className="mt-1">Powered by Gemini & React</p>
        </footer>
    );
};

export default Footer;