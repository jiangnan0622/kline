import { Solar } from 'lunar-javascript';
import { Gender } from '../types';

export interface BaziCalculationResult {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    startAge: string;
    firstDaYun: string;
    daYunList: string[]; // List of Da Yun pillars for reference
}

// Validate date before calculation
const isValidDate = (year: number, month: number, day: number): boolean => {
    // Basic range checks
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    // Use JavaScript Date to validate
    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
};

export const calculateBaziFromSolar = (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    gender: Gender
): BaziCalculationResult => {
    // Validate inputs
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        throw new Error('请输入有效的数字日期');
    }

    if (!isValidDate(year, month, day)) {
        throw new Error(`日期 ${year}年${month}月${day}日 不存在，请检查输入`);
    }

    // Normalize hour/minute
    const safeHour = Math.max(0, Math.min(23, hour || 0));
    const safeMinute = Math.max(0, Math.min(59, minute || 0));

    try {
        // Create Solar Date
        const solar = Solar.fromYmdHms(year, month, day, safeHour, safeMinute, 0);
        const lunar = solar.getLunar();
        const eightChar = lunar.getEightChar();

        // Get Pillars
        const yearPillar = eightChar.getYear();
        const monthPillar = eightChar.getMonth();
        const dayPillar = eightChar.getDay();
        const hourPillar = eightChar.getTime();

        // Da Yun (Big Luck)
        // Gender: 1 = Male, 0 = Female in lunar-javascript
        const lunarGender = gender === Gender.MALE ? 1 : 0;
        const yun = eightChar.getYun(lunarGender);

        const startAge = yun.getStartYear();

        // Get Da Yun Pillars (10 steps for full life coverage usually)
        const daYunArr = yun.getDaYun();
        const daYunList: string[] = [];
        let firstDaYun = '';

        // lunar-javascript DaYun array: index 0 is childhood, index 1 is first real Da Yun
        for (let i = 0; i < daYunArr.length && i < 11; i++) {
            const dy = daYunArr[i];
            if (dy) {
                const ganZhi = dy.getGanZhi();
                if (ganZhi) {
                    daYunList.push(ganZhi);
                    // First real Da Yun is at index 1 (index 0 is usually childhood period)
                    if (i === 1 && !firstDaYun) {
                        firstDaYun = ganZhi;
                    }
                }
            }
        }

        // Fallback: use index 0 if index 1 didn't work
        if (!firstDaYun && daYunList.length > 0) {
            firstDaYun = daYunList[0];
        }

        if (!firstDaYun) {
            firstDaYun = "未知";
        }

        return {
            yearPillar,
            monthPillar,
            dayPillar,
            hourPillar,
            startAge: startAge.toString(),
            firstDaYun,
            daYunList
        };
    } catch (err) {
        console.error('Bazi calculation error:', err);
        throw new Error(`八字计算失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
};
