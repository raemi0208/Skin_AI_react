import React, { useState, useEffect } from 'react';
import './App.css';

// ******************************************************
// ** 백엔드 API 연결 (AI 분석 기능)
// ******************************************************

// --- API 설정 ---
const API_BASE_URL = "http://ckrudgh77.tplinkdns.com:9000"; 
const API_KEY = "our-super-secret-key-for-skin-project-12345"; // .env 파일에서 가져온 API Key
const COMBINED_DATA_TEXT = "통합 분석 결과 요약"; // 파싱에 사용x

/**
 * AI 분석을 요청하는 메인 함수
 * @param {File} imageFile 
 * @param {{gender: string, birthYear: number, birthMonth: number, concerns: string[]}} userInputs 
 * @param {string} userId 
 * @param {string} userIp 
 * @returns {Promise<any>} 분석 결과 객체
 */
const startDiagnosis = async (imageFile, userInputs, userId, userIp) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const apiGender = userInputs.gender === 'female' ? '여성' : '남성';
    formData.append('gender', apiGender); 
    formData.append('birth_year', String(userInputs.birthYear));
    formData.append('birth_month', String(userInputs.birthMonth)); 
    formData.append('concerns', JSON.stringify(userInputs.concerns));

    console.log("AI 분석 요청 시작:", userInputs, userId, userIp);
    
    // API 요청
    try {
        const response = await fetch(`${API_BASE_URL}/analyze/skin`, {
            method: 'POST',
            headers: {
                'X-API-KEY': API_KEY,
            },
            body: formData,
        });

        if (!response.ok) {
            // HTTP 오류 처리
            const errorText = await response.text();
            throw new Error(`분석 실패: 서버 응답 상태 ${response.status}. 메시지: ${errorText}`);
        }

        const result = await response.json();
        console.log("AI 분석 결과 수신:", result);
        return result;

    } catch (error) {
        console.error("AI 분석 중 오류 발생:", error);
        throw new Error(error.message || "알 수 없는 통신 오류가 발생했습니다.");
    }
};


// ******************************************************
// ** 로컬 저장소 및 유틸리티 함수 **
// ******************************************************

const SKIN_NOTES_KEY = 'skinNotes';

// 현재 날짜를 'YYYY-MM-DD' 형식으로 반환
const getTodayDate = () => new Date().toISOString().split('T')[0];

// 사용자 ID를 로컬 저장소에서 불러오거나 새로 생성
const initializeUserId = () => {
    let storedId = localStorage.getItem('appUserId');
    if (!storedId) {
        // 간단한 고유 ID 생성
        storedId = 'user-' + Date.now();
        localStorage.setItem('appUserId', storedId);
    }
    return storedId;
};

// 모든 스킨 노트 데이터를 불러오는 함수
const loadSkinNotes = () => {
    try {
        const serializedNotes = localStorage.getItem(SKIN_NOTES_KEY);
        // JSON.parse를 시도하고, 데이터가 없으면 빈 배열을 반환
        return serializedNotes ? JSON.parse(serializedNotes) : [];
    } catch (e) {
        console.error("Error loading skin notes:", e);
        return [];
    }
};

// 새로운 스킨 노트 데이터를 저장하는 함수
const saveSkinNote = (newNote) => {
    // 1. 기존 데이터를 불러옵니다.
    const existingNotes = loadSkinNotes();

    // 2. 새 노트를 배열의 맨 앞에 추가 (최신 기록이 먼저 보이도록)
    const updatedNotes = [newNote, ...existingNotes];

    // 3. 업데이트된 배열을 로컬 스토리지에 저장
    try {
        localStorage.setItem(SKIN_NOTES_KEY, JSON.stringify(updatedNotes));
        return updatedNotes;
    } catch (e) {
        console.error("Error saving skin note:", e);
        return existingNotes; // 저장 실패 시 기존 데이터 반환
    }
};

/**
 * 특정 날짜의 스킨 노트를 삭제하고 업데이트된 배열 반환
 * @param {string} dateToDelete - 삭제할 노트의 날짜 ('YYYY-MM-DD')
 * @returns {Array} 업데이트된 스킨 노트 배열
 */
const deleteSkinNote = (dateToDelete) => {
    const existingNotes = loadSkinNotes();

    // 1. 삭제할 날짜를 제외한 노트만 필터링
    const updatedNotes = existingNotes.filter(note => note.date !== dateToDelete);

    // 2. 업데이트된 배열을 로컬 스토리지에 저장
    try {
        localStorage.setItem(SKIN_NOTES_KEY, JSON.stringify(updatedNotes));
        return updatedNotes;
    } catch (e) {
        console.error("Error deleting skin note:", e);
        return existingNotes; // 삭제 실패 시 기존 데이터 반환
    }
};

// ******************************************************
// ** 등급 변환 유틸리티 함수 **
// ******************************************************

// 등급 매핑 (높은 등급일수록 큰 값): A+ > A0 > B+ > B0 > C+ > C0 > D0
const GRADE_MAP = {
    'A+': 4, 'A0': 3,
    'B+': 2, 'B0': 1,
    'C+': 0, 'C0': -1,
    'D+': -2, 'D0': -3,
};

// 등급 값 -> 등급 문자열 역매핑
const GRADE_MAP_REVERSE = {
    4: 'A+', 
    3: 'A0',
    2: 'B+', 
    1: 'B0',
    0: 'C+',
    '-1': 'C0',
    '-2': 'D+', 
    '-3': 'D0'
};

/**
 * 등급 문자열을 숫자로 변환합니다. (높은 등급일수록 큰 값)
 * @param {string} gradeString - '등급 C0', '백분위 80.6% / 등급 A+', 'A+' 형태의 문자열
 * @returns {number} 등급을 대표하는 숫자 (높은 등급일수록 큰 숫자)
 */
const getGradeValue = (gradeString) => {
    if (!gradeString) return -10;
    // 'A+', 'C0' 등의 등급 부분만 추출
    const match = gradeString.match(/(A\+|A0|B\+|B0|C\+|C0|D\+|D0)/i); 
    const grade = match ? match[0].toUpperCase() : '';

    return GRADE_MAP[grade] !== undefined ? GRADE_MAP[grade] : -10; // 매치되는 등급이 없으면 매우 낮은 값
};

/**
 * 평균 등급 값에서 가장 가까운 등급 문자열을 반환
 * @param {number} value - 평균 등급 값 (예: 1.5)
 * @returns {string} 등급 문자열 (예: 'B+')
 */
const getGradeFromValue = (value) => {
    const keys = Object.keys(GRADE_MAP_REVERSE).map(Number).sort((a, b) => b - a);
    
    // 가장 가까운 키를 찾음 (예: 1.5 -> 2(B+), 0.5 -> 0(C+))
    let nearestKey = keys[0]; // 기본값: 최고 등급

    for (const key of keys) {
        if (value >= key) {
            nearestKey = key;
            break;
        }
    }
    return GRADE_MAP_REVERSE[nearestKey] || 'N/A';
};

// 등급 색상 매핑 함수
const getGradeColor = (grade) => {
    // 등급 문자열에서 등급 부분만 추출하여 getGradeValue에 전달
    const gradePartMatch = grade.match(/(A\+|A0|B\+|B0|C\+|C0|D\+|D0)/i);
    const gradePart = gradePartMatch ? gradePartMatch[0] : grade;
    
    const gradeValue = getGradeValue(gradePart);

    if (gradeValue >= 3) return 'var(--accent-color)'; // A0, A+
    if (gradeValue >= 1) return '#4c78d0'; // B0, B+
    if (gradeValue >= 0) return '#ffaa00'; // C+
    if (gradeValue >= -3) return '#d9534f'; // C0, D0, D+
    return 'var(--sub-text-color)';
};

// ******************************************************
// ** 등급 해석 유틸리티 함수 **
// ******************************************************

/**
 * 등급과 지표에 따른 해석 문구를 반환
 * @param {string} gradeString - 등급 문자열 ('A+', 'C0' 등)
 * @param {string} metric - 지표 이름 ('탄력', '수분', '모공' 등)
 * @returns {string} 해석 문구
 */
const getGradeDescription = (gradeString, metric) => {
    const value = getGradeValue(gradeString);

    // 1. 탄력, 수분: 높을수록 좋음 (Positive Metrics)
    if (metric === '탄력' || metric === '수분') {
        if (value >= 3) return '매우 우수함: 평균 대비 월등히 좋은 상태입니다.'; // A0, A+
        if (value >= 1) return '양호함: 평균 대비 좋은 상태입니다.'; // B0, B+
        if (value >= 0) return '보통 수준: 평균적인 상태입니다.'; // C+
        if (value >= -1) return '주의 필요: 관리가 필요한 상태입니다.'; // C0
        if (value >= -3) return '심각: 전문적인 관리가 시급합니다.'; // D0, D+
        return '데이터 부족';
    } 
    // 2. 모공, 색소, 주름, 처짐, 건조: 낮을수록 좋음 (Negative/Severity Metrics)
    // (높은 등급(A+)이 낮은 심각도(좋은 상태)를 의미하도록 로직 반전)
    else if (['모공', '색소', '주름', '처짐', '건조'].includes(metric)) {
        if (value >= 3) return '매우 우수함: 심각도가 거의 없어 깨끗한 상태입니다.'; // A0, A+
        if (value >= 1) return '양호함: 평균 대비 심각도가 낮은 상태입니다.'; // B0, B+
        if (value >= 0) return '보통 수준: 평균적인 심각도를 보입니다.'; // C+
        if (value >= -1) return '주의 필요: 눈에 띄게 심화될 수 있으니 관리가 필요합니다.'; // C0
        if (value >= -3) return '심각: 집중적인 관리 또는 상담이 시급합니다.'; // D0, D+
        return '데이터 부족';
    }

    return '해석 정보 없음';
};


// ******************************************************
// ** Combined Data 파싱 함수 (JSON 기반으로 전체 교체) *
// ******************************************************

/**
 * AI 분석 결과를 파싱하여 결과 페이지에 표시할 형태로 변환
 * @param {object} combinedResult - AI API의 전체 JSON 응답 객체
 * @returns {object} {model: {gender, age, diseases, areas}, summary, chartData, imageUrl}
 */
const parseCombinedData = (combinedResult) => {
    // 1. 유효성 검사 및 기본 구조 초기화
    if (!combinedResult || !combinedResult.meta || !combinedResult.parts_analysis) {
        console.error("Invalid combinedResult structure received:", combinedResult);
        return {
            model: { gender: 'N/A', age: 'N/A', diseases: [], areas: {} },
            summary: {
                bestElasticity: { grade: 'N/A', area: 'N/A', gradeValue: -10 },
                worstMoisture: { grade: 'N/A', area: 'N/A', gradeValue: 10 },
                bestPore: { grade: 'N/A', area: 'N/A', gradeValue: -10 }
            },
            chartData: {},
            imageUrl: combinedResult.imageUrl || null // 이미지 URL을 포함하도록 수정
        };
    }
    
    const meta = combinedResult.meta;
    const result = {
        model: {
            gender: 'N/A',
            age: 'N/A',
            diseases: [],
            areas: {} // 최종 표시될 통합/단일 영역 데이터
        },
        summary: {
            bestElasticity: { grade: 'N/A', area: 'N/A', gradeValue: -10 },
            worstMoisture: { grade: 'N/A', area: 'N/A', gradeValue: 10 },
            bestPore: { grade: 'N/A', area: 'N/A', gradeValue: -10 }
        },
        chartData: {}, // 그래프 데이터
        imageUrl: combinedResult.imageUrl || null // 이미지 URL 포함
    };

    // 2. 기본 메타 정보 추출
    const genderMap = { 'F': '여성', 'M': '남성' };
    result.model.gender = genderMap[meta.gender] || '알 수 없음';
    result.model.age = meta.age || '알 수 없음';
    
    // 3. 질환 정보 추출 및 리스트 생성 (Top 3)
    const diseaseData = meta.disease;
    const topDiseases = [diseaseData.top1, diseaseData.top2, diseaseData.top3].filter(d => d);
    
    result.model.diseases = topDiseases.map(d => ({
        name: d.label,
        // 확률은 0.0 ~ 1.0이므로 100을 곱하고 소수점 한 자리까지 반올림
        percent: parseFloat((d.prob * 100).toFixed(1))
    }));

    // 4. 부위별 데이터 통합 및 차트 데이터 생성
    // 부위 이름을 한국어로 매핑하고 통합 기준을 설정
    const partToChartName = {
        forehead: '이마',
        glabella: '이마', // 미간을 이마로 통합
        left_eye: '눈가',
        right_eye: '눈가',
        left_cheek: '볼',
        right_cheek: '볼',
        chin: '턱',
        nose_mouth: '코/입',
    };

    // 통합 영역별로 데이터를 그룹화할 임시 맵
    const aggregatedData = {};

    combinedResult.parts_analysis.forEach(part => {
        const finalArea = partToChartName[part.part_name] || part.part_name;

        // 최종 영역 그룹화 초기화
        aggregatedData[finalArea] = aggregatedData[finalArea] || { metricsGrouped: {}, rawParts: [] };
        aggregatedData[finalArea].rawParts.push(part);
        
        // grades와 classes 항목을 순회하며 그룹화
        const metricsToProcess = {
            ...part.grades,
            ...part.classes
        };

        Object.keys(metricsToProcess).forEach(metricKey => {
            let label = metricKey;
            let valueToUse = null;

            // 라벨 정제
            if (metricKey.includes('elasticity')) {
                label = '탄력';
            } else if (metricKey.includes('moisture')) {
                label = '수분';
            } else if (metricKey.includes('wrinkle') && part.grades && part.grades[metricKey]) {
                label = '주름';
            } else if (metricKey.endsWith('_pore')) {
                label = '모공';
            } else if (metricKey.endsWith('_pigmentation')) {
                label = '색소';
            } else if (metricKey.endsWith('_sagging')) {
                label = '처짐';
            } else if (metricKey.endsWith('_dryness')) {
                label = '건조';
            } else {
                return; // 처리하지 않는 항목은 건너뛰기
            }
            
            // Grades (A+, C0 등) 처리
            if (part.grades && part.grades[metricKey]) {
                const gradeString = part.grades[metricKey];
                const gradeValue = getGradeValue(gradeString);
                valueToUse = { gradeValue, value: gradeString };
            }
            // Classes (1, 2, 3 등) 처리 - 심각도 점수(1:최소, 5:최대)
            else if (part.classes && part.classes[metricKey] !== undefined) {
                const classValue = part.classes[metricKey]; // 1~5 값
                let gradeValue;
                
                // [수정] 심각도 점수 반전 매핑 적용 (1 -> A+, 5 -> D0)
                switch (classValue) {
                    case 1: gradeValue = 4; break; // A+ (최고)
                    case 2: gradeValue = 3; break; // A0
                    case 3: gradeValue = 1; break; // B0
                    case 4: gradeValue = -1; break; // C0
                    case 5: gradeValue = -3; break; // D0 (최저)
                    default: gradeValue = -10;
                }
                
                const gradeString = getGradeFromValue(gradeValue);
                // 심각도 점수와 함께 등급을 표시
                valueToUse = { gradeValue, value: `심각도 ${classValue} (${gradeString} 등급)` };
            }
            
            if (valueToUse) {
                aggregatedData[finalArea].metricsGrouped[label] = aggregatedData[finalArea].metricsGrouped[label] || [];
                aggregatedData[finalArea].metricsGrouped[label].push(valueToUse);
            }
        });
    });


    // 5. 그룹화된 데이터 처리 (평균 등급 계산 및 최종 결과)
    Object.keys(aggregatedData).forEach(finalArea => {
        const { metricsGrouped } = aggregatedData[finalArea];
        const finalAreaMetrics = [];
        const areaChartData = [];

        Object.keys(metricsGrouped).forEach(metricKey => {
            const items = metricsGrouped[metricKey];
            
            // 모든 항목의 평균 등급 값 계산
            let totalGradeValue = 0;
            items.forEach(item => {
                totalGradeValue += item.gradeValue;
            });
            
            const avgGradeValue = items.length > 0 ? totalGradeValue / items.length : -10;
            const avgGradeString = getGradeFromValue(avgGradeValue);
            
            // 표시 값은 원본의 value (ex: A0, 심각도 2 (A0 등급))를 사용하거나, 평균 등급을 사용
            const displayValue = `평균 등급 ${avgGradeString}`;
            const color = getGradeColor(avgGradeString);

            // 최종 요약/차트 데이터에 추가
            // 모공, 색소, 주름 등은 심각도와 평균 등급을 함께 표시
            const exampleValue = items[0].value;
            const finalDisplayValue = exampleValue.startsWith('심각도') 
                ? `${exampleValue} (평균 ${avgGradeString})` 
                : `${displayValue}`;


            finalAreaMetrics.push({
                label: metricKey,
                value: finalDisplayValue
            });

            // 차트 데이터에 추가
            if (['탄력', '수분', '모공', '색소', '주름', '처짐', '건조'].includes(metricKey)) {
                areaChartData.push({
                    label: metricKey,
                    value: avgGradeValue,
                    unit: '등급',
                    displayValue: avgGradeString,
                    color: color
                });
            }
            
            // 종합 요약 업데이트
            if (metricKey === '탄력') {
                if (avgGradeValue > result.summary.bestElasticity.gradeValue) {
                    result.summary.bestElasticity = { grade: avgGradeString, area: finalArea, gradeValue: avgGradeValue };
                }
            } else if (metricKey === '수분') {
                 // 최저(가장 안 좋은) 수분 등급 찾기
                if (avgGradeValue < result.summary.worstMoisture.gradeValue) {
                    result.summary.worstMoisture = { grade: avgGradeString, area: finalArea, gradeValue: avgGradeValue };
                }
            } else if (metricKey === '모공') {
                // 모공은 낮은 심각도(높은 등급 값)가 좋음
                if (avgGradeValue > result.summary.bestPore.gradeValue) {
                    result.summary.bestPore = { grade: avgGradeString, area: finalArea, gradeValue: avgGradeValue };
                }
            }
        });

        if (finalAreaMetrics.length > 0) {
            result.model.areas[finalArea] = finalAreaMetrics;
            result.chartData[finalArea] = areaChartData;
        }
    });

    return result;
};


// ******************************************************
// ** 1. 네비게이션 바 **
// ******************************************************
const NavBar = ({ onGoHome, onGoSkinNoteHistory, onUserIconClick, onGoContrast }) => {
    return ( 
        <header className="navbar-container">
            <div className="navbar-left" onClick={onGoHome}>
                <h1 className="logo-text"> 너의 피부는? </h1>
            </div>
            <nav className="navbar-right">
                <a href="#home" className="nav-link" onClick={(e) => { e.preventDefault(); onGoHome(); }}> HOME </a>
                <a href="#skin-note-history" className="nav-link" onClick={(e) => { e.preventDefault(); onGoSkinNoteHistory(); }}> SKIN NOTE </a>
                <a href="#contrast" className="nav-link" onClick={(e) => { e.preventDefault(); onGoContrast(); }}> CONTRAST </a>
                
                <div className="user-icon" onClick={onUserIconClick} style={{ cursor: 'pointer' }}> 
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
            </nav>
        </header>

    );
};



// ******************************************************
// ** 유저 정보 모달 컴포넌트 **
// ******************************************************
const UserInfoModal = ({ userId, userIp, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: '400px', padding: '30px' }}>
                <button className="modal-close-btn" onClick={onClose}>✕</button>
                <h3 className="modal-title" style={{ marginBottom: '20px' }}>사용자 접속 정보</h3>

                <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#555' }}>임시 사용자 ID:</p>
                    <p style={{ margin: 0, padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '4px', wordBreak: 'break-all', fontSize: '14px' }}>
                        {userId}
                    </p>
                </div>

                <div>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#555' }}>접속 IP 주소:</p>
                    <p style={{ margin: 0, padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '4px', wordBreak: 'break-all', fontSize: '14px' }}>
                        {userIp}
                    </p>
                </div>

                <p style={{ marginTop: '20px', fontSize: '12px', color: '#888' }}>
                    * 이 ID는 브라우저에 저장된 임시 식별자입니다. IP 주소는 외부 API를 통해 로딩됩니다.
                    </p>
                    <p style={{ marginTop: '5px', fontSize: '12px', color: '#888' }}>
                    * 브라우저를 변경하거나, 로컬 데이터를 삭제할 시 데이터가 유실될 수 있습니다.
                    </p>
            </div>
        </div>
    );
};

// ******************************************************
// ** 재작성 확인 모달 컴포넌트 **
// ******************************************************
const RewriteConfirmModal = ({ onConfirmRewrite, onCancel }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
                <h3 className="modal-title" style={{ fontSize: '20px', color: 'var(--accent-color)' }}>
                    스킨 노트 재작성 확인
                </h3>
                <p style={{ margin: '20px 0', color: 'var(--text-dark)', fontSize: '16px' }}>
                    오늘의 스킨 노트 작성을 이미 완료했습니다. <br/>
                    <strong>기존 내용을 삭제하고 다시 작성</strong>하시겠습니까?
                </p>

                <div className="nav-btn-group" style={{ justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
                    <button
                        className="prev-button"
                        onClick={onConfirmRewrite}
                        style={{ width: '100px', padding: '10px' }}
                    >
                        예
                    </button>
                    <button
                        className="next-step-button"
                        onClick={onCancel}
                        style={{ width: '100px', padding: '10px' }}
                    >
                        아니오
                    </button>
                </div>
            </div>
        </div>
    );
};


// ******************************************************
// ** 2. 메인 페이지 (HomePage) **
// ******************************************************
const HomePage = ({ onStartDiagnosis }) => {
    return (
        <main className="main-section">
            <div className="content-wrapper">
                <div className="image-area" style= {{ flex: 6}}>
                    <img src="/main-visual.png" alt="AI 피부 진단" className="main-visual-image" onError={(e) => e.target.style.display='none'} />
                </div>

                <div className="text-area" style={{  flex: 4 }}>
                    <div className="text-box">
                        <span className="ai-analyst-title"> AI 피부 분석 전문가 <strong>스캐니</strong>가, </span>
                        <p className="main-diagnosis-text"> 당신의 피부를 <br/>진단해 드립니다. </p>

                        <ul className="feature-list">
                            <li>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                                안면인식 AI 스캔
                            </li>
                            <li>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                15가지 상세 리포트
                            </li>
                            <li>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                                100% 맞춤 제품 추천
                            </li>
                        </ul>

                        <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#555' }}>
                            이제, 시행착오 없이 집에서 편하게<br />내 피부 상태를 진단하세요.
                        </p>
                    </div>

                    <div className="nav-btn-group" style={{ justifyContent: 'center', gap: '20px', width: '100%', maxWidth: '450px' }}>
                        <button
                            className="start-button"
                            onClick={onStartDiagnosis}
                            style={{ flex: 1, backgroundColor: 'var(--accent-color)' }}
                        >
                            <span style={{ marginRight: '5px', fontSize: '18px' }}></span>
                            무료 진단 시작
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

// ******************************************************
// ** 3. 진단 페이지 **
// ******************************************************
const DiagnosisPage = ({ onNext, onPrev, data, onChange }) => {
    const concerns = [
        "주름", "칙칙함", "기미/잡티", "모공",
        "피지 과다", "민감성", "탄력저하", "각질",
        "다크서클", "건조", "여드름", "홍조"
    ];

    const years = [];
    for (let i = 2025; i >= 1940; i--) years.push(i);

    const months = [];
    for (let i = 1; i <= 12; i++) months.push(i);

    const handleNext = () => {
        if (!data?.gender || data.birthYear === '' || data.birthMonth === '') {
            alert("성별, 출생년도, 출생월은 필수 선택 사항입니다.");
            return;
        }
        onNext();
    };

    return (
        <div className="diagnosis-section">
            <div className="diagnosis-container">
                <div className="diagnosis-header">
                    <h2><span className="check-icon-circle">✔</span> 나의 정보를 체크해주세요</h2>
                </div>
                <form>
                    <section className="form-section">
                        <h3>성별</h3>
                        <div className="selection-row">
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    className="hidden-input"
                                    value="female"
                                    checked={data?.gender === 'female'}
                                    onChange={(e) => onChange('gender', e.target.value)}
                                />
                                <div className="selectable-box gender-box"> 여성</div>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    className="hidden-input"
                                    value="male"
                                    checked={data?.gender === 'male'}
                                    onChange={(e) => onChange('gender', e.target.value)}
                                />
                                <div className="selectable-box gender-box"> 남성</div>
                            </label>
                        </div>
                    </section>
                    <section className="form-section">
                        <h3>출생년도 / 월</h3>
                        <div className="selection-row">
                            <select
                                className="custom-select"
                                name="birthYear"
                                value={data?.birthYear}
                                onChange={(e) => onChange('birthYear', e.target.value)}
                            >
                                <option value="" disabled>년도를 선택해 주세요</option>
                                {years.map(year => <option key={year} value={year}>{year}년</option>)}
                            </select>
                            <select
                                className="custom-select"
                                name="birthMonth"
                                value={data?.birthMonth}
                                onChange={(e) => onChange('birthMonth', e.target.value)}
                            >
                                <option value="" disabled>월을 선택해 주세요</option>
                                {months.map(month => <option key={month} value={month}>{month}월</option>)}
                            </select>
                        </div>
                    </section>
                    <section className="form-section">
                        <h3>평소 피부 고민</h3>
                        <div className="concern-grid">
                            {concerns.map((item, idx) => (
                                <label key={idx}>
                                    <input
                                        type="checkbox"
                                        className="hidden-input"
                                        value={item}
                                        checked={data?.concerns.includes(item)}
                                        onChange={() => onChange('concerns', item)}
                                    />
                                    <div className="selectable-box concern-box">
                                        <span className="concern-text-label">{item}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>
                    <div className="form-footer" style={{justifyContent: 'space-between'}}>
                        <button type="button" className="prev-button" onClick={onPrev}>&lt; 처음으로</button>
                        <button type="button" className="next-step-button" onClick={onNext}>다음 단계 &gt;</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ******************************************************
// ** 4. 얼굴 인식 준비 페이지 **
// ******************************************************
const FaceRecognitionPrepPage = ({ onPrev, onNext }) => {
    return (
        <div className="content-section">
            <div className="diagnosis-container" style={{ maxWidth: '500px', textAlign: 'center' }}>

                {/* 제목 */}
                <h2 className="prep-title" style={{ fontSize: '26px' }}>
                   정확한 진단을 위한 준비
                </h2>

                {/* 샘플 이미지 */}
                <div style={{ margin: '30px auto', width: '150px', height: '150px', border: '1px solid #ddd', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--light-gray)' }}>
                    <img
                        src="/face-example.png"
                        alt="진단에 적합한 얼굴 사진 예시"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.style.display='none';
                            const parent = e.target.parentElement;
                            parent.innerHTML = '<div style="padding: 20px; color: var(--sub-text-color); font-size: 14px;">[이미지 로드 오류]</div>';
                        }}
                    />
                </div>

                {/* 안내 문구 */}
                <ul className="prep-list" style={{ textAlign: 'left', display: 'inline-block', listStyleType: 'none', paddingLeft: '0' }}>
                    <li style={{ marginBottom: '15px' }}>
                        <strong>얼굴 그림자가 없는 밝은 곳에서 촬영한 사진</strong>을 사용해 주세요.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                        <strong>메이크업을 지운 민낯이 정확한 진단</strong>에 도움이 됩니다.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                        <strong>카메라를 정면으로 바라본 사진</strong>을 사용해 주세요.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                        <strong>깨끗한 배경과 이마를 드러낸 사진</strong>을 사용해 주세요.
                    </li>
                </ul>

                {/* 네비게이션 버튼 */}
                <div className="nav-btn-group" style={{ justifyContent: 'center', marginTop: '40px' }}>
                    <button className="prev-button" onClick={onPrev} style={{ width: '120px' }}>이전 단계</button>
                    <button className="next-step-button" onClick={onNext} style={{ width: '120px' }}>다음 단계</button>
                </div>
            </div>
        </div>
    );
};

// ******************************************************
// ** 5. 사진 업로드 페이지 **
// ******************************************************
const PhotoUploadPage = ({ onPrev, onNext, onUploadSuccess }) => {
    const [tempPhotoUrl, setTempPhotoUrl] = useState(null);
    const [tempPhoto, setTempPhoto] = useState(null);
    const PHOTO_BOX_SIZE = '300px';

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setTempPhoto(file)
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempPhotoUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDiagnosisStart = () => {
        if (tempPhotoUrl && tempPhoto) {
            onUploadSuccess(tempPhotoUrl, tempPhoto);
            onNext();
        } else {
            alert("얼굴 사진을 업로드 해주세요!");
        }
    };

    return (
        <div className="content-section">
            <div className="diagnosis-container">
                <h2 className="prep-title"> 사진을 업로드해주세요</h2>
                <p className="prep-description" style={{ textAlign: 'center' }}>얼굴이 정면으로 잘 보이도록 찍은 사진을 업로드해주세요.</p>

                <div className="upload-area">
                    {tempPhotoUrl ? (
                        // 1. 사진 미리보기 박스: 중앙 정렬 및 크기 지정 (300px)
                        <div className="photo-preview-box" style={{
                            width: PHOTO_BOX_SIZE,
                            height: PHOTO_BOX_SIZE,
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            margin: '20px auto',
                            position: 'relative',
                        }}
                            // 이미지 클릭 시 다시 파일 선택 가능하도록 설정
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            {/* 2. 이미지 크기 조절: objectFit: 'cover' 적용 */}
                            <img
                                src={tempPhotoUrl}
                                alt="업로드된 얼굴 사진"
                                className="uploaded-photo-preview"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                    ) : (
                        // 1. 사진 업로드 박스: 중앙 정렬 및 크기 지정 (300px)
                        <div className="photo-upload-box" style={{
                            width: PHOTO_BOX_SIZE,
                            height: PHOTO_BOX_SIZE,
                            border: '2px dashed #ccc',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: '20px auto',
                            cursor: 'pointer'
                        }}
                            // 파일 입력 클릭을 위한 클릭 핸들러 추가
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <p style={{marginTop: '10px'}}>클릭하여 사진을 선택해 주세요</p>
                        </div>
                    )}

                    {/* 3. 파일 선택 버튼 숨김 */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <input
                            id="file-input" // 파일 입력 클릭을 위한 ID
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            // 파일 선택 드롭박스를 숨김 (display: none)
                            style={{ display: 'none' }}
                        />
                        {/* 파일명 표시 (파일 선택 시만) - 사용자에게 피드백 제공 */}
                        {tempPhotoUrl && (
                            <p style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>
                                파일 선택 완료: 이미지를 클릭하여 변경할 수 있습니다.
                            </p>
                        )}
                    </div>
                </div>

                <div className="nav-btn-group" style={{ justifyContent: 'center' }}>
                    <button className="prev-button" onClick={onPrev}>&lt; 이전 단계</button>
                    <button
                        className="next-step-button"
                        onClick={handleDiagnosisStart}
                        disabled={!tempPhotoUrl}
                    >
                        AI 진단 시작 &gt;
                    </button>
                </div>
            </div>
        </div>
    );
};

// ******************************************************
// ** 6. 스킨 노트 작성 페이지 **
// ******************************************************
// [수정] diagnosisResult prop 추가
const SkinNotePage = ({ onNoteSave, onPrev, defaultPhotoUrl, canWriteToday, onConfirmRewrite, onCancelRewrite, diagnosisResult }) => {
    const [isWritable, setIsWritable] = useState(canWriteToday);
    const todayDate = getTodayDate();

    // 새로운 상태 추가: 스트레스 지수, 수면 시간
    const [noteText, setNoteText] = useState('');
    const [stressLevel, setStressLevel] = useState(3); // 기본값 3
    const [sleepHours, setSleepHours] = useState(7); // 기본값 7

    // 수면 시간 옵션
    const sleepOptions = [];
    for (let i = 0; i <= 12; i += 0.5) {
        if (i === 0) continue;
        sleepOptions.push(i);
    }

    // 스트레스 지수 (1:최저 ~ 5:최고)
    const stressLabels = {
        1: '매우 낮음', 2: '낮음', 3: '보통', 4: '높음', 5: '매우 높음'
    };

    useEffect(() => {
        // 이미 작성된 노트가 있고, 아직 재작성 확인을 하지 않았을 경우
        if (!canWriteToday && !isWritable) {
            // 모달 띄우기: App 컴포넌트에서 모달을 렌더링하도록 로직 유지
        } else if (canWriteToday) {
            setIsWritable(true);
        }
    }, [canWriteToday, isWritable]);

    const handleConfirmRewrite = () => {
        onConfirmRewrite();
        setIsWritable(true);
        // 재작성 시 기존 입력 값 초기화 (선택 사항)
        setNoteText('');
        setStressLevel(3);
        setSleepHours(7);
    };

    const handleSave = () => {
        if (!isWritable) return;

        if (noteText.trim() === '') {
            alert("오늘의 피부 상태를 기록해주세요.");
            return;
        }

        // [수정] diagnosisData를 포함하여 저장
        const newNote = {
            date: todayDate,
            summary: noteText.substring(0, 100) + (noteText.length > 100 ? '...' : ''),
            fullText: noteText,
            photoUrl: defaultPhotoUrl,
            // 추가된 항목 저장
            stressLevel: stressLevel,
            sleepHours: sleepHours,
            diagnosisData: diagnosisResult ? parseCombinedData(diagnosisResult) : null // 파싱된 진단 데이터 저장
        };

        onNoteSave(newNote);
        setIsWritable(false);
    };

    return (
        <div className="content-section">
            <div className="diagnosis-container">
                <h2 className="prep-title">오늘의 스킨 노트 작성</h2>

                {/* 1. 재작성 확인 모달 */}
                {!canWriteToday && !isWritable && (
                    <RewriteConfirmModal
                        onConfirmRewrite={handleConfirmRewrite}
                        onCancel={onCancelRewrite}
                    />
                )}

                {/* 2. 작성 폼 (재작성 확인 후 isWritable이 true가 될 때 표시) */}
                {isWritable && (
                    <form>
                        {/* 사진 미리보기 */}
                        {defaultPhotoUrl && (
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <img src={defaultPhotoUrl} alt="오늘의 진단 사진" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                <p style={{ fontSize: '14px', color: '#777', marginTop: '10px' }}>오늘 진단 시 사용된 사진</p>
                            </div>
                        )}

                        {/* 스트레스 지수 */}
                        <section className="form-section">
                            <h3 style={{ textAlign: 'left' }}>스트레스 지수 (1: 최저 ~ 5: 최고)</h3>
                            <div className="selection-row" style={{ justifyContent: 'space-between' }}>
                                {[1, 2, 3, 4, 5].map(level => (
                                    <label key={level} style={{ flex: 1, minWidth: '50px' }}>
                                        <input
                                            type="radio"
                                            name="stressLevel"
                                            className="hidden-input"
                                            value={level}
                                            checked={stressLevel === level}
                                            onChange={() => setStressLevel(level)}
                                        />
                                        <div className="selectable-box" style={{ padding: '10px', height: 'auto' }}>
                                            {level} <br/>
                                            <span style={{ fontSize: '12px', color: '#999' }}>({stressLabels[level]})</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {/* 수면 시간 */}
                        <section className="form-section">
                            <h3 style={{ textAlign: 'left' }}>수면 시간 (시간)</h3>
                            <div className="selection-row" style={{ justifyContent: 'flex-start' }}>
                                <select
                                    className="custom-select"
                                    value={sleepHours}
                                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                                    style={{ width: '150px' }}
                                >
                                    {sleepOptions.map(hour => (
                                        <option key={hour} value={hour}>{hour} 시간</option>
                                    ))}
                                </select>
                            </div>
                        </section>

                        {/* 오늘의 기록 (텍스트 영역) */}
                        <section className="form-section" style={{ borderBottom: 'none' }}>
                            <h3 style={{ textAlign: 'left' }}>오늘의 피부 컨디션 기록</h3>
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="사용한 제품, 특이 사항 등을 자유롭게 기록해 보세요."
                                rows="10"
                                style={{ width: '100%', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', resize: 'vertical', fontSize: '16px' }}
                            ></textarea>
                        </section>

                        <div className="nav-btn-group" style={{justifyContent: 'space-between'}}>
                            <button type="button" className="prev-button" onClick={onPrev}>&lt; 기록 목록</button>
                            <button type="button" className="next-step-button" onClick={handleSave}>노트 저장</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};


// ******************************************************
// ** 7. 스킨 노트 히스토리 페이지 **
// ******************************************************
const SkinNoteHistoryPage = ({ onGoDiary, onGoHome, canWriteToday, notes, onDelete }) => {
const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);

    const todayDate = getTodayDate();

    const handleDeleteClick = (date) => {
        setNoteToDelete(date);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (noteToDelete) {
            onDelete(noteToDelete);
            setShowDeleteModal(false);
            setNoteToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setNoteToDelete(null);
    };
    
    return (
        <div className="content-section">
            {/* 모달 렌더링 */}
            {showDeleteModal && noteToDelete && (
                <DeleteConfirmModal
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    date={noteToDelete}
                />
            )}

            <div className="diagnosis-container">
                <h2 className="prep-title">나의 스킨 노트 기록</h2>

                <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '16px', color: '#555' }}>
                        총 <strong style={{fontWeight: 'bold', color: 'var(--accent-color)'}}>{notes.length}</strong>개의 기록이 있습니다.
                    </p>
                    <button
                        className="start-button"
                        onClick={onGoDiary}
                        // 이미 작성했어도, 재작성을 위해 버튼은 활성화 유지
                        style={{ padding: '10px 20px', fontSize: '16px'}}
                    >
                        {canWriteToday ? '오늘의 기록 작성 +' : '오늘 기록 보기/재작성'}
                    </button>
                </div>

                <div className="history-list">
                    {notes.length > 0 ? (
                        notes.map((item, index) => (
                            <div key={index} className="history-item" style={{
                                padding: '15px',
                                border: '1px solid #eee',
                                borderRadius: '8px',
                                marginBottom: '15px',
                                backgroundColor: '#fff',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                // 오늘 작성한 노트는 강조 표시
                                borderLeft: item.date === getTodayDate() ? '5px solid var(--accent-color)' : 'none',

                                // Flexbox 스타일을 추가하여 텍스트와 사진을 분리 (좌: 텍스트, 우: 사진)
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start' // 상단 정렬
                            }}>
                                {/* 1. 왼쪽: 텍스트 콘텐츠 영역 (날짜, 스트레스/수면, 기록) */}
                                <div style={{ flex: 1, marginRight: '15px', minWidth: '0' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent-color)' }}>
                                        {item.date} {item.date === getTodayDate() && '(오늘 기록)'}
                                        {/* 진단 데이터가 있는 경우 표시 */}
                                        {item.diagnosisData && <span style={{fontSize: '12px', color: '#555', marginLeft: '10px'}}>(진단 포함)</span>}
                                    </h4>

                                    {/* 스트레스/수면 정보를 요청하신 형식 (스트레스 :, 수면 :)으로 변경 */}
                                    <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                                        <span style={{ marginRight: '20px' }}>
                                            <strong style={{ color: '#333' }}>스트레스 :</strong> {item.stressLevel || 'N/A'}
                                        </span>
                                        <span>
                                            <strong style={{ color: '#333' }}>수면 :</strong> {item.sleepHours ? `${item.sleepHours} 시간` : 'N/A'}
                                        </span>
                                    </div>

                                    <p style={{ margin: 0, color: '#333', whiteSpace: 'pre-wrap' }}>{item.fullText}</p>
                                </div>


                                {/* 2. 오른쪽: 사진 영역 */}
                                {item.photoUrl && (
                                    <div style={{ flexShrink: 0, width: '100px', height: '100px', marginLeft: '10px' }}>
                                        <img
                                            src={item.photoUrl}
                                            alt="진단 사진"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                borderRadius: '4px',
                                                border: '1px solid #eee',
                                                objectFit: 'cover',
                                                width: '100%',
                                                height: '100%'
                                            }}
                                            
                                        />
                                        {/* 삭제 버튼 추가 */}
                                    <button
                                        onClick={() => handleDeleteClick(item.date)}
                                        style={{
                                            position: 'absolute',
                                            top: '-10px',
                                            right: '-10px',
                                            padding: '4px 8px',
                                            backgroundColor: '#d9534f',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            lineHeight: '1',
                                            zIndex: 10
                                        }}
                                        title="기록 삭제"
                                    >
                                        ✕
                                    </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: '#999', padding: '50px' }}>아직 작성된 스킨 노트 기록이 없습니다.</p>
                    )}
                </div>

                <div className="nav-btn-group" style={{justifyContent: 'flex-start', marginTop: '30px'}}>
                    <button className="prev-button" onClick={onGoHome}>&lt; 메인으로</button>
                </div>
            </div>
        </div>
    );
};

// 삭제 확인 모달 컴포넌트
const DeleteConfirmModal = ({ onConfirm, onCancel, date }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: '400px', padding: '40px', textAlign: 'center' }}>
                <h3 className="modal-title" style={{ fontSize: '20px', color: '#d9534f' }}>
                    기록 삭제 확인
                </h3>
                <p style={{ margin: '20px 0', color: 'var(--text-dark)', fontSize: '16px' }}>
                    선택하신 **{date}** 날짜의 스킨 노트 기록을 <br/>
                    정말로 삭제하시겠습니까?
                </p>

                <div className="nav-btn-group" style={{ justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
                    <button
                        className="prev-button"
                        onClick={onConfirm}
                        style={{ width: '100px', padding: '10px', backgroundColor: '#d9534f', color: 'white', border: 'none' }}
                    >
                        예, 삭제합니다
                    </button>
                    <button
                        className="next-step-button"
                        onClick={onCancel}
                        style={{ width: '100px', padding: '10px' }}
                    >
                        아니오
                    </button>
                    
                </div>
            </div>
        </div>
    );
};


// ******************************************************
// ** 9. 로딩 페이지 **
// ******************************************************
const LoadingPage = ({ 
    imageUrl,
    imageFile,
    userInputs,
    userId,
    userIp,
    onComplete, duration = 5000 }) => {

    useEffect(() => {
        startDiagnosis(
            imageFile,
            { ...userInputs, concerns: userInputs.concerns },
            userId,
            userIp
        ).then((response) => {
            // 이미지 URL을 응답 객체에 추가하여 ResultPage 및 저장 로직에서 사용
            onComplete({
                imageUrl,
                ...response,
            });
        }).catch((e) => {
            console.error("Diagnosis Error:", e);
            // 오류 발생 시 로딩 페이지에 머무르거나 오류 메시지를 표시
            // 일단 콘솔에 에러를 기록 후 아무것도 하지않음
        });
    }, [imageFile, userInputs, userId, userIp, imageUrl, onComplete]);

    const durationSeconds = duration / 1000;

    return (
        <div className="content-section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
            <div className="loading-container" style={{ textAlign: 'center', maxWidth: '500px', width: '90%' }}>
                <h2 style={{ fontSize: '24px', color: 'var(--accent-color)', marginBottom: '30px' }}>
                    AI 분석 전문가 <strong>스캐니가 피부를 들여다보는 중</strong> 👀
                </h2>

                <div className="loading-bar-wrapper" style={{
                    height: '10px',
                    backgroundColor: '#eee',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    marginBottom: '10px'
                }}>
                    <div className="loading-bar" style={{
                        height: '100%',
                        backgroundColor: 'var(--accent-color)',
                        width: '100%',
                        animation: `loading-progress ${durationSeconds}s linear forwards`
                    }}></div>
                </div>

                <p style={{ color: '#777', fontSize: '14px' }}>AI가 고객님의 피부 사진을 분석하고 있습니다. 잠시만 기다려주세요...</p>
            </div>
        </div>
    );
};

// ******************************************************
// ** NEW: 차트 렌더러 컴포넌트 **
// ******************************************************

/**
 * 간단한 수평 바 차트를 렌더링하는 컴포넌트
 * @param {Array} data - [{label, value, unit, displayValue, color}]
 */
const ChartRenderer = ({ data }) => {
    if (!data || data.length === 0) {
        return <p style={{ textAlign: 'center', color: 'var(--sub-text-color)' }}>선택된 영역의 상세 데이터가 없습니다.</p>;
    }
    
    // 등급의 최소/최대 값을 사용하여 차트 스케일 결정 (GRADE_MAP 기준: -3 ~ 4)
    const MAX_GRADE_VALUE = 4; // A+
    const MIN_GRADE_VALUE = -3; // D0
    const RANGE = MAX_GRADE_VALUE - MIN_GRADE_VALUE; // 7

    return (
        <div className="chart-container">
            {data.map((item, index) => {
                // 등급 값을 0~100% 스케일로 변환
                const normalizedValue = ((item.value - MIN_GRADE_VALUE) / RANGE) * 100;

                return (
                    <div className="chart-bar-item" key={index}>
                        <div className="chart-label">{item.label}</div>
                        <div className="chart-bar-wrapper">
                            <div 
                                className="chart-bar" 
                                style={{ 
                                    width: `${Math.max(0, normalizedValue)}%`, // 0% 미만으로 내려가지 않도록 처리
                                    backgroundColor: item.color,
                                }}
                            >
                            </div>
                        </div>
                        <div className="chart-value" style={{color: item.color}}>
                            {item.displayValue}
                        </div>
                    </div>
                );
            })}
            
            <div className="chart-legend">
                * 그래프는 등급 값을 기준으로 스케일링됩니다. (D0: 0% ~ A+: 100%)
            </div>
        </div>
    );
};

// ******************************************************
// **  진단 결과 요약 테이블 컴포넌트
// ******************************************************
/**
 * 진단 결과 요약 정보를 표시하는 테이블 컴포넌트
 * @param {object} summary - parseCombinedData의 summary 객체
 */
const DiagnosisSummaryTable = ({ summary }) => {
    if (!summary || !summary.bestElasticity || summary.bestElasticity.grade === 'N/A') {
        return <p style={{textAlign: 'center', color: '#999', padding: '20px 0'}}>진단 데이터가 없습니다.</p>;
    }
    
    // 표시할 지표 목록
    // '탄력', '수분', '모공'을 핵심 요약 지표로 사용
    const metrics = [
        { key: 'bestElasticity', label: '탄력 (최고)', metricName: '탄력', grade: summary.bestElasticity.grade, area: summary.bestElasticity.area },
        { key: 'worstMoisture', label: '수분 (최저)', metricName: '수분', grade: summary.worstMoisture.grade, area: summary.worstMoisture.area },
        { key: 'bestPore', label: '모공 (최고)', metricName: '모공', grade: summary.bestPore.grade, area: summary.bestPore.area }
    ];

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px', margin: '15px 0' }}>
            <thead>
                <tr style={{ backgroundColor: 'var(--primary-color)' }}>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>항목</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>등급</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>부위</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>해석</th>
                </tr>
            </thead>
            <tbody>
                {metrics.map((m, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{m.label}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                            <span style={{ color: getGradeColor(m.grade), fontWeight: 'bold' }}>
                                {m.grade}
                            </span>
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{m.area}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', fontSize: '12px' }}>
                            {getGradeDescription(m.grade, m.metricName)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};


// ******************************************************
// ** 10. 진단 결과 페이지 **
// ******************************************************
const DiagnosisResultPage = ({ result, onGoHome, onGoSkinNote }) => {
    // [수정] COMBINED_DATA_TEXT 대신 실제 API 결과인 result prop을 사용
    // result는 {imageUrl, meta, parts_analysis, ...} 구조를 가짐
    const data = parseCombinedData(result); 
    const model = data.model;
    const summary = data.summary;
    const chartData = data.chartData;
    
    const categories = Object.keys(chartData);
    const [selectedCategory, setSelectedCategory] = useState(categories[0] || '이마'); // 기본값: 이마

    // 선택된 카테고리에 해당하는 차트 데이터
    const currentChartData = chartData[selectedCategory];

    // [추가] 6가지 질환 고정 목록 및 업데이트 로직
    const allDiseases = [
        { name: '건선', percent: 0.0 }, 
        { name: '아토피', percent: 0.0 }, 
        { name: '여드름', percent: 0.0 }, 
        { name: '주사', percent: 0.0 }, 
        { name: '지루', percent: 0.0 }, 
        { name: '정상', percent: 0.0 }
    ];

    // Top 3 결과를 allDiseases의 percent에 업데이트
    model.diseases.forEach(topDisease => {
        const existing = allDiseases.find(d => d.name === topDisease.name);
        if (existing) {
            existing.percent = topDisease.percent;
        } else {
            // AI가 6가지 목록 외의 질환을 진단한 경우, 목록에 추가
            allDiseases.push(topDisease);
        }
    });

    // 확률이 높은 순서대로 정렬
    const displayDiseases = allDiseases
        .sort((a, b) => b.percent - a.percent); 


    return (
        <div className="diagnosis-section">
            <div className="diagnosis-container" style={{ maxWidth: '800px' }}>
                <div className="diagnosis-header">
                    <h2> AI 피부 진단 종합 분석 리포트</h2>
                </div>

                <div className="result-card" style={{ marginBottom: '30px' }}>
                    {/* 1. 종합 정보 및 질환 분석 */}
                    <section style={{ padding: '15px', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
                        <h3 style={{ color: 'var(--accent-color)' }}>✅ 기본 정보 및 피부 질환 분석</h3>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', flexWrap: 'wrap' }}>
                            <p style={{ margin: 0 }}><strong>성별:</strong> {model.gender}</p>
                            <p style={{ margin: 0 }}><strong>나이:</strong> {model.age}세</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 10px 0' }}><strong>피부 질환 예측 순위:</strong></p>
                            <ul style={{ 
                                listStyle: 'none', 
                                paddingLeft: '0', 
                                margin: 0, 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: '10px 20px' 
                            }}>
                                {displayDiseases.map((d, i) => (
                                    // Top 3 항목은 더 진한 색으로 강조 (percent가 0보다 큰 경우)
                                    <li 
                                        key={i} 
                                        style={{ 
                                            marginBottom: '5px', 
                                            color: d.percent > 0 ? 'var(--text-dark)' : 'var(--sub-text-color)',
                                            fontWeight: d.percent > 0 ? 'bold' : 'normal',
                                            width: 'calc(50% - 10px)' // 두 열로 표시
                                        }}>
                                        {d.name}: <strong style={{color: d.percent > 0 ? 'var(--accent-color)' : '#999'}}>{d.percent}%</strong>
                                    </li>
                                ))}
                            </ul>
                            <p style={{marginTop: '15px', fontSize: '12px', color: '#888'}}>
                                * AI 예측 확률에 따라 내림차순 정렬됩니다. 확률이 없는 항목은 0.0%로 표시됩니다.
                            </p>
                        </div>
                    </section>
                    
                    {/* 2. 종합 요약표 (DiagnosisSummaryTable 컴포넌트로 대체) */}
                    <section style={{ padding: '15px', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
                        <h3 style={{ color: 'var(--accent-color)' }}>✨ 피부 컨디션 요약</h3>
                        {/* DiagnosisSummaryTable 컴포넌트를 사용하여 요약 표시 */}
                        <DiagnosisSummaryTable summary={summary} />
                    </section>
                </div>


                {/* 3. 영역별 상세 차트 섹션 */}
                <div className="result-card">
                    <h2 style={{ color: 'var(--text-dark)', borderBottom: '3px solid var(--accent-color)', paddingBottom: '10px', marginBottom: '20px', textAlign: 'center', }}>
                        부위별 상세 측정 그래프
                    </h2>
                    
                    {/* 카테고리 버튼 */}
                    <div className="category-buttons">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* 차트 렌더링 */}
                    <h3 style={{color: 'var(--text-dark)', textAlign: 'center'}}>{selectedCategory} 분석 결과</h3>
                    <ChartRenderer data={currentChartData} />
                    
                    <div className="form-footer" style={{ justifyContent: 'space-between', marginTop: '40px' }}>
                        <button className="prev-button" onClick={onGoHome}>메인으로</button>
                        <button className="next-step-button" onClick={onGoSkinNote}>스킨 노트 작성 &gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ******************************************************
// ** 11. 기록 비교 페이지 (ContrastPage) **
// ******************************************************
// [수정] ContrastPage 로직 전면 수정
const ContrastPage = ({ onGoHome, notes, result }) => {
    
    // 1. 현재 진단 데이터 (좌측 패널)
    // App.js의 result(가장 최근 AI 응답)를 파싱하여 사용
    const currentDiagnosisData = result ? parseCombinedData(result) : null;
    const currentDiagnosisSummary = currentDiagnosisData ? currentDiagnosisData.summary : null;
    const currentPhotoUrl = result ? result.imageUrl : null;
    const todayDate = getTodayDate();


    // 2. 과거 노트 필터링: diagnosisData를 포함하는 노트만 비교 대상으로 사용
    const comparisonNotes = notes.filter(note => note.diagnosisData && note.diagnosisData.summary);
    
    // 3. 선택된 과거 노트 인덱스 상태 (우측 패널)
    // 초기값은 가장 최근의 과거 기록 (comparisonNotes[0])의 인덱스인 0
    const [selectedIndex, setSelectedIndex] = useState(() => {
        return comparisonNotes.length > 0 ? 0 : null;
    });

    // 4. 선택된 과거 노트 데이터
    const selectedPastNote = selectedIndex !== null ? comparisonNotes[selectedIndex] : null;
    const selectedPastDiagnosisSummary = selectedPastNote ? selectedPastNote.diagnosisData.summary : null;
    
    // 5. 드롭다운 변경 핸들러
    const handleSelectChange = (e) => {
        const index = parseInt(e.target.value, 10);
        setSelectedIndex(index);
    };

  return (
        <div className="content-section">
            <div className="diagnosis-container" style={{ maxWidth: '1000px' }}>
                <h2 className="prep-title"> 🔄 피부 진단 변화 비교</h2>
                <p className="prep-description">가장 최근 진단(좌)과 과거 기록(우)을 비교하여 피부 변화를 확인해 보세요.</p>

                {currentDiagnosisData === null && comparisonNotes.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888', padding: '50px' }}>
                        비교할 진단 기록이 없습니다. 먼저 진단을 시작하고 스킨 노트 작성을 완료해 주세요!
                    </p>
                ) : (
                    <div className="contrast-layout" style={{ display: 'flex', gap: '30px' }}>

                        {/* 1. 왼쪽: 현재 (가장 최근) 진단 내용 */}
                        <div className="contrast-panel left-panel" style={{ flex: 1, border: '1px solid var(--accent-color)', padding: '20px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ color: 'var(--accent-color)', borderBottom: '2px solid var(--accent-color)', paddingBottom: '10px', marginTop: 0 }}>
                                📍 현재 진단 ({todayDate})
                            </h3>

                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>진단 사진</p>
                                {currentPhotoUrl ? (
                                    <img src={currentPhotoUrl} alt="현재 진단 사진" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #eee' }} />
                                ) : (
                                    <div style={{ padding: '50px 20px', backgroundColor: 'var(--light-gray)', borderRadius: '8px', color: '#888' }}>
                                        <p>가장 최근 진단 사진 없음</p>
                                    </div>
                                )}
                            </div>

                            <h4 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>피부 컨디션 요약</h4>
                            <DiagnosisSummaryTable summary={currentDiagnosisSummary} />
                        </div>

                        {/* 2. 오른쪽: 과거 진단 기록 선택 및 표시 영역 */}
                        <div className="contrast-panel right-panel" style={{ flex: 1, border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                            <h3 style={{ color: 'var(--text-dark)', borderBottom: '2px solid #ddd', paddingBottom: '10px', marginTop: 0 }}>
                                📅 비교할 과거 기록 선택
                            </h3>

                            {/* 노트 선택 드롭다운 */}
                            {comparisonNotes.length > 0 ? (
                                <>
                                    <label htmlFor="past-note-select" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                                        비교 날짜 선택:
                                    </label>
                                    <select
                                        id="past-note-select"
                                        className="custom-select"
                                        value={selectedIndex !== null ? selectedIndex : ''}
                                        onChange={handleSelectChange}
                                        style={{ width: '100%', marginBottom: '20px' }}
                                    >
                                        {comparisonNotes.map((item, index) => (
                                            <option key={index} value={index}>
                                                {item.date} - {item.summary}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {/* 선택된 노트 상세 정보 */}
                                    {selectedPastNote && (
                                        <>
                                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>{selectedPastNote.date} 당시 진단 사진</p>
                                                {selectedPastNote.photoUrl ? (
                                                    <img src={selectedPastNote.photoUrl} alt="과거 진단 사진" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #eee' }} />
                                                ) : (
                                                    <div style={{ padding: '50px 20px', backgroundColor: '#eee', borderRadius: '8px', color: '#888' }}>
                                                        <p>사진 기록 없음</p>
                                                    </div>
                                                )}
                                            </div>

                                            <h4 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>피부 컨디션 요약</h4>
                                            <DiagnosisSummaryTable summary={selectedPastDiagnosisSummary} />

                                            <h4 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>당시 스킨 노트 기록</h4>
                                            <div style={{ padding: '10px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '4px', fontSize: '14px', maxHeight: '150px', overflowY: 'auto' }}>
                                                <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#333' }}>{selectedPastNote.fullText}</p>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#eee', borderRadius: '8px' }}>
                                    <p style={{ color: '#888' }}>진단 데이터가 포함된 과거 스킨 노트가 없습니다.</p>
                                    <button className="next-step-button" onClick={onGoHome} style={{ marginTop: '15px' }}>메인으로</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                <div className="nav-btn-group" style={{justifyContent: 'flex-start', marginTop: '40px'}}>
                    <button className="prev-button" onClick={onGoHome}>&lt; 메인으로</button>
                </div>
            </div>
        </div>
    );
};
// ******************************************************
// ** 12. 앱 (메인) **
// ******************************************************
function App() {
    const [page, setPage] = useState('home');
    const AI_PROCESSING_TIME = 5000;

    const [userId] = useState(initializeUserId);

    const [diagnosisData, setDiagnosisData] = useState({
        gender: null,
        birthYear: '',
        birthMonth: '',
        concerns: [],
    });

    const [skinNotes, setSkinNotes] = useState(loadSkinNotes);

    const [lastDiagnosisPhotoUrl, setLastDiagnosisPhotoUrl] = useState(null);
    const [lastDiagnosisPhoto, setLastDiagnosisPhoto] = useState(null);
    
    const [canWriteToday, setCanWriteToday] = useState(() => {
        const notes = loadSkinNotes();
        // 오늘 작성된 노트가 있는지 확인 (가장 최신 노트가 오늘 날짜인지 확인)
        return notes.length === 0 || notes[0]?.date !== getTodayDate();
    });

    // 유저 정보 모달 관련 상태
    const [showUserInfoModal, setShowUserInfoModal] = useState(false);
    const [userIp, setUserIp] = useState('정보를 불러오는 중...');

    // API 결과 값 (가장 최근 진단 결과의 원본 데이터)
    const [result, setResult] = useState(null);


    // --- 페이지 이동 함수 ---
    const goHome = () => setPage('home');
    const goDiagnosis = () => setPage('diagnosis');
    const goFacePrep = () => setPage('face-prep');
    const goUpload = () => setPage('upload');
    const goLoading = () => setPage('loading');
    const goResult = (response) => {
        setResult(response);
        setPage('result');
    };
    const goSkinNote = () => setPage('skinNote');
    const goSkinNoteHistory = () => setPage('skinNoteHistory');
    const goContrast = () => setPage('contrast');


    // --- 커스텀 핸들러 ---
    const handleDiagnosisDataChange = (name, value) => {
        setDiagnosisData(prev => {
            if (name === 'concerns') {
                const isChecked = prev.concerns.includes(value);
                const newConcerns = isChecked
                    ? prev.concerns.filter(c => c !== value)
                    : [...prev.concerns, value];
                return { ...prev, concerns: newConcerns };
            }
            return { ...prev, [name]: value };
        });
    };

    const handlePhotoUploadSuccess = (photoUrl, photo) => {
        setLastDiagnosisPhotoUrl(photoUrl)
        setLastDiagnosisPhoto(photo);
    };

    // 스킨 노트 작성 완료 및 저장 함수
    const handleNoteSave = (newNote) => {
        const updatedNotes = saveSkinNote(newNote);

        setSkinNotes(updatedNotes);

        // 작성 완료 후, 오늘 작성 불가능 상태로 변경
        setCanWriteToday(false);

        goSkinNoteHistory();
    };

    // 오늘 작성된 노트 삭제 (재작성 전 호출)
    const deleteTodayNote = () => {
        setSkinNotes(prevNotes => {
            const today = getTodayDate();
            // 가장 최신 노트가 오늘 기록인 경우에만 삭제
            if (prevNotes.length > 0 && prevNotes[0].date === today) {
                const updatedNotes = prevNotes.slice(1);
                try {
                    localStorage.setItem(SKIN_NOTES_KEY, JSON.stringify(updatedNotes));
                } catch (e) {
                    console.error("Error deleting note:", e);
                }
                return updatedNotes;
            }
            return prevNotes;
        });
    };
    
/**
     * 스킨 노트 기록을 개별적으로 삭제하는 함수
     * @param {string} date - 삭제할 노트의 날짜
     */
    const handleNoteDelete = (date) => {
        const updatedNotes = deleteSkinNote(date);
        setSkinNotes(updatedNotes);
        
        // 오늘 노트를 삭제했다면, canWriteToday 상태를 true로 업데이트합니다.
        if (date === getTodayDate()) {
            setCanWriteToday(true);
        }
    };

    const toggleUserInfoModal = () => {
        if (!showUserInfoModal) {
            setUserIp('정보를 불러오는 중...');
            fetchUserIp();
        }
        setShowUserInfoModal(prev => !prev);
    };

    const fetchUserIp = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            setUserIp(data.ip);
        } catch (error) {
            console.error("Failed to fetch IP:", error);
            setUserIp('IP 주소 로딩 실패 (API 에러)');
        }
    };


    return (
        <div className="app-container">
            <NavBar
                onGoHome={goHome}
                onGoSkinNoteHistory={goSkinNoteHistory}
                onUserIconClick={toggleUserInfoModal}
                onGoContrast={goContrast}
            />

            {page === 'home' && (
                <HomePage
                    onStartDiagnosis={goDiagnosis}
                    onStartCompare={goContrast}
                />
            )}

            {page === 'diagnosis' && (
                <DiagnosisPage
                    onNext={goFacePrep}
                    onPrev={goHome}
                    data={diagnosisData}
                    onChange={handleDiagnosisDataChange}
                />
            )}

            {page === 'face-prep' && (
                <FaceRecognitionPrepPage
                    onPrev={goDiagnosis}
                    onNext={goUpload}
                />
            )}

            {page === 'upload' && (
                <PhotoUploadPage
                    onPrev={goFacePrep}
                    onNext={goLoading}
                    onUploadSuccess={handlePhotoUploadSuccess}
                />
            )}

            {page === 'loading' && (
                <LoadingPage
                    imageUrl={lastDiagnosisPhotoUrl}
                    imageFile={lastDiagnosisPhoto}
                    userInputs={diagnosisData}
                    userId={userId}
                    userIp={userIp}
                    onComplete={goResult}
                    duration={AI_PROCESSING_TIME}
                />
            )}

            {page === 'result' && (
                <DiagnosisResultPage
                    result={result}
                    onGoSkinNote={goSkinNote}
                    onGoHome={goHome}
                />
            )}

            {page === 'skinNoteHistory' && (
                <SkinNoteHistoryPage
                    onGoDiary={goSkinNote}
                    onGoHome={goHome}
                    onDelete={handleNoteDelete}
                    canWriteToday={canWriteToday}
                    notes={skinNotes}
                />
            )}

            {page === 'skinNote' && (
                <SkinNotePage
                    onNoteSave={handleNoteSave}
                    onPrev={goSkinNoteHistory}
                    defaultPhotoUrl={lastDiagnosisPhotoUrl}
                    diagnosisResult={result}
                    canWriteToday={canWriteToday}
                    onConfirmRewrite={deleteTodayNote}
                    onCancelRewrite={goSkinNoteHistory}
                />
            )}

            {page === 'contrast' && (
                <ContrastPage
                    onGoHome={goHome}
                    notes={skinNotes}
                    result={result}
                />
            )}

            {showUserInfoModal && (
                <UserInfoModal
                    userId={userId}
                    userIp={userIp}
                    onClose={toggleUserInfoModal}
                />
            )}
        </div>
    );
}

export default App;