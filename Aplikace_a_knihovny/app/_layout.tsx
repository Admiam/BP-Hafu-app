import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import "../styles.css";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabLayout from "@/app/(drawer)/(tabs)/_layout";
import ModalLayout from "./(modals)/_layout";
import AuthLayout from "./(auth)/_layout";
import NotFoundScreen from "./+not-found";
import Welcome from "./index";
import GlobalProvider from "@/app/context/GlobalProvider";
import RegistrationProvider from "@/app/context/RegistrationContext";
import DrawerLayout from "@/app/(drawer)/_layout";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    const Stack = createNativeStackNavigator();

    return (
        <GlobalProvider>
            <RegistrationProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        {/* Remove the NavigationContainer here */}
                        <Stack.Navigator>
                            {/*<Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false,}} component={DrawerLayout} />*/}
                            <Stack.Screen name="(drawer)" options={{ headerShown: false, gestureEnabled: false,}} component={DrawerLayout} />
                            <Stack.Screen name="Modals" options={{ headerShown: false , gestureEnabled: false,}} component={ModalLayout} />
                            <Stack.Screen name="(auth)" options={{ headerShown: false, gestureEnabled: false, }} component={AuthLayout} />
                            <Stack.Screen name="+not-found" options={{ headerShown: false , gestureEnabled: false,}} component={NotFoundScreen} />
                            <Stack.Screen name="index" options={{ headerShown: false , gestureEnabled: false,}} component={Welcome} />
                        </Stack.Navigator>
                    </GestureHandlerRootView>
                </ThemeProvider>
            </RegistrationProvider>
        </GlobalProvider>
    );
}
