// __tests__/sign-with-email-test.tsx

// 1. Set up mocks for StyleSheet first - this is critical to avoid "undefined reading 'create'" errors
jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
    compose: jest.fn((s1, s2) => ({ ...s1, ...s2 })),
}));

// 2. Mock react-native core components
jest.mock('react-native', () => {
    return {
        StyleSheet: {
            create: jest.fn(styles => styles),
        },
        Platform: { OS: 'ios', select: jest.fn(obj => obj.ios) },
        Alert: { alert: jest.fn() },
        View: 'View',
        Text: 'Text',
        TouchableOpacity: 'TouchableOpacity',
        TextInput: 'TextInput',
        ScrollView: 'ScrollView',
        Dimensions: { get: jest.fn(() => ({ width: 375, height: 812 })) },
        Animated: {
            Value: jest.fn(() => ({
                interpolate: jest.fn(),
                setValue: jest.fn(),
                addListener: jest.fn(() => ({ remove: jest.fn() })),
                removeListener: jest.fn(),
            })),
            View: 'Animated.View',
            Text: 'Animated.Text',
            ScrollView: 'Animated.ScrollView',
            createAnimatedComponent: jest.fn(comp => comp),
            timing: jest.fn(() => ({ start: jest.fn() })),
            event: jest.fn(() => jest.fn()),
        },
        // Add other necessary React Native components
    };
});

// 3. Mock external libraries
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        replace: jest.fn(),
    },
    useLocalSearchParams: jest.fn().mockReturnValue({}),
}));

jest.mock('@/lib/appwrite', () => ({
    emailExists: jest.fn(),
}));

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

jest.mock('nativewind', () => ({
    styled: jest.fn(component => component),
    useColorScheme: jest.fn(() => ({
        colorScheme: 'light',
        setColorScheme: jest.fn(),
        toggleColorScheme: jest.fn(),
    })),
}));

// 4. Mock components used in SignWithEmailForm
jest.mock('@/components/ParallaxScrollView', () => 'ParallaxScrollView');
jest.mock('@/components/buttons/BackButton', () => 'BackButton');
jest.mock('@/components/ThemedView', () => 'ThemedView');
jest.mock('@/components/ThemedText', () => 'ThemedText');
jest.mock('@/components/buttons/SubmitButton', () => 'SubmitButton');
jest.mock('@/components/forms/CustomTextInput', () => 'CustomTextInput');

// 5. Import modules after setting up mocks
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SignWithEmailForm from '@/app/(auth)/sign-with-email';
import { RegistrationProvider } from '@/app/context/RegistrationContext';
import * as appwrite from '@/lib/appwrite';
import * as expoRouter from 'expo-router';

// Type the mocked functions properly for TypeScript
const mockedEmailExists = appwrite.emailExists as jest.MockedFunction<(email: string) => Promise<boolean>>;
const mockedRouterPush = expoRouter.router.push as jest.MockedFunction<(href: string) => void>;
const mockedRouterReplace = expoRouter.router.replace as jest.MockedFunction<(href: string) => void>;

// Helper to wrap component in the Registration context
const renderWithContext = (component: React.ReactElement) => {
    return render(
        <RegistrationProvider>
            {component}
        </RegistrationProvider>
    );
};

// Test suite
describe('SignWithEmailForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the email input field correctly', () => {
        const { getByPlaceholderText, getByText } = renderWithContext(<SignWithEmailForm />);
        expect(getByPlaceholderText('Váš email')).toBeTruthy();
        expect(getByText('POTVRDIT')).toBeTruthy();
    });

    test('updates email value when user types', () => {
        const { getByPlaceholderText } = renderWithContext(<SignWithEmailForm />);
        const emailInput = getByPlaceholderText('Váš email');
        fireEvent.changeText(emailInput, 'test@example.com');
        expect(emailInput.props.value).toBe('test@example.com');
    });

    test('shows error for invalid email format', async () => {
        const { getByPlaceholderText, getByText } = renderWithContext(<SignWithEmailForm />);
        const emailInput = getByPlaceholderText('Váš email');
        fireEvent.changeText(emailInput, 'invalid-email');
        const submitButton = getByText('POTVRDIT');
        fireEvent.press(submitButton);
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Neplatný email', expect.any(String));
        });
    });

    test('redirects to login when email exists', async () => {
        // Mock email exists to return true
        mockedEmailExists.mockResolvedValue(true);
        const { getByPlaceholderText, getByText } = renderWithContext(<SignWithEmailForm />);
        const emailInput = getByPlaceholderText('Váš email');
        fireEvent.changeText(emailInput, 'existing@example.com');
        const submitButton = getByText('POTVRDIT');
        fireEvent.press(submitButton);
        await waitFor(() => {
            expect(mockedEmailExists).toHaveBeenCalledWith('existing@example.com');
            expect(mockedRouterReplace).toHaveBeenCalledWith('/login');
        });
    });

    test('proceeds to next registration step when email is new', async () => {
        // Mock email exists to return false
        mockedEmailExists.mockResolvedValue(false);
        const { getByPlaceholderText, getByText } = renderWithContext(<SignWithEmailForm />);
        const emailInput = getByPlaceholderText('Váš email');
        fireEvent.changeText(emailInput, 'new@example.com');
        const submitButton = getByText('POTVRDIT');
        fireEvent.press(submitButton);
        await waitFor(() => {
            expect(mockedEmailExists).toHaveBeenCalledWith('new@example.com');
            expect(mockedRouterPush).toHaveBeenCalledWith('/sign-with-name');
        });
    });

    test('shows loading state during submission', async () => {
        // Mock delayed response for emailExists
        mockedEmailExists.mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(false), 100))
        );
        const { getByPlaceholderText, getByText, findByText } = renderWithContext(<SignWithEmailForm />);
        const emailInput = getByPlaceholderText('Váš email');
        fireEvent.changeText(emailInput, 'test@example.com');
        const submitButton = getByText('POTVRDIT');
        fireEvent.press(submitButton);
        // Find the loading button text
        const loadingButton = await findByText('OVĚŘUJI...');
        expect(loadingButton).toBeTruthy();
        // After waiting, expect button to return to normal
        await waitFor(() => {
            expect(getByText('POTVRDIT')).toBeTruthy();
        });
    });

    test('handles API errors gracefully', async () => {
        // Mock error response
        const errorMessage = 'Network error';
        mockedEmailExists.mockRejectedValue(new Error(errorMessage));
        // Mock console.error to prevent it from cluttering test output
        const mockedConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        const { getByPlaceholderText, getByText } = renderWithContext(<SignWithEmailForm />);
        const emailInput = getByPlaceholderText('Váš email');
        fireEvent.changeText(emailInput, 'test@example.com');
        const submitButton = getByText('POTVRDIT');
        fireEvent.press(submitButton);

        await waitFor(() => {
            expect(mockedConsoleError).toHaveBeenCalledWith('Error checking email:', expect.any(Error));
            // Button should return to normal state
            expect(getByText('POTVRDIT')).toBeTruthy();
        });

        // Restore original console.error
        mockedConsoleError.mockRestore();
    });

    test('disables submit button during submission', async () => {
        // Mock delayed response
        mockedEmailExists.mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(false), 100))
        );

        const { getByPlaceholderText, getByText } = renderWithContext(<SignWithEmailForm />);
        const emailInput = getByPlaceholderText('Váš email');
        fireEvent.changeText(emailInput, 'test@example.com');
        const submitButton = getByText('POTVRDIT');
        fireEvent.press(submitButton);

        await waitFor(() => {
            const loadingButton = getByText('OVĚŘUJI...');
            expect(loadingButton.props.disabled).toBe(true);
        });

        await waitFor(() => {
            expect(getByText('POTVRDIT')).toBeTruthy();
        });
    });
});
