import React, { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import BackButton from "@/components/buttons/BackButton";
import { ThemedView } from "@/components/ThemedView";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import CustomPasswordInput from "@/components/forms/CustomPasswordInput";
import { useRegistration } from "@/app/context/RegistrationContext";
import { signIn } from "@/lib/appwrite";
import {ThemedText} from "@/components/ThemedText";
import {validateEmail, validateRequired} from "@/utils/validation";

// Login form screen
const LoginForm: React.FC = () => {
    const router = useRouter();
    const { email, setEmail } = useRegistration(); // Get email from registration context

    // Form state
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Renders error message for a given field if it exists
    const renderError = (field: string) => {
        if (errors[field]) {
            return (
                <ThemedText className="text-red-500 px-20 text-sm">
                    {errors[field]}
                </ThemedText>
            );
        }
        return null;
    };

    // Handles login submission logic
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrors({});

        const emailError = validateEmail(email);
        const passwordError = validateRequired(password, "Heslo");

        // Validate email input
        if (emailError) {
            setErrors({emailErr: emailError});
            Alert.alert("Neplatný email", emailError);
            return;
        }

        // Validate password input
        if (passwordError) {
            setErrors({passwordErr: passwordError});
            Alert.alert("Prosím vyplňte heslo");
            return;
        }

        try {
            // Attempt sign in via Appwrite
            const session = await signIn(email, password);
            if (session) {
                router.push("/home"); // Redirect to home on success
            } else {
                setErrors({passwordErr: "Neplatné přihlašovací údaje."});
                Alert.alert("Chyba", "Neplatné přihlašovací údaje.");
            }
        } catch (error: any) {
            console.error("Error signing in:", error);
        }
    };

    return (
        <ParallaxScrollView
            className="bg-primary h-screen"
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#000" }}
            headerImage={<></>}
        >
            {/* Back navigation */}
            <BackButton />

            {/* Password input field */}
            <ThemedView className="w-full h-full flex pt-10 px-4">
                <CustomPasswordInput
                    label="Heslo"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Vaše heslo"
                    containerClassName="pt-10 px-20"
                    inputClassName="text-white mt-8"
                />
                {renderError('passwordErr')}
            </ThemedView>

            {/* Submit button at bottom of screen */}
            <ThemedView className="absolute bottom-10 w-full bg-primary p-4">
                <SubmitButton
                    title="PŘIHLÁSIT SE"
                    handlePress={handleSubmit}
                    buttonColorKey="secondary"
                />
            </ThemedView>
        </ParallaxScrollView>
    );
};

export default LoginForm;
