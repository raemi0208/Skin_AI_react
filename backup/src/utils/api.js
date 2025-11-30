// ---------------------------
// API 기본 설정
// ---------------------------
export const API_BASE_URL = "http://ckrudgh77.tplinkdns.com:9000";
export const API_KEY = "our-super-secret-key-for-skin-project-12345";

// ---------------------------
// 피부 진단 요청 함수
// ---------------------------
export const startDiagnosis = async (
    imageFile,
    userInputs,
    userId,
    userIp
) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('gender', userInputs?.gender || '');
    formData.append('birth_year', userInputs?.birthYear || '');
    formData.append('problems', JSON.stringify(userInputs?.problems || []));
    formData.append('user_id', userId);
    formData.append('user_ip', userIp);

    const res = await fetch(`${API_BASE_URL}/analyze-skin`, {
        method: 'POST',
        headers: { 'X-API-KEY': API_KEY },
        body: formData,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || '서버 오류');
    }

    return res.json();
};
