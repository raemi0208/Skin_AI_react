import React from 'react';
import Card from '../Common/Card';
import Button from '../Common/Button';
import { Check, Info, AlertTriangle } from 'lucide-react';

/**
 * 진단 전 얼굴 준비/가이드 페이지 컴포넌트
 * UploadPage에서 사진 선택 후, 분석 전에 가이드를 보여주는 용도로 사용
 * (현재 App.js 흐름에서는 ProcessingPage로 바로 가지만, 향후 확장성을 위해 정의)
 * @param {function} onContinue - 다음 단계로 이동 (진단 시작)
 * @param {string} photoUrl - 진단할 사진의 URL
 */
const FacePrep = ({ onContinue, photoUrl }) => {
    const guidelines = [
        { icon: Check, text: "밝은 곳에서 촬영해주세요.", color: "text-green-500" },
        { icon: Check, text: "얼굴 전체가 화면에 나오도록 해주세요.", color: "text-green-500" },
        { icon: AlertTriangle, text: "화장이나 보정은 피해주세요.", color: "text-red-500" },
        { icon: Info, text: "눈을 감거나 시선을 피하지 말아주세요.", color: "text-blue-500" },
    ];

    return (
        <div className="space-y-6">
            <Card title="2단계: 사진 준비 상태 확인" className="border-t-4 border-yellow-500">
                <div className="flex justify-center mb-4">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt="Face Preview"
                            className="w-40 h-40 object-cover rounded-full shadow-lg border-4 border-white"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/160x160/cccccc/333333?text=Photo+Error" }}
                        />
                    ) : (
                        <div className="w-40 h-40 flex items-center justify-center bg-gray-200 rounded-full text-gray-500">
                            사진 없음
                        </div>
                    )}
                </div>

                <h3 className="text-lg font-semibold text-center mb-4">진단 품질을 위한 가이드라인</h3>
                <ul className="space-y-2">
                    {guidelines.map((g, index) => (
                        <li key={index} className="flex items-start">
                            <g.icon size={18} className={`flex-shrink-0 mt-1 mr-2 ${g.color}`} />
                            <span className="text-gray-700">{g.text}</span>
                        </li>
                    ))}
                </ul>
            </Card>

            <Button
                variant="primary"
                onClick={onContinue}
                className="w-full text-lg py-3"
            >
                진단 시작하기
            </Button>
        </div>
    );
};

export default FacePrep;