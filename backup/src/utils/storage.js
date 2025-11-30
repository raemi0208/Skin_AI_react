// ---------------------------
// 로컬스토리지 키
// ---------------------------
const SKIN_NOTES_KEY = 'skinNotes';
const LAST_DIAGNOSIS_KEY = 'lastDiagnosisResult';
const LAST_DIAGNOSIS_PHOTO_KEY = 'lastDiagnosisPhoto';

// ---------------------------
// 유저 ID 초기화
// ---------------------------
export const initializeUserId = () => {
    let storedId = localStorage.getItem('appUserId');
    if (!storedId) {
        storedId = 'user-' + Date.now();
        localStorage.setItem('appUserId', storedId);
    }
    return storedId;
};

// ---------------------------
// 스킨 노트
// ---------------------------
export const loadSkinNotes = () => {
    try {
        return JSON.parse(localStorage.getItem(SKIN_NOTES_KEY) || '[]');
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const saveSkinNotes = (notes) => {
    try {
        localStorage.setItem(SKIN_NOTES_KEY, JSON.stringify(notes));
    } catch (e) {
        console.error(e);
    }
};

// ---------------------------
// 진단 결과
// ---------------------------
export const loadLastDiagnosis = () => {
    try {
        return JSON.parse(localStorage.getItem(LAST_DIAGNOSIS_KEY) || 'null');
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const saveLastDiagnosis = (result) => {
    try {
        localStorage.setItem(LAST_DIAGNOSIS_KEY, JSON.stringify(result));
    } catch (e) {
        console.error(e);
    }
};

// ---------------------------
// 직전 업로드 사진 URL
// ---------------------------
export const loadLastDiagnosisPhoto = () =>
    localStorage.getItem(LAST_DIAGNOSIS_PHOTO_KEY) || null;

export const saveLastDiagnosisPhoto = (url) =>
    localStorage.setItem(LAST_DIAGNOSIS_PHOTO_KEY, url);
