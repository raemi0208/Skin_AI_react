import React from 'react';
import { ChevronLeft, User } from 'lucide-react';

/**
 * 앱 상단 헤더 컴포넌트
 * @param {string} title - 페이지 제목
 * @param {function} onBackClick - 뒤로가기 버튼 클릭 핸들러 (선택 사항)
 * @param {function} onUserIconClick - 사용자 정보 아이콘 클릭 핸들러 (선택 사항)
 */
const Header = ({ title = '스킨케어 다이어리', onBackClick, onUserIconClick }) => {
    return (
        <header className="sticky top-0 bg-white shadow-md p-4 flex items-center justify-between z-10">
            <div className="flex items-center">
                {onBackClick && (
                    <button
                        onClick={onBackClick}
                        className="p-1 mr-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                        aria-label="뒤로 가기"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                <h1 className="text-2xl font-extrabold text-indigo-700">
                    {title}
                </h1>
            </div>
            {onUserIconClick && (
                <button
                    onClick={onUserIconClick}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded-full transition"
                    aria-label="사용자 정보"
                >
                    <User size={24} />
                </button>
            )}
        </header>
    );
};

export default Header;