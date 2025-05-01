// app/(modals)/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import PetDetail from "@/app/(modals)/petDetail";
import RegisterPet from "@/app/(modals)/registerPet";
import ShelterDetail from "@/app/(modals)/shelterDetail";
import ShelterPetDetail from "@/app/(modals)/shelterPetDetail";
import UpdateShelter from "@/app/(modals)/updateShelter";
import UpdatePet from "@/app/(modals)/updatePet";
import Filter from "@/app/(modals)/filter";
import UpdateAccount from "@/app/(modals)/updateAccount";
import ContactShelter from "@/app/(modals)/contactShelter";

SplashScreen.preventAutoHideAsync();

export default function ModalLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }
    const ModalStack = createNativeStackNavigator();


    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <ModalStack.Navigator>
                    <ModalStack.Screen name="PetDetail" options={{ headerShown: false, gestureEnabled: true, }} component={PetDetail} />
                    <ModalStack.Screen name="ShelterDetail" options={{ headerShown: false, gestureEnabled: true, }} component={ShelterDetail} />
                    <ModalStack.Screen name="RegisterPet" options={{ headerShown: false, gestureEnabled: false,}} component={RegisterPet} />
                    <ModalStack.Screen name="ShelterPetDetail" options={{ headerShown: false, gestureEnabled: false,}} component={ShelterPetDetail} />
                    <ModalStack.Screen name="UpdateShelter" options={{ headerShown: false, gestureEnabled: false,}} component={UpdateShelter} />
                    <ModalStack.Screen name="UpdatePet" options={{ headerShown: false, gestureEnabled: false,}} component={UpdatePet} />
                    <ModalStack.Screen name="Filter" options={{ headerShown: false, gestureEnabled: false,}} component={Filter} />
                    <ModalStack.Screen name="UpdateAccount" options={{ headerShown: false, gestureEnabled: false,}} component={UpdateAccount} />
                    <ModalStack.Screen name="ContactShelter" options={{ headerShown: false, gestureEnabled: false,}} component={ContactShelter} />
                </ModalStack.Navigator>
        </ThemeProvider>
    );
}
