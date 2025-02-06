import { Timestamp } from 'firebase/firestore';
import { calculateAge } from "./ChildCard"; // וודא שנתיב זה נכון

describe('calculateAge', () => {
  test("calculateAge should return the correct age", () => {
    // יצירת timestamp לתאריך לידה
    const birthDate = new Date('2000-01-01');
    const birthTimestamp = Timestamp.fromDate(birthDate);

    const result = calculateAge(birthTimestamp);

    // חישוב הגיל הצפוי
    const today = new Date();
    const expectedYears = today.getFullYear() - birthDate.getFullYear();

    expect(result.years).toBe(expectedYears);
    expect(result.months).toBeGreaterThanOrEqual(0);
    expect(result.months).toBeLessThan(12);
  });

  test("calculateAge should handle edge cases", () => {
    // מקרה של יום הולדת לפני זמן קצר
    const recentBirthDate = new Date();
    recentBirthDate.setFullYear(recentBirthDate.getFullYear() - 1);
    recentBirthDate.setMonth(recentBirthDate.getMonth() + 11);

    const birthTimestamp = Timestamp.fromDate(recentBirthDate);

    const result = calculateAge(birthTimestamp);

    expect(result.years).toBe(1);
    expect(result.months).toBeLessThan(12);
  });
});