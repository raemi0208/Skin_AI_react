import { useState, useEffect } from 'react';
import { getTodayDate } from '../utils/date';

const STORAGE_KEY = 'userInfo';

export default function useUserInfo() {
   
    return { userId: "" ,userIp: "" };
}
