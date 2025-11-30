import React from 'react';
import Card from './Common/Card';
import Button from './Common/Button';
import { X, User, Zap } from 'lucide-react';

/**
 * 사용자 정보 및 디버그 정보를 표시하는 모달
 * @param {string} userId - 사용자 고유 ID
 * @param {string} userIp - 사용자 IP (가정)
 * @param {function} onClose - 모달 닫기 핸들러
 */
const UserInfoModal = ({ userId, userIp, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity">
            <Card className="relative p-6 max-w-lg w-full shadow-2xl animate-fade-in">
                <div className="flex justify-between items-start border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-indigo-700 flex items-center">
                        <User size={24} className="mr-2" />
                        사용자 정보 및 시스템
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition"
                        aria-label="모달 닫기"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                             <Zap size={16} className="mr-2 text-indigo-600" />
                            시스템 식별 정보 (Debug)
                        </h3>
                        <div className="space-y-1 text-sm">
                            <p>
                                <span className="font-medium w-24 inline-block">User ID:</span>
                                <code className="bg-gray-200 p-1 rounded text-xs">{userId}</code>
                            </p>
                            <p>
                                <span className="font-medium w-24 inline-block">App IP:</span>
                                <code className="bg-gray-200 p-1 rounded text-xs">{userIp}</code>
                            </p>
                            <p>
                                <span className="font-medium w-24 inline-block">Version:</span>
                                <code className="bg-gray-200 p-1 rounded text-xs">v1.0.0 (Modularized)</code>
                            </p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <h3 className="font-semibold text-gray-700 mb-2">데이터 저장소</h3>
                        <p className="text-sm text-gray-600">
                            이 애플리케이션의 데이터 (노트, 진단 결과)는 브라우저의 로컬 저장소(Local Storage)에 저장됩니다.
                            브라우저 캐시를 지우면 데이터가 삭제될 수 있습니다.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button variant="primary" onClick={onClose}>
                        확인
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default UserInfoModal;