export const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
};


export const formatDate = (today) => {
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
};
