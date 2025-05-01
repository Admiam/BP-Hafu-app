// __tests__/sign-with-name-test.tsx

// 1. Nastavení mocků pro StyleSheet a React Native komponenty
jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
    compose: jest.fn((s1, s2) => ({ ...s1, ...s2 })),
}));

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
    };
});

// 2. Mocky pro externí knihovny
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        replace: jest.fn(),
    },
    useLocalSearchParams: jest.fn().mockReturnValue({}),
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

// 3. Mocky pro komponenty použité v SignWithNameForm
jest.mock('@/components/ParallaxScrollView', () => 'ParallaxScrollView');
jest.mock('@/components/buttons/BackButton', () => 'BackButton');
jest.mock('@/components/ThemedView', () => 'ThemedView');
jest.mock('@/components/ThemedText', () => 'ThemedText');
jest.mock('@/components/buttons/SubmitButton', () => 'SubmitButton');
jest.mock('@/components/forms/CustomTextInput', () => 'CustomTextInput');

// 4. Mokování validačních funkcí
jest.mock('@/utils/validation', () => ({
    validateName: jest.fn((name, fieldName) => {
        if (!name || name.trim() === '') {
            return `${fieldName} je povinné`;
        }
        if (name.trim().length < 2) {
            return `${fieldName} musí obsahovat alespoň 2 znaky`;
        }
        return null;
    }),
    validateEmail: jest.fn(),
}));

// 5. Import modulů po nastavení mocků
import React, {useState} from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SignWithNameForm from '@/app/(auth)/sign-with-name';
import { RegistrationProvider } from '@/app/context/RegistrationContext';
import * as expoRouter from 'expo-router';
import * as validation from '@/utils/validation';

// Typované mocky pro TypeScript
const mockedRouterPush = expoRouter.router.push as jest.MockedFunction<(href: string) => void>;
const mockedValidateName = validation.validateName as jest.MockedFunction<(name: string, fieldName?: string) => string | null>;



const mockRegistrationContext = {
    firstName: 'TestFirstName',
    setFirstName: jest.fn(),
    lastName: 'TestLastName',
    setLastName: jest.fn(),
    email: 'test@example.com',
    setEmail: jest.fn()
};


// Define your mock functions at test level
const mockSetFirstName = jest.fn();
const mockSetLastName = jest.fn();
const mockSetEmail = jest.fn();

// Create a test wrapper
const TestWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
    // Mock the useRegistration hook
    jest.mock('@/app/context/RegistrationContext', () => ({
        useRegistration: () => ({
            firstName: 'TestFirstName',
            setFirstName: mockSetFirstName,
            lastName: 'TestLastName',
            setLastName: mockSetLastName,
            email: 'test@example.com',
            setEmail: mockSetEmail
        })
    }));

    return <>{children}</>;
};

// Use it in tests
const renderWithContext = (component: React.ReactElement) => {
    return render(
        <TestWrapper>
            {component}
        </TestWrapper>
    );
};



// Testovací sada
describe('SignWithNameForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renderuje pole pro jméno a příjmení správně', () => {
        const { getByPlaceholderText, getByText } = renderWithContext(<SignWithNameForm />);
        expect(getByPlaceholderText('Vaše jméno')).toBeTruthy();
        expect(getByPlaceholderText('Vaše příjmení')).toBeTruthy();
        expect(getByText('POTVRDIT')).toBeTruthy();
    });

    test('aktualizuje hodnoty jména a příjmení při psaní uživatele', () => {
        const { getByPlaceholderText } = renderWithContext(<SignWithNameForm />);
        const firstNameInput = getByPlaceholderText('Vaše jméno');
        const lastNameInput = getByPlaceholderText('Vaše příjmení');

        fireEvent.changeText(firstNameInput, 'Jan');
        fireEvent.changeText(lastNameInput, 'Novák');

        // Zkontrolujeme, že mock funkce byly volány se správnými hodnotami
        expect(mockRegistrationContext.setFirstName).toHaveBeenCalledWith('Jan');
        expect(mockRegistrationContext.setLastName).toHaveBeenCalledWith('Novák');
    });

    test('zobrazí chybu pro neplatné jméno', async () => {
        // Nastavíme mock pro validateName, aby vracel chybu pro jméno
        mockedValidateName.mockImplementation((name, fieldName) => {
            if (name === 'TestFirstName') return 'Jméno musí obsahovat alespoň 2 znaky';
            return null;
        });

        const { getByText } = renderWithContext(<SignWithNameForm />);
        const submitButton = getByText('POTVRDIT');
        fireEvent.press(submitButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Chyba',
                'Formulář obsahuje chyby. Opravte je prosím a zkuste to znovu.'
            );
        });
    });

    test('zobrazí chybu pro neplatné příjmení', async () => {
        // Nastavíme mock pro validateName, aby vracel chybu pro příjmení
        mockedValidateName.mockImplementation((name, fieldName) => {
            if (name === 'TestLastName') return 'Příjmení musí obsahovat alespoň 2 znaky';
            return null;
        });

        const { getByText } = renderWithContext(<SignWithNameForm />);
        const submitButton = getByText('POTVRDIT');
        fireEvent.press(submitButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Chyba',
                'Formulář obsahuje chyby. Opravte je prosím a zkuste to znovu.'
            );
        });
    });

    test('pokračuje na další obrazovku s registrací, když jsou jména validní', async () => {
        // Nastavíme mock pro validateName, aby nevracel žádné chyby
        mockedValidateName.mockReturnValue(null);

        const { getByText } = renderWithContext(<SignWithNameForm />);
        const submitButton = getByText('POTVRDIT');
        fireEvent.press(submitButton);

        await waitFor(() => {
            expect(mockedRouterPush).toHaveBeenCalledWith('/sign-with-birth-date');
        });
    });

    test('ošetří chybový stav při navigaci', async () => {
        // Nastavíme mock pro validateName, aby nevracel žádné chyby
        mockedValidateName.mockReturnValue(null);

        // Nastavíme, že router.push vyhodí chybu
        mockedRouterPush.mockImplementation(() => {
            throw new Error('Navigation error');
        });

        // Spyujeme console.error
        const mockedConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        const { getByText } = renderWithContext(<SignWithNameForm />);
        const submitButton = getByText('POTVRDIT');
        fireEvent.press(submitButton);

        await waitFor(() => {
            expect(mockedConsoleError).toHaveBeenCalledWith('Error updating name:', expect.any(Error));
            expect(Alert.alert).toHaveBeenCalledWith(
                'Chyba',
                'Nepodařilo se aktualizovat jméno. Zkuste to prosím znovu.'
            );
        });

        // Obnovení původního console.error
        mockedConsoleError.mockRestore();
    });
});
