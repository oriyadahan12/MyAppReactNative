import { Timestamp } from 'firebase/firestore';
import { calculateAge } from "./ChildCard";
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MileStones from "../MileStones"; // Adjust the path if needed
import { doc, getDoc, updateDoc } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn()
}));

describe("MileStones Component", () => {
  test("renders loading state initially", () => {
    const { getByText } = render(<MileStones />);
    expect(getByText("טוען נתונים..."));
  });

  test("fetches and displays child data", async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        name: "יוסי",
        growthStages: {
          "הליכה ראשונה": { date: null, comments: "" }
        }
      })
    });

    const { getByText } = render(<MileStones />);
    await waitFor(() => expect(getByText("מעקב התפתחות - יוסי")));
    expect(getByText("הליכה ראשונה"));
  });

  test("updates stage data on save", async () => {
    const mockUpdateDoc = jest.fn();
    updateDoc.mockImplementation(mockUpdateDoc);

    const { getByText } = render(<MileStones />);

    fireEvent.press(getByText("שמירה"));

    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });
});

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
});
