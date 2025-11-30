import React, { useEffect, useState } from 'react';
import Card from '../Common/Card';

/**
 * 일반적인 데이터 로딩 컴포넌트 (네트워크 요청 등)
 * @param {string} message - 표시할 로딩 메시지
 */
const LoadingPage = ({ message = "데이터를 불러오는 중..." }) => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length < 3 ? prev + '.' : ''));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <Card className="text-center p-10 max-w-sm w-full shadow-xl">
                <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">
                    {message}
                </h2>
                <p className="text-indigo-500 mt-2 text-2xl font-bold">
                    {dots}
                </p>
            </Card>
        </div>
    );
};

export default LoadingPage;