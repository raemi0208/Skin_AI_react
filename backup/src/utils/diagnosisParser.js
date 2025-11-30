// 진단 결과 파싱 유틸리티
export const parseCombinedData = (rawData) => {
    if (!rawData) return null;
    return {
        summary: rawData.summary || '분석 결과 없음',
        recommendation: rawData.recommendation || '추천 케어 없음',
        details: rawData.details || {}
    };
};
