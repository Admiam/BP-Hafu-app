// __tests__/register-pet-test.tsx

// 1. Mockování StyleSheet a React Native komponent
import {ReactTestInstance} from "react-test-renderer";

jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
    compose: jest.fn((s1, s2) => ({ ...s1, ...s2 })),
}));

jest.mock('react-native', () => ({
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
}));

// 2. Mockování externích knihoven
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        replace: jest.fn(),
    },
    useLocalSearchParams: jest.fn().mockReturnValue({}),
}));

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

jest.mock('date-fns', () => ({
    format: jest.fn((date, formatString) => '2023-01-01'),
}));

jest.mock('nativewind', () => ({
    styled: jest.fn(component => component),
    useColorScheme: jest.fn(() => ({
        colorScheme: 'light',
        setColorScheme: jest.fn(),
        toggleColorScheme: jest.fn(),
    })),
}));

// 3. Mockování Appwrite funkcí
jest.mock('@/lib/appwrite', () => ({
    getTypes: jest.fn().mockResolvedValue({
        documents: [
            { $id: 'dog-id', type: 'dog' },
            { $id: 'cat-id', type: 'cat' },
        ]
    }),
    getSizeByType: jest.fn().mockResolvedValue({
        documents: [
            { $id: 'size-small', size_type: 'small', size: 'S' },
            { $id: 'size-medium', size_type: 'medium', size: 'M' },
            { $id: 'size-large', size_type: 'large', size: 'L' },
        ]
    }),
    getCurrencies: jest.fn().mockResolvedValue({
        documents: [
            { $id: 'czk-id', currency: 'CZK' },
            { $id: 'eur-id', currency: 'EUR' },
        ]
    }),
    registerPet: jest.fn().mockResolvedValue('new-pet-id'),
}));

// 4. Mockování validační funkce
jest.mock('@/utils/validation', () => ({
    validatePetRegistration: jest.fn().mockReturnValue({}),
}));

// 5. Mockování komponent
jest.mock('@/components/ParallaxScrollView', () => 'ParallaxScrollView');
jest.mock('@/components/buttons/BackButton', () => 'BackButton');
jest.mock('@/components/ThemedView', () => 'ThemedView');
jest.mock('@/components/ThemedText', () => 'ThemedText');
jest.mock('@/components/buttons/SubmitButton', () => 'SubmitButton');
jest.mock('@/components/forms/CustomTextInput', () => 'CustomTextInput');
jest.mock('@/components/forms/CustomTextArea', () => 'CustomTextArea');
jest.mock('@/components/forms/CustomDropDownMenu', () => 'CustomDropDownMenu');
jest.mock('@/components/forms/CustomDateInput', () => 'CustomDateInput');
jest.mock('@/components/forms/CustomMultipleDropdownMenu', () => 'CustomMultipleDropdownMenu');
jest.mock('@/components/forms/TwoOptionToggle', () => 'TwoOptionToggle');
jest.mock('@/components/forms/UploadImage', () => 'UploadImage');

// 6. Import modulů po nastavení mocků
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RegisterPet from '@/app/(modals)/registerPet';
import * as appwrite from '@/lib/appwrite';
import * as expoRouter from 'expo-router';
import * as validation from '@/utils/validation';

// 7. Typované mocky pro TypeScript
const mockedGetTypes = appwrite.getTypes as jest.MockedFunction<typeof appwrite.getTypes>;
const mockedGetSizeByType = appwrite.getSizeByType as jest.MockedFunction<typeof appwrite.getSizeByType>;
const mockedGetCurrencies = appwrite.getCurrencies as jest.MockedFunction<typeof appwrite.getCurrencies>;
const mockedRegisterPet = appwrite.registerPet as jest.MockedFunction<typeof appwrite.registerPet>;
const mockedRouterReplace = expoRouter.router.replace as jest.MockedFunction<typeof expoRouter.router.replace>;
const mockedValidatePetRegistration = validation.validatePetRegistration as jest.MockedFunction<typeof validation.validatePetRegistration>;

describe('RegisterPet', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renderuje formulář pro registraci mazlíčka', async () => {
        const { getByText } = render(<RegisterPet />);

        // Komponenta načítá typy mazlíčků při prvním renderování
        expect(mockedGetTypes).toHaveBeenCalled();

        // Počkáme na načtení dat
        await waitFor(() => {
            expect(getByText('Typ mazlíka')).toBeTruthy();
        });
    });

    test('načítá typy mazlíčků, velikosti a měny při inicializaci', async () => {
        render(<RegisterPet />);

        await waitFor(() => {
            expect(mockedGetTypes).toHaveBeenCalled();
            expect(mockedGetCurrencies).toHaveBeenCalled();
        });
    });

    test('zobrazí formulářová pole po výběru typu mazlíčka', async () => {
        const { getByText, getAllByText } = render(<RegisterPet />);

        // Počkáme na načtení dat
        await waitFor(() => {
            expect(getByText('Typ mazlíka')).toBeTruthy();
        });

        // Simulujeme výběr typu "pes"
        const dropdowns = getAllByText('CustomDropDownMenu');
        const typeDropdown = dropdowns[0];

        // Voláme onValueChange handler
        fireEvent(typeDropdown, 'onValueChange', 'dog-id');

        // Ověříme, že se zobrazila další pole
        await waitFor(() => {
            expect(getByText('Jméno mazlíka')).toBeTruthy();
            expect(getByText('Pohlaví')).toBeTruthy();
            expect(getByText('Datum narození')).toBeTruthy();
        });

        // Ověříme, že se načítají velikosti
        expect(mockedGetSizeByType).toHaveBeenCalledWith('dog');
    });

    test('validuje jednotlivá pole při změně hodnot', async () => {
        const { getByText, getAllByText } = render(<RegisterPet />);

        await waitFor(() => {
            expect(getByText('Typ mazlíka')).toBeTruthy();
        });

        // Simulujeme výběr typu "pes"
        const dropdowns = getAllByText('CustomDropDownMenu');
        const typeDropdown = dropdowns[0];
        fireEvent(typeDropdown, 'onValueChange', 'dog-id');

        // Najdeme vstupní pole pro jméno mazlíčka
        await waitFor(() => {
            const inputs = getAllByText('CustomTextInput');
            // První vstupní pole po nadpisu "Jméno mazlíčka"
            const nameInput = inputs.find(input => input.props.label === 'Jméno mazlíka');
            fireEvent(nameInput as ReactTestInstance, 'onChangeText', 'Rex');


            // Ověříme, že byla volána validační funkce
            expect(mockedValidatePetRegistration).toHaveBeenCalled();
        });
    });

    test('zobrazí chyby validace při odeslání formuláře', async () => {
        // Nastavíme mock pro validatePetRegistration, aby vracel chyby
        mockedValidatePetRegistration.mockReturnValueOnce({
            petName: 'Jméno mazlíka je povinné',
            petText: 'Popis mazlíka je povinný',
        });

        const { getByText, getAllByText } = render(<RegisterPet />);

        await waitFor(() => {
            expect(getByText('Typ mazlíka')).toBeTruthy();
        });

        // Simulujeme výběr typu "pes"
        const dropdowns = getAllByText('CustomDropDownMenu');
        const typeDropdown = dropdowns[0];
        fireEvent(typeDropdown, 'onValueChange', 'dog-id');

        // Najdeme tlačítko pro odeslání
        const submitButton = getByText('POTVRDIT');
        fireEvent.press(submitButton);

        // Ověříme, že se zobrazí alert s chybami
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Chyba',
                'Formulář obsahuje chyby. Opravte je prosím a zkuste to znovu.'
            );
        });
    });

    test('zpracovává úspěšné nahrání obrázku', async () => {
        const { getByText, getAllByText } = render(<RegisterPet />);

        await waitFor(() => {
            expect(getByText('Typ mazlíka')).toBeTruthy();
        });

        // Simulujeme výběr typu "pes"
        const dropdowns = getAllByText('CustomDropDownMenu');
        const typeDropdown = dropdowns[0];
        fireEvent(typeDropdown, 'onValueChange', 'dog-id');

        // Najdeme komponentu UploadImage
        const uploadComponents = getAllByText('UploadImage');
        const uploadComponent = uploadComponents[0];

        // Simulujeme úspěšné nahrání obrázku
        const uploadedImage = {
            fileId: 'file-id',
            fileUrl: 'https://example.com/image.jpg',
            storageId: 'storage-id',
            slotIndex: 0
        };

        fireEvent(uploadComponent, 'onUploadSuccess', uploadedImage);

        // Ověříme, že byla volána validační funkce s nahraným obrázkem
        expect(mockedValidatePetRegistration).toHaveBeenCalled();

        // Ověříme, že poslední volání validatePetRegistration obsahovalo pole images s naším obrázkem
        const lastCall = mockedValidatePetRegistration.mock.calls[mockedValidatePetRegistration.mock.calls.length - 1][0];
        expect(lastCall.uploadedImages).toContainEqual(uploadedImage);
    });

    test('úspěšně odesílá formulář a naviguje na správnou stránku', async () => {
        // Nastavíme, že validace projde bez chyb
        mockedValidatePetRegistration.mockReturnValue({});

        const { getByText, getAllByText } = render(<RegisterPet />);

        await waitFor(() => {
            expect(getByText('Typ mazlíka')).toBeTruthy();
        });

        // Simulujeme výběr typu "pes"
        const dropdowns = getAllByText('CustomDropDownMenu');
        const typeDropdown = dropdowns[0];
        fireEvent(typeDropdown, 'onValueChange', 'dog-id');

        // Vyplníme jméno mazlíčka
        const inputs = getAllByText('CustomTextInput');
        const nameInput = inputs.find(input => input.props.label === 'Jméno mazlíka');
        fireEvent(nameInput as ReactTestInstance, 'onChangeText', 'Rex');

        // Najdeme tlačítko pro odeslání a pošleme formulář
        const submitButton = getByText('POTVRDIT');
        await act(async () => {
            fireEvent.press(submitButton);
        });

        // Ověříme, že byla volána funkce pro registraci mazlíčka
        await waitFor(() => {
            expect(mockedRegisterPet).toHaveBeenCalled();
        });

        // Ověříme, že se zobrazil úspěšný alert
        expect(Alert.alert).toHaveBeenCalledWith(
            'Success',
            'Mazlíček byl úspěšně registrován.',
            [expect.objectContaining({ text: 'OK' })]
        );

        // Simulujeme kliknutí na "OK" v alertu
        const alertCallback = (Alert.alert as jest.Mock).mock.calls[0][2][0].onPress;
        alertCallback();

        // Ověříme, že došlo k přesměrování
        expect(mockedRouterReplace).toHaveBeenCalledWith('/(drawer)/PetManagement');
    });

    test('ošetřuje chybu při odesílání formuláře', async () => {
        // Nastavíme, že validace projde bez chyb
        mockedValidatePetRegistration.mockReturnValue({});

        // Nastavíme, že registrace selže
        mockedRegisterPet.mockRejectedValueOnce(new Error('Registration failed'));

        // Spyujeme console.error
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const { getByText, getAllByText } = render(<RegisterPet />);

        await waitFor(() => {
            expect(getByText('Typ mazlíka')).toBeTruthy();
        });

        // Simulujeme výběr typu "pes"
        const dropdowns = getAllByText('CustomDropDownMenu');
        const typeDropdown = dropdowns[0];
        fireEvent(typeDropdown, 'onValueChange', 'dog-id');

        // Najdeme tlačítko pro odeslání a pošleme formulář
        const submitButton = getByText('POTVRDIT');
        await act(async () => {
            fireEvent.press(submitButton);
        });

        // Ověříme, že došlo k zalogování chyby
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error submitting shelter registration:', expect.any(Error));
        });

        // Ověříme, že se zobrazil chybový alert
        expect(Alert.alert).toHaveBeenCalledWith(
            'Chyba',
            'Nepodařilo se registrovat útulek.'
        );

        // Obnovíme console.error
        consoleSpy.mockRestore();
    });

    test('podmíněně zobrazuje popis handicapu při výběru "Ano"', async () => {
        const { getByText, getAllByText } = render(<RegisterPet />);

        await waitFor(() => {
            expect(getByText('Typ mazlíka')).toBeTruthy();
        });

        // Simulujeme výběr typu "pes"
        const dropdowns = getAllByText('CustomDropDownMenu');
        const typeDropdown = dropdowns[0];
        fireEvent(typeDropdown, 'onValueChange', 'dog-id');

        // Najdeme přepínač pro handicap
        const toggles = getAllByText('TwoOptionToggle');
        const handicapToggle = toggles.find(toggle => toggle.props.label === 'Handicap');

        // Simulujeme změnu na "Ano"
        fireEvent(handicapToggle as ReactTestInstance, 'onChange', 'true');


        // Ověříme, že se zobrazil popis handicapu
        await waitFor(() => {
            const textAreas = getAllByText('CustomTextArea');
            const handicapTextArea = textAreas.find(area => area.props.label === 'Popis handicapu');
            expect(handicapTextArea).toBeTruthy();
        });
    });
});
