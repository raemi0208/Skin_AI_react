import React, { useRef, useCallback, useState } from 'react';
import Button from '../Common/Button';
import Card from '../Common/Card';
import { Camera, Upload, CheckCircle } from 'lucide-react';

/**
 * 진단 시작 페이지 (사진 업로드 담당)
 * @param {function} onUpload - 파일 업로드 완료 시 호출 (file, dataUrl)
 * @param {object} lastDiagnosisResult - 마지막 진단 결과 (선택 사항)
 * @param {string} lastDiagnosisPhoto - 마지막 진단 사진 URL (선택 사항)
 */
const UploadPage = ({ onUpload, lastDiagnosisResult, lastDiagnosisPhoto }) => {
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(lastDiagnosisPhoto);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
                setSelectedFile(file);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(lastDiagnosisPhoto);
            setSelectedFile(null);
        }
    }, [lastDiagnosisPhoto]);

    const handleUploadClick = useCallback(() => {
        if (selectedFile && previewUrl) {
            // onUpload를 호출하여 App.js에서 진단 프로세스 시작
            onUpload(selectedFile, previewUrl);
        }
    }, [selectedFile, previewUrl, onUpload]);

    const handleCameraClick = useCallback(() => {
        // 실제 앱 환경에서는 카메라 접근 권한 및 API 사용 필요
        // 여기서는 파일 입력 창을 엽니다.
        fileInputRef.current.click();
    }, []);

    return (
        <div className="space-y-6">
            <Card title="사진 선택 / 촬영" className="p-4 bg-gray-50 border border-gray-200">
                {/* 사진 프리뷰 영역 */}
                <div className="flex justify-center items-center h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden shadow-inner">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x192/94a3b8/ffffff?text=Image+Load+Error" }}
                        />
                    ) : (
                        <span className="text-gray-500">피부 사진을 선택해주세요.</span>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div className="flex justify-center space-x-4">
                    <Button variant="secondary" onClick={handleCameraClick} className="flex items-center">
                        <Camera size={20} className="mr-1" />
                        사진 촬영
                    </Button>
                    <Button variant="outline" onClick={handleCameraClick} className="flex items-center">
                        <Upload size={20} className="mr-1" />
                        파일 선택
                    </Button>
                </div>
            </Card>

            {/* 마지막 진단 결과 요약 */}
            {lastDiagnosisResult && (
                <Card title="최근 진단 정보" className="text-sm p-4 border border-green-200">
                    <div className="flex items-center text-green-700 font-semibold mb-2">
                         <CheckCircle size={16} className="mr-1" />
                         마지막 분석: {lastDiagnosisResult.date}
                    </div>
                    <p className="text-gray-600 line-clamp-2">{lastDiagnosisResult.summary}</p>
                </Card>
            )}

            {/* 진단 시작 버튼 */}
            <Button
                variant="primary"
                onClick={handleUploadClick}
                disabled={!selectedFile}
                className="w-full text-lg py-3 bg-red-500 hover:bg-red-600"
            >
                {selectedFile ? '피부 진단 시작!' : '사진을 선택해주세요'}
            </Button>

            {/* FacePrep은 Upload 후 Processing 전에 렌더링될 수 있으나, 현재 App.js 로직 상 Processing으로 바로 넘어감 */}
        </div>
    );
};

export default UploadPage;