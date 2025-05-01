// jest-setup.js
// jest-setup.js
import 'react-native-gesture-handler/jestSetup';


jest.mock('@/components/ParallaxScrollView', () => 'ParallaxScrollView');
jest.mock('@/components/buttons/BackButton', () => 'BackButton');
jest.mock('@/components/ThemedView', () => 'ThemedView');
jest.mock('@/components/ThemedText', () => 'ThemedText');
jest.mock('@/components/buttons/SubmitButton', () => 'SubmitButton');
jest.mock('@/components/forms/CustomTextInput', () => 'CustomTextInput');
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('nativewind', () => ({
    styled: jest.fn(component => component),
    useColorScheme: jest.fn(() => ({
        colorScheme: 'light',
        setColorScheme: jest.fn(),
        toggleColorScheme: jest.fn(),
    })),
}));
