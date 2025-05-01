//@ts-ignore
import qs from 'qs';
import React, {useEffect, useState} from "react";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import BackButton from "@/components/buttons/BackButton";
import CustomTextInput from "@/components/forms/CustomTextInput";
import Animated, {
    useAnimatedRef,
} from 'react-native-reanimated';
import CustomTextArea from "@/components/forms/CustomTextArea";
import {getCurrentUserFormCollection, UserDocument} from "@/lib/appwrite";
import {Alert, Linking} from "react-native";
import {RouteProp, useRoute} from "@react-navigation/native";
import {ModalStackParamList} from "@/components/navigation/navigation";

const UpdateAccount: React.FC = () => {
    const route = useRoute<RouteProp<ModalStackParamList, 'ContactShelter'>>();
    const {pet} = route.params;
    const scrollRef = useAnimatedRef<Animated.ScrollView>();

    const [petName, setPetName] = useState(pet?.name || "");
    const [currentUser, setCurrentUser] = useState<UserDocument | null>(null);
    const [userFirstName, setUserFirstName] = useState("");
    const [userLastName, setUserLastName] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [shelterEmail, setShelterEmail] = useState("admiam.dev@gmail.com")
    const [shelterName, setShelterName] = useState("")
    const [petText, setPetText] = useState("")
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            const user = await getCurrentUserFormCollection();
            setCurrentUser(user);
            if (user){
                let fullName = user.first_name + " " + user.last_name
                setUserFirstName(user.first_name)
                setUserLastName(user.last_name)
                setUserName(fullName)
                setEmail(user.email)
            }
        }
        fetchUser();
    }, []); //fetch user on mount

    const sendEmail = async () => {
        setLoading(true);

        // Basic validation
        if (!userName.trim() || !email.trim() || !petText.trim()) {
            Alert.alert("Chyba", "Vyplňte prosím všechna povinná pole.");
            setLoading(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Chyba", "Zadejte prosím platnou emailovou adresu.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Create the email content
            const subject = `Zájem o mazlíčka: ${petName}`;
            const body = `Dobrý den,\n\nMám zájem o mazlíčka ${petName}.\n\n${petText}\n\nS pozdravem,\n${userName}\n${email}`;

            // Create the mailto URL with query parameters
            let url = `mailto:${shelterEmail}`;

            // Create email link query
            const query = qs.stringify({
                subject,
                body,
                cc: email // Optional: CC the sender
            });

            if (query.length) {
                url += `?${query}`;
            }

            // Check if we can use this link
            const canOpen = await Linking.canOpenURL(url);

            if (!canOpen) {
                throw new Error('Poskytnutý odkaz není možné otevřít na tomto zařízení.');
            }
            // Open the email client
            await Linking.openURL(url);

            // Show success message
            Alert.alert(
                "Připraveno k odeslání",
                `Emailový klient byl otevřen s předvyplněnou zprávou pro útulek ${shelterName}. Dokončete odeslání ve své emailové aplikaci.`,
                [{text: "OK"}]
            );
        } catch (error) {
            console.error('Failed to open email client:', error);
            Alert.alert(
                "Chyba",
                "Nepodařilo se otevřít emailový klient. Zkuste to prosím znovu později nebo kontaktujte útulek přímo.",
                [{text: "OK"}]
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ParallaxScrollView
            className="bg-primary h-screen"
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#000" }}
            headerImage={<></>}
        >
            <BackButton/>

            <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>

                <CustomTextInput label="Jméno a příjmení" value={userName} onChangeText={setUserName} placeholder="Celé jméno" containerClassName="pt-10 px-4" inputClassName="text-white mt-8" keyboardType="default" autoCapitalize="words" />

                <CustomTextInput
                    label="Váš email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    containerClassName="pt-10 px-4"
                    inputClassName="text-white mt-8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <CustomTextArea label="Zpráva" value={petText} onChangeText={setPetText} placeholder="Napiš nám něco . . ." maxCharacters={500} containerClassName="pt-10 px-4" inputClassName="text-white mt-8"/>

                <ThemedView className="w-full bg-primary pt-10 px-4">
                    <SubmitButton title={loading ? "ODESÍLÁM..." : "ODESLAT ZPRÁVU"} handlePress={sendEmail} buttonColorKey="secondary"/>
                </ThemedView>
            </Animated.ScrollView>
        </ParallaxScrollView>
    );
};

export default UpdateAccount;
