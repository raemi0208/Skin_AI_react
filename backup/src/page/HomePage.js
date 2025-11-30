import React, { useMemo, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TodayNote from '../components/Notes/TodayNote';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import useSkinNotes from '../hooks/useSkinNotes';
import useUserInfo from '../hooks/useUserInfo';

// ----------------------------------------------------
// UI/Interaction Props:
// - goDiagnosisPage: 진단 시작 페이지로 이동
// - goNotesPage: 노트 목록 페이지로 이동
// - toggleUserInfoModal: 사용자 정보 모달 열기/닫기
// ----------------------------------------------------

const HomePage = ({ goDiagnosisPage, goNotesPage, toggleUserInfoModal }) => {
    // Hooks에서 데이터 불러오기
    const { skinNotes, lastDiagnosisResult, lastDiagnosisPhoto } = useSkinNotes();
    const { userId, userIp } = useUserInfo(); // 필요하다면 userId나 userIp를 표시

    // 오늘 날짜의 노트 찾기
    const getTodayDate = () => new Date().toISOString().split('T')[0];
    const todayNote = useMemo(() => {
        const today = getTodayDate();
        return skinNotes.find(note => note.date === today) || null;
    }, [skinNotes]);

    const hasDiagnosisResult = !!lastDiagnosisResult;

    // '오늘의 피부 분석' 카드 내용
    const renderTodayAnalysis = () => {
        if (!hasDiagnosisResult) {
            return (
                <div className="flex flex-col items-center justify-center p-6 text-gray-500">
                    <p className="text-lg mb-4">아직 분석 결과가 없어요.</p>
                    <Button onClick={goDiagnosisPage} variant="primary" className="shadow-lg">
                        <span className="text-xl font-bold">지금 바로 분석하기!</span>
                    </Button>
                </div>
            );
        }

        // 결과 요약 텍스트 생성
        const summary = lastDiagnosisResult.summary
            ? lastDiagnosisResult.summary
            : "지난 분석 결과를 확인해보세요.";

        return (
            <div className="space-y-4">
                <p className="text-gray-700">{summary}</p>
                <div className="flex justify-between items-center pt-2">
                    {lastDiagnosisPhoto && (
                        <img
                            src={lastDiagnosisPhoto}
                            alt="Last Diagnosis"
                            className="w-20 h-20 object-cover rounded-md shadow-md"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/cccccc/333333?text=No+Image" }}
                        />
                    )}
                    <Button onClick={goDiagnosisPage} variant="secondary">
                        재분석/비교하기
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header title="스킨케어 다이어리" onUserIconClick={toggleUserInfoModal} />

            <main className="flex-grow p-4 space-y-6 max-w-xl mx-auto w-full">
                {/* 섹션 1: 오늘의 분석 결과 요약 */}
                <Card title="📈 오늘의 피부 분석" className="bg-white shadow-lg border-t-4 border-indigo-500">
                    {renderTodayAnalysis()}
                </Card>

                {/* 섹션 2: 오늘 기록한 노트 */}
                <Card title="📝 오늘의 기록" className="bg-white shadow-lg">
                    {todayNote ? (
                        <TodayNote note={todayNote} />
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            오늘의 스킨케어 기록이 없어요. 노트 페이지에서 기록을 남겨보세요.
                        </div>
                    )}
                </Card>

                {/* 섹션 3: 바로가기 버튼 */}
                <div className="grid grid-cols-2 gap-4">
                    <Button onClick={goDiagnosisPage} variant="primary" className="h-20 text-lg shadow-md bg-green-500 hover:bg-green-600">
                        피부 진단 시작
                    </Button>
                    <Button onClick={goNotesPage} variant="secondary" className="h-20 text-lg shadow-md">
                        노트 기록 전체 보기
                    </Button>
                </div>
            </main>

            {/* Footer는 Navigation 역할은 하지 않으므로 간단히 정보만 표시 */}
            <Footer />
        </div>
    );
};

export default HomePage;