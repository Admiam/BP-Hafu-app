import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import CatOnTrip from "@/assets/images/cat-on-trip";
import CatWithMug from "@/assets/images/cat-with-mug";
import DogWatchman from "@/assets/images/dog-watchman";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedText } from "@/components/ThemedText";
import { useGlobalContext } from "@/app/context/GlobalProvider";
import { useRegistration } from "@/app/context/RegistrationContext";
import { isRegisteredInShelter } from "@/lib/appwrite";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/components/navigation/navigation";

const Welcome = () => {
    const { loading, isLogged } = useGlobalContext();
    const { setIsShelter } = useRegistration();
    const theme = useColorScheme() ?? 'light';
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const [checkingRegistration, setCheckingRegistration] = useState(true);

    useEffect(() => {
        if (loading || !isLogged) {
            setCheckingRegistration(false);
            return;
        }

        let isActive = true;

        (async () => {
            try {
                const registered = await isRegisteredInShelter();
                if (!isActive) return;

                if (registered) {
                    navigation.navigate('(drawer)', {
                        screen: '(tabs)',
                        params: { screen: 'home' },
                    });
                } else {
                    router.push('/register-shelter');
                }
            } finally {
                if (isActive) setCheckingRegistration(false);
            }
        })();

        return () => {
            isActive = false;
        };
    }, [loading, isLogged, navigation]);

    const isLoading = loading || checkingRegistration;

    return (
        <ParallaxScrollView
            className="bg-primary h-screen"
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#000" }}
            headerImage={<></>}
        >
            {isLoading ? (
                <ThemedView className="w-full h-full justify-center items-center">
                    <ActivityIndicator size="large" color="#64FCD9" />
                </ThemedView>
            ) : (
                <>
                    <ThemedView className="w-full h-full flex pt-10 px-10">
                        <ThemedView className="relative">
                            <ThemedText type="title" className="text-4xl">
                                Najdi svého nejlepšího{" "}
                                <ThemedText
                                    className="text-4xl text-secondary-200"
                                    style={{ color: theme === 'light' ? Colors.light.secondary : Colors.dark.secondary }}
                                >
                                    přítele
                                </ThemedText>
                            </ThemedText>
                        </ThemedView>

                        <ThemedView className="relative">
                            <ThemedView className="relative h-1/3">
                                <CatWithMug className="absolute left-5 mt-8" />
                            </ThemedView>
                            <ThemedView className="relative h-1/4">
                                <DogWatchman className="absolute top-30 right-4 mt-8" />
                            </ThemedView>
                            <CatOnTrip className="left-6 mt-8 h-1/3" />
                        </ThemedView>
                    </ThemedView>

                    <ThemedView className="absolute bottom-10 w-full bg-primary p-4">
                        <SubmitButton
                            title="PŘIHLÁSIT SE JAKO UŽIVATEL"
                            handlePress={() => {
                                setIsShelter(false);
                                router.push("/sign-with-email");
                            }}
                            buttonColorKey="secondary"
                        />
                        <SubmitButton
                            title="PŘIHLÁSIT SE JAKO ÚTULEK"
                            className="mt-4"
                            buttonColorKey="secondary"
                            handlePress={() => {
                                setIsShelter(true);
                                router.push("/sign-with-email");
                            }}
                        />
                    </ThemedView>

                    <StatusBar backgroundColor="#161622" style="light" />
                </>
            )}
        </ParallaxScrollView>
    );
};

export default Welcome;
