import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NoteCard from '../components/Note/NoteCard';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import useSkinNotes from '../hooks/useSkinNotes';
import { parseCombinedData } from '../utils/diagnosisParser';

// ----------------------------------------------------
// UI/Interaction Props:
// - goHome: 홈 페이지로 이동
// ----------------------------------------------------

const ContrastPage = ({ goHome }) => {
    const { skinNotes, lastDiagnosisResult, lastDiagnosisPhoto } = useSkinNotes();
    const [selectedNoteId, setSelectedNoteId] = useState(null);

    // 마지막 진단 결과 파싱
    const lastResultParsed = useMemo(() => {
        if (lastDiagnosisResult) {
            return DiagnosisParser.parse(lastDiagnosisResult);
        }
        return null;
    }, [lastDiagnosisResult]);

    // 선택된 과거 노트 찾기
    const selectedNote = useMemo(() => {
        return skinNotes.find(note => note.id === selectedNoteId);
    }, [skinNotes, selectedNoteId]);

    // 선택된 노트의 진단 요약
    const selectedNoteDiagnosisSummary = useMemo(() => {
        if (selectedNote && selectedNote.diagnosisSummary) {
            // 과거 노트에 저장된 진단 요약을 파싱하여 표시
            return selectedNote.diagnosisSummary;
        }
        return '선택된 과거 기록에는 진단 결과 요약이 없습니다.';
    }, [selectedNote]);


    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header title="🔄 분석 결과 비교" onBackClick={goHome} />

            <main className="flex-grow p-4 space-y-6 max-w-2xl mx-auto w-full">

                {/* 섹션 1: 비교 대상 선택 */}
                <Card title="1단계: 과거 기록 선택" className="bg-white shadow-lg border-t-4 border-indigo-500">
                    <select
                        value={selectedNoteId || ''}
                        onChange={(e) => setSelectedNoteId(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- 비교할 과거 기록을 선택하세요 --</option>
                        {skinNotes
                            .filter(note => note.diagnosisSummary) // 진단 결과가 있는 노트만 비교 대상으로
                            .map(note => (
                                <option key={note.id} value={note.id}>
                                    {note.date} - {note.diagnosisSummary.substring(0, 20)}...
                                </option>
                            ))}
                    </select>
                </Card>

                {/* 섹션 2: 비교 분석 결과 */}
                {selectedNote && lastResultParsed && (
                    <Card title="2단계: 비교 분석" className="bg-white shadow-2xl border-t-4 border-green-500">
                        <div className="grid grid-cols-2 gap-4">
                            {/* 현재 결과 */}
                            <div className="p-4 bg-blue-50 rounded-lg shadow-inner border border-blue-200">
                                <h3 className="text-xl font-bold text-blue-700 mb-3">최근 분석 (오늘)</h3>
                                {lastDiagnosisPhoto && (
                                    <img
                                        src={lastDiagnosisPhoto}
                                        alt="Recent Diagnosis"
                                        className="w-full h-32 object-cover rounded-md mb-3 shadow"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x128/e0e7ff/3b82f6?text=Recent+Photo" }}
                                    />
                                )}
                                <p className="font-semibold text-gray-800">요약:</p>
                                <p className="text-sm text-gray-600 mb-4">{lastResultParsed.summary}</p>

                                <p className="font-semibold text-gray-800">나의 기록:</p>
                                <p className="text-sm text-gray-600 italic">
                                    {selectedNote.content.substring(0, 100)}...
                                </p>
                            </div>

                            {/* 과거 결과 */}
                            <div className="p-4 bg-yellow-50 rounded-lg shadow-inner border border-yellow-200">
                                <h3 className="text-xl font-bold text-yellow-700 mb-3">과거 기록 ({selectedNote.date})</h3>
                                <div className="w-full h-32 flex items-center justify-center bg-gray-200 rounded-md mb-3">
                                    <span className="text-gray-500 text-xs">과거 사진 없음 (데이터 구조 상)</span>
                                </div>
                                <p className="font-semibold text-gray-800">요약:</p>
                                <p className="text-sm text-gray-600 mb-4">{selectedNoteDiagnosisSummary}</p>

                                <p className="font-semibold text-gray-800">나의 기록:</p>
                                <p className="text-sm text-gray-600 italic">
                                    {selectedNote.content.substring(0, 100)}...
                                </p>
                            </div>
                        </div>

                        {/* 비교 분석 텍스트 */}
                        <div className="mt-6 p-4 border-t pt-4">
                            <h4 className="text-lg font-bold text-red-600 mb-2">💡 분석 결과 변화 (가정)</h4>
                            <p className="text-gray-700">
                                *주의: 이 부분은 실제 AI 분석 로직이 없으므로 가상의 비교 텍스트입니다.*
                                <br />
                                과거 기록({selectedNote.date}) 대비 최근 분석 결과는 **'홍조가 약간 개선'**된 경향을 보입니다.
                                이는 '수분 충전 및 진정' 위주의 케어 기록과 연관될 수 있습니다. 다음 목표는 **'모공 관리 강화'**를 추천합니다.
                            </p>
                        </div>
                    </Card>
                )}

                {/* 선택하지 않았을 때 */}
                {!selectedNote && (
                     <Card title="비교 준비" className="bg-white shadow-lg p-8 text-center text-gray-500">
                        <p>과거 진단 기록이 포함된 노트를 선택해 주세요.</p>
                     </Card>
                )}

                {/* 섹션 3: 액션 버튼 */}
                <div className="flex justify-center pt-4">
                    <Button onClick={goHome} variant="outline" className="w-full max-w-sm">
                        🏡 메인으로 돌아가기
                    </Button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContrastPage;