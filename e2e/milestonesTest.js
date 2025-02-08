import { render, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import MileStones from './MileStones';
import { useNavigation, useRoute } from '@react-navigation/native';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
}));

describe('MileStones Component', () => {
    it('should add a new stage successfully', async () => {
        // Mock route and navigation
        useRoute.mockReturnValue({ params: { childId: 'child123' } });
        const mockNavigation = { navigate: jest.fn() };
        useNavigation.mockReturnValue(mockNavigation);

        const { getByText, getByPlaceholderText } = render(<MileStones />);

        // Mock the child data fetching
        await waitFor(() => getByText('מעקב התפתחות'));

        // Enter a new stage name
        fireEvent.changeText(getByPlaceholderText('שם שלב'), 'New Stage');

        // Tap on the Add Stage button
        fireEvent.press(getByText('הוספת שלב חדש'));

        // Wait for the success alert
        await waitFor(() => getByText('השלב החדש נוסף בהצלחה!'));

        // Assert that the new stage was added successfully
        expect(getByText('New Stage')).toBeTruthy();
    });


jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
}));

describe('MileStones Component', () => {
    it('should delete a stage successfully', async () => {
        // Mock route and navigation
        useRoute.mockReturnValue({ params: { childId: 'child123' } });
        const mockNavigation = { navigate: jest.fn() };
        useNavigation.mockReturnValue(mockNavigation);

        const { getByText } = render(<MileStones />);

        // Mock the child data fetching
        await waitFor(() => getByText('מעקב התפתחות'));

        // Tap on the delete button for a stage
        fireEvent.press(getByText('מחק שלב'));

        // Confirm the deletion
        fireEvent.press(getByText('כן'));

        // Wait for the success alert
        await waitFor(() => getByText('השלב נמחק בהצלחה!'));

        // Assert that the stage was deleted
        expect(getByText('New Stage')).toBeFalsy();
    });
});
});