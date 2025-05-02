import React, {useCallback, useEffect, useState} from "react";
import {RefreshControl, ScrollView} from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import TopBar from "@/components/navigation/TopBar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import { useGlobalContext } from "@/app/context/GlobalProvider";
import { router } from "expo-router";
import {
    deleteAccount,
    getCurrentUserBirthDate,
    getCurrentUserEmail, getCurrentUserFormCollection,
    getCurrentUserName,
    logOut, UserDocument
} from "@/lib/appwrite";
import {format} from "date-fns";
import {DrawerActions, NavigationProp, useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "@/components/navigation/navigation";

const AccountScreen: React.FC = () => {
    const { setUser, setIsLogged } = useGlobalContext();
    const colorScheme = useColorScheme();
    const [birthDate, setBirthDate] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<UserDocument | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const TIMER_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours threshold
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    useEffect(() => {
        const fetchBirthDate = async () => {
            try {
                const userBirthDate = await getCurrentUserBirthDate();
                // Format the ISO date string into "dd. MM. yyyy"
                // @ts-ignore
                const formattedDate = format(new Date(userBirthDate), "dd. MM. yyyy");
                setBirthDate(formattedDate);
            } catch (error) {
                console.error("Failed to load birth date:", error);
            }
        };

        fetchBirthDate();
    }, []); //fetch birth date
    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const userName = await getCurrentUserName();
                setUserName(userName);
            } catch (error) {
                console.error("Failed to load user:", error);
            }
        };
        fetchUserName();
    }, []); //fetch user name
    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                const userEmail = await getCurrentUserEmail();
                setUserEmail(userEmail);
            } catch (error) {
                console.error("Failed to load user:", error);
            }
        };
        fetchUserEmail();
    }, []); //fetch user email
    useEffect(() => {
        async function fetchUser() {
            const user = await getCurrentUserFormCollection();
            setCurrentUser(user);
        }
        fetchUser();
    }, []);

    function onEdit() {
        if (currentUser){
            navigation.navigate('Modals', {
                screen: 'UpdateAccount',
                params: {
                    user: currentUser,
                },
            });
        }
    }
    function onMenu() {
        navigation.dispatch(DrawerActions.openDrawer());
    }

    const onLogout = async () => {
        await logOut();
        setUser(null);
        setIsLogged(false);
        router.replace("/");
    };

    async function onDelete() {
        // try {
        //     await deleteAccount();
        // } catch (error) {
        //     console.error("Error deleting account:", error);
        // }
        //TODO implement delete account
        await logOut();
        setUser(null);
        setIsLogged(false);
        router.replace("/");
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const userBirthDate = await getCurrentUserBirthDate();
            // Format the ISO date string into "dd. MM. yyyy"
            // @ts-ignore
            const formattedDate = format(new Date(userBirthDate), "dd. MM. yyyy");
            setBirthDate(formattedDate);

            const userName = await getCurrentUserName();
            setUserName(userName);

            const userEmail = await getCurrentUserEmail();
            setUserEmail(userEmail);
        } catch (error) {
            console.error("Error fetching pets:", error);
        } finally {
            setRefreshing(false);
        }
    }, [TIMER_THRESHOLD_MS])

    return (
        <ParallaxScrollView
            headerBackgroundColor={{
                light: "#D0D0D0",
                dark: "#353636",
            }}
            headerImage={<></>}
        >
                <TopBar
                    title="Hafu"
                    isShelter={currentUser?.is_shelter}
                    leftIcon={{
                        library: "MaterialIcons",
                        name: "menu",
                        onPress: onMenu,
                    }}
                    rightIcon={{
                        library: "FontAwesome5",
                        name: "edit",
                        size: 25,
                        onPress: onEdit,
                    }}
                />
                <ScrollView
                    refreshControl={<RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        // Optional: customize colors to match your app theme
                        colors={["#64FCD9", "#689F38"]}
                        tintColor="#64FCD9"
                    />}
                >
                    <ThemedView className="w-full h-full flex items-center">

                        <ThemedText type="title" className="text-4xl mb-5">
                            Správa účtu
                        </ThemedText>
                        <ThemedView className="flex flex-row gap-4 items-center">
                            <ThemedView>
                                <MaterialIcons
                                    name="account-circle"
                                    size={120}
                                    color={colorScheme === "dark" ? "white" : "black"}
                                />
                            </ThemedView>
                            <ThemedView>
                                {/* Display logged user data. Adjust property names as needed */}
                                <ThemedText className="text-lg font-medium mb-1">
                                    {userName || "Neznámé jméno"}
                                </ThemedText>
                                <ThemedText className="text-lg font-medium mb-1">
                                    {userEmail || "Neznámý email"}
                                </ThemedText>
                                <ThemedText className="text-lg font-medium">
                                    {birthDate || "N/A"}
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                        <ThemedView className="w-full bg-primary p-4">
                            <SubmitButton
                                title="ODHLÁSIT SE"
                                handlePress={onLogout}
                                buttonColorKey="buttonSecondary"
                                textColorKey="buttonTextSecondary"
                            />
                            <SubmitButton
                                title="ZRUŠIT ÚČET"
                                handlePress={onDelete}
                                buttonColorKey="buttonSecondary"
                                textColorKey="errorText"
                            />
                        </ThemedView>
                    </ThemedView>
                </ScrollView>
        </ParallaxScrollView>
    );
};

export default AccountScreen;
