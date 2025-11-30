import React, { useEffect, useState } from 'react';
import Card from '../Common/Card';

/**
 * AI 분석 진행 중 화면 컴포넌트
 * @param {function} onComplete - 분석 완료 시 호출
 * @param {number} duration - 시뮬레이션 지속 시간 (ms)
 * @param {function} onBack - 취소 버튼 클릭 핸들러 (선택 사항)
 */
const ProcessingPage = ({ onComplete, duration = 3000, onBack }) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("분석 환경 설정 중...");

    useEffect(() => {
        const startTime = Date.now();
        const interval = 50; // 50ms 마다 업데이트

        const progressUpdate = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const newProgress = Math.min(100, Math.floor((elapsedTime / duration) * 100));
            setProgress(newProgress);

            if (newProgress < 30) {
                setStatus("이미지 전처리 및 특징 추출 중...");
            } else if (newProgress < 80) {
                setStatus("Gemini 모델 기반 피부 분석 진행 중...");
            } else if (newProgress < 100) {
                setStatus("결과 요약 및 추천 로직 적용 중...");
            }

            if (newProgress === 100) {
                clearInterval(progressUpdate);
                onComplete();
            }
        }, interval);

        return () => clearInterval(progressUpdate);
    }, [duration, onComplete]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="text-center p-8 max-w-md w-full shadow-2xl border-t-8 border-teal-500">
                <h2 className="text-3xl font-extrabold text-teal-700 mb-6">
                    AI 피부 분석 중
                </h2>
                
                {/* 진행 상태 바 */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div
                        className="bg-teal-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <p className="text-xl font-bold text-gray-800 mb-4">
                    {progress}% 완료
                </p>

                <p className="text-sm text-gray-500 italic mb-6">
                    {status}
                </p>

                {onBack && (
                    <button
                        onClick={onBack}
                        className="text-sm text-indigo-500 hover:text-indigo-700 transition"
                    >
                        분석 취소 및 돌아가기
                    </button>
                )}
            </Card>
        </div>
    );
};

export default ProcessingPage;