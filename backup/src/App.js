import React, { useState, useEffect, useMemo, useCallback} from 'react';

import NavBar from './components/NavBar';
import UserInfoModal from './components/UserInfoModal';
import HomePage from './page/HomePage';
import DiagnosisPage from './page/DiagnosisPage';
import FacePrepPage from './components/Diagnosis/FacePrep';
import PhotoUploadPage from './components/Diagnosis/UploadPage';
import LoadingPage from './components/Diagnosis/LoadingPage';
import DiagnosisResultPage from './page/ResultPage';
import SkinNotePage from './page/NotesPage';
import SkinNoteHistoryPage from './page/SkinNoteHistoryPage';
import ContrastPage from './page/ContrastPage';
import ProcessingPage from './components/Diagnosis/ProcessingPage';


import {
    initializeUserId,
    loadLastDiagnosis,
    loadLastDiagnosisPhoto
} from './utils/storage';

import useSkinNotes from './hooks/useSkinNotes';
import { startDiagnosis as apiStartDiagnosis } from './utils/api';
import { getTodayDate } from './utils/date';

function App() {

    const [page, setPage] = useState('home');

    const [userId] = useState(initializeUserId);
    const [userIp, setUserIp] = useState('');

    const {
        skinNotes,
        saveSkinNote,
        deleteTodayNote
    } = useSkinNotes();

    const [lastDiagnosisResult, setLastDiagnosisResult] = useState(loadLastDiagnosis);
    const [lastDiagnosisPhoto, setLastDiagnosisPhoto] = useState(loadLastDiagnosisPhoto);

    const [currentImageFile, setCurrentImageFile] = useState(null);
    const [currentUserInputs, setCurrentUserInputs] = useState(null);

    const [processingError, setProcessingError] = useState(null);
    const [isProcessingAPI, setIsProcessingAPI] = useState(false);

    const [showUserInfoModal, setShowUserInfoModal] = useState(false);

    // ----------------------
    // 페이지 이동 함수들
    // ----------------------
    const goHome = useCallback(() => setPage('home'), []);
    const goDiagnosis = useCallback(() => setPage('diagnosis'), []);
    const goFacePrep = useCallback(() => setPage('face-prep'), []);
    const goUpload = useCallback(() => setPage('upload'), []);
    const goLoading = useCallback(() => setPage('loading'), []);
    const goProcessing = useCallback(() => setPage('processing'), []);
    const goResult = useCallback(() => setPage('result'), []);
    const goSkinNoteHistory = useCallback(() => setPage('skinNoteHistory'), []);
    const goSkinNote = useCallback(() => setPage('skinNote'), []);
    const goContrast = useCallback(() => setPage('contrast'), []);

    const toggleUserInfoModal = useCallback(() => {
        setShowUserInfoModal(prev => !prev);
    }, []);

    const canWriteToday = useMemo(() => {
        return !skinNotes.some(note => note.date === getTodayDate());
    }, [skinNotes]);

    // ----------------------
    // 진단 시작
    // ----------------------
    const handleStartDiagnosis = useCallback((imageFile, userInputs, photoUrl) => {
        setCurrentImageFile(imageFile);
        setCurrentUserInputs(userInputs);
        setLastDiagnosisPhoto(photoUrl);
        setProcessingError(null);
        goProcessing();
    }, [goProcessing]);

    // ----------------------
    // ProcessingPage → 실제 API 호출
    // ----------------------
    useEffect(() => {
        let cancelled = false;

        const analyze = async () => {
            if (page !== 'processing') return;
            if (!currentImageFile || !currentUserInputs) return;

            try {
                setIsProcessingAPI(true);
                const result = await apiStartDiagnosis(
                    currentImageFile,
                    currentUserInputs,
                    userId,
                    userIp
                );

                if (!cancelled) {
                    setLastDiagnosisResult(result);
                    setIsProcessingAPI(false);
                    goResult();
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) {
                    setProcessingError(err.message || String(err));
                    setIsProcessingAPI(false);
                }
            }
        };

        analyze();

        return () => { cancelled = true; };
    }, [page, currentImageFile, currentUserInputs, userId, userIp, goResult]);

    // ----------------------
    // 노트 작성 완료 처리
    // ----------------------
    const handleNoteSave = (note) => {
        saveSkinNote(note);
        goSkinNoteHistory();
    };

    const handlePhotoUploadSuccess = (photoUrl) => {
        setLastDiagnosisPhoto(photoUrl);
    };

    return (
        <div className="app-container">
            <NavBar
                onGoHome={goHome}
                onGoSkinNoteHistory={goSkinNoteHistory}
                onUserIconClick={toggleUserInfoModal}
                onGoContrast={goContrast}
            />

            {page === 'home' && <HomePage onStartDiagnosis={goDiagnosis} />}
            {page === 'diagnosis' && <DiagnosisPage onNext={goFacePrep} onPrev={goHome} />}
            {page === 'face-prep' && <FacePrepPage onPrev={goDiagnosis} onNext={goUpload} />}
            {page === 'upload' &&
                <PhotoUploadPage
                    onPrev={goFacePrep}
                    onNext={goProcessing}
                    onUploadSuccess={handlePhotoUploadSuccess}
                    onStartDiagnosis={handleStartDiagnosis}
                />
            }
            {page === 'loading' && <LoadingPage onComplete={goResult} />}
            {page === 'processing' && (
                <ProcessingPage
                    isProcessing={isProcessingAPI}
                    error={processingError}
                    onComplete={goResult}
                />
            )}
            {page === 'result' &&
                <DiagnosisResultPage
                    lastDiagnosis={lastDiagnosisResult}
                    onGoSkinNote={goSkinNote}
                    onGoHome={goHome}
                />
            }
            {page === 'skinNoteHistory' &&
                <SkinNoteHistoryPage
                    notes={skinNotes}
                    canWriteToday={canWriteToday}
                    onGoDiary={goSkinNote}
                    onGoHome={goHome}
                />
            }
            {page === 'skinNote' &&
                <SkinNotePage
                    onNoteSave={handleNoteSave}
                    onPrev={goSkinNoteHistory}
                    defaultPhotoUrl={lastDiagnosisPhoto}
                    canWriteToday={canWriteToday}
                    onConfirmRewrite={deleteTodayNote}
                    onCancelRewrite={goSkinNoteHistory}
                />
            }
            {page === 'contrast' &&
                <ContrastPage
                    notes={skinNotes}
                    lastPhotoUrl={lastDiagnosisPhoto}
                    onGoHome={goHome}
                />
            }

            {showUserInfoModal &&
                <UserInfoModal
                    userId={userId}
                    userIp={userIp}
                    onClose={toggleUserInfoModal}
                />
            }
        </div>
    );
}

export default App;
