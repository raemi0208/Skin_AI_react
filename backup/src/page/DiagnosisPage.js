import React, { useState, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UploadPage from '../components/Diagnosis/UploadPage';
import Card from '../components/Common/Card';
import useSkinNotes from '../hooks/useSkinNotes';
import { saveLastDiagnosisPhoto } from '../utils/storage';

// ----------------------------------------------------
// UI/Interaction Props:
// - goHome: 홈 페이지로 이동
// - startProcessing: 분석 시작 (Loading/Processing 페이지로 이동)
// - goResultPage: 결과 페이지로 바로 이동 (예시용)
// ----------------------------------------------------

const DiagnosisPage = ({ goHome, startProcessing, goResultPage }) => {
    const { lastDiagnosisResult, lastDiagnosisPhoto } = useSkinNotes();
    const [photoFile, setPhotoFile] = useState(null);

    // 파일이 업로드되었을 때 처리
    const handlePhotoUpload = useCallback(async (file, dataUrl) => {
        // 실제로는 파일을 서버에 업로드하는 로직이 필요
        // 여기서는 임시로 LocalStorage에 저장하고, 분석 프로세스 시작
        setPhotoFile(file);

        // 마지막 진단 사진을 LocalStorage에 저장 (Data URL)
        await saveLastDiagnosisPhoto(dataUrl);

        // 다음 단계인 'FacePrep' 페이지로 넘어가거나, 바로 분석 시작 페이지로 이동
        // 현재는 'UploadPage'가 FacePrep의 역할 일부를 수행한다고 가정하고, 바로 분석 시작
        startProcessing(dataUrl); // 분석 시작 페이지로 이동 및 Data URL 전달
    }, [startProcessing]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header title="📸 피부 분석 시작" onBackClick={goHome} />

            <main className="flex-grow p-4 space-y-6 max-w-xl mx-auto w-full">
                <Card title="1단계: 사진 업로드" className="bg-white shadow-lg border-t-4 border-red-500">
                    <UploadPage
                        onUpload={handlePhotoUpload}
                        lastDiagnosisResult={lastDiagnosisResult}
                        lastDiagnosisPhoto={lastDiagnosisPhoto}
                    />
                </Card>

                {/* 진단 과정의 다른 페이지들(FacePrep, Loading, Result 등)은
                    App.js에서 이 페이지를 라우팅할 때 `page` 상태에 따라 자동으로 렌더링 됩니다.
                    이 DiagnosisPage는 사실상 진단 과정 전체의 '시작점'을 나타냅니다. */}
            </main>

            <Footer />
        </div>
    );
};

export default DiagnosisPage;