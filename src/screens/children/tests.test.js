import { Timestamp } from 'firebase/firestore';
import { calculateAge } from "./ChildCard";

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

// import React from "react";
// import { render, fireEvent, waitFor } from "@testing-library/react-native";
// import MileStones from "../MileStones"; // Adjust the path if needed
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { db } from "../../util/firebaseConfig";
//
// jest.mock("firebase/firestore", () => ({
//   doc: jest.fn(),
//   getDoc: jest.fn(),
//   updateDoc: jest.fn()
// }));
//
// describe("MileStones Component", () => {
//   test("renders loading state initially", () => {
//     const { getByText } = render(<MileStones />);
//     expect(getByText("טוען נתונים..."));
//   });
//
//   test("fetches and displays child data", async () => {
//     getDoc.mockResolvedValueOnce({
//       exists: () => true,
//       data: () => ({
//         name: "יוסי",
//         growthStages: {
//           "הליכה ראשונה": { date: null, comments: "" }
//         }
//       })
//     });
//
//     const { getByText } = render(<MileStones />);
//     await waitFor(() => expect(getByText("מעקב התפתחות - יוסי")));
//     expect(getByText("הליכה ראשונה"));
//   });
//
//   test("updates stage data on save", async () => {
//     const mockUpdateDoc = jest.fn();
//     updateDoc.mockImplementation(mockUpdateDoc);
//
//     const { getByText } = render(<MileStones />);
//
//     fireEvent.press(getByText("שמירה"));
//
//     await waitFor(() => {
//       expect(mockUpdateDoc).toHaveBeenCalled();
//     });
//   });
// });
