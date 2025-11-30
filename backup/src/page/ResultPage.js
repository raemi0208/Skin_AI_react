import React, { useState, useMemo, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import NoteInput from '../components/Notes/NoteInput';
import { parseCombinedData } from '../utils/diagnosisParser';
import useSkinNotes from '../hooks/useSkinNotes';
import { getTodayDate } from '../utils/date';

// ResultPage Props:
// goHome, goContrastPage, goNotesPage
// onConfirmRewrite, onCancelRewrite
// lastDiagnosisPhoto
// rawDiagnosisData (진단 결과 배열)

const ResultPage = ({
  goHome,
  goContrastPage,
  goNotesPage,
  onConfirmRewrite,
  lastDiagnosisPhoto,
  rawDiagnosisData,
}) => {
  const { skinNotes, addNote } = useSkinNotes();

  // rawDiagnosisData가 없으면 임시 mock 데이터
  if (!rawDiagnosisData || rawDiagnosisData.length === 0) {
    rawDiagnosisData = [
      {
        model: "Oily",
        summary: "피부가 지성입니다",
        recommendation: "수분 보충 필수",
        details: { 수분: "70%", 유분: "65%" }
      }
    ];
  }

  const lastDiagnosis = rawDiagnosisData[rawDiagnosisData.length - 1];
  const parsedResult = parseCombinedData(lastDiagnosis);

  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const today = getTodayDate();
  const todayNote = useMemo(() => {
    return skinNotes.find(note => note.date === today) || null;
  }, [skinNotes, today]);

  const handleSaveNote = useCallback((content) => {
    const noteToSave = {
      id: Date.now().toString(),
      date: today,
      content: content,
      diagnosisSummary: parsedResult?.summary || '분석 결과 기반 기록',
      createdAt: new Date().toISOString(),
    };

    if (todayNote) {
      setShowConfirmModal(true);
    } else {
      addNote(noteToSave);
      setShowNoteInput(false);
      goNotesPage();
    }
  }, [todayNote, parsedResult, addNote, goNotesPage, today]);

  const handleConfirmRewrite = useCallback(() => {
    onConfirmRewrite();
    setShowConfirmModal(false);
    goNotesPage();
  }, [onConfirmRewrite, goNotesPage]);

  if (!lastDiagnosis || !parsedResult) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header title="🚨 오류" onBackClick={goHome} />
        <main className="flex-grow p-4 max-w-xl mx-auto w-full text-center">
          <Card title="분석 결과 없음" className="bg-white shadow-lg border-t-4 border-red-500 p-8">
            <p className="text-lg text-gray-700">죄송합니다. 마지막 분석 결과를 불러올 수 없습니다.</p>
            <Button onClick={goHome} variant="primary" className="mt-6">
              메인으로 돌아가기
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="✨ 피부 분석 결과" onBackClick={goHome} />

      <main className="flex-grow p-4 space-y-6 max-w-xl mx-auto w-full">

        {/* 분석 요약 */}
        <Card title="분석 요약" className="bg-white shadow-lg border-t-4 border-teal-500">
          <div className="flex gap-4 items-start">
            {lastDiagnosisPhoto && (
              <img
                src={lastDiagnosisPhoto}
                alt="Analyzed Face"
                className="w-24 h-24 object-cover rounded-lg shadow-md flex-shrink-0"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/96x96/cccccc/333333?text=Photo" }}
              />
            )}
            <p className="text-gray-700 leading-relaxed">
              <span className="font-semibold text-lg block mb-1">{parsedResult.summary}</span>
              {parsedResult.recommendation}
            </p>
          </div>
        </Card>

        {/* 상세 진단 결과 */}
        <Card title="상세 진단 데이터" className="bg-white shadow-lg">
          <ul className="space-y-2 text-sm text-gray-600">
            {parsedResult.details && Object.entries(parsedResult.details).map(([key, value]) => (
              <li key={key} className="flex justify-between border-b pb-1">
                <span className="font-medium text-gray-800">{key}:</span>
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* 오늘의 스킨케어 기록 */}
        <Card title="오늘의 스킨케어 기록" className="bg-white shadow-lg border-t-4 border-blue-500">
          {todayNote ? (
            <div className="p-4 text-center">
              <p className="text-green-600 font-semibold mb-3">✅ 이미 오늘 기록이 있어요.</p>
              <Button onClick={goNotesPage} variant="secondary">
                기록 수정하러 가기
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {!showNoteInput ? (
                <Button onClick={() => setShowNoteInput(true)} variant="primary" className="w-full">
                  분석 결과 기반으로 노트 기록하기
                </Button>
              ) : (
                <NoteInput
                  initialContent={`${parsedResult.summary}\n\n[오늘의 제품 및 케어 기록]`}
                  onSave={handleSaveNote}
                  onCancel={() => setShowNoteInput(false)}
                  placeholder="분석 결과를 참고하여 오늘 스킨케어를 기록해보세요."
                />
              )}
            </div>
          )}
        </Card>

        {/* 액션 버튼 */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <Button onClick={goHome} variant="outline">🏡 메인</Button>
          <Button onClick={goContrastPage} variant="secondary">🔄 비교 분석</Button>
          <Button onClick={goNotesPage} variant="primary">📝 전체 노트</Button>
        </div>
      </main>

      {/* 덮어쓰기 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card title="⚠️ 기록 덮어쓰기 확인" className="bg-white shadow-2xl p-6 max-w-sm w-full">
            <p className="mb-4">이미 오늘 기록이 있습니다. 새로 기록하시겠습니까? (기존 기록은 삭제됩니다)</p>
            <div className="flex justify-between gap-4">
              <Button onClick={() => setShowConfirmModal(false)} variant="secondary">취소</Button>
              <Button onClick={handleConfirmRewrite} variant="primary">덮어쓰기</Button>
            </div>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ResultPage;
