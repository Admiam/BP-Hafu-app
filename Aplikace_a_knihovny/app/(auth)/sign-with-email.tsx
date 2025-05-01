import React, {useState} from "react";
import {Alert} from "react-native";
import {router} from "expo-router";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import BackButton from "@/components/buttons/BackButton";
import CustomTextInput from "@/components/forms/CustomTextInput";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import { ThemedView } from "@/components/ThemedView";
import { useRegistration } from "@/app/context/RegistrationContext";
import {emailExists} from "@/lib/appwrite";
import {validateEmail} from "@/utils/validation";
import {ThemedText} from "@/components/ThemedText";

export default function SignWithEmailForm() {
    // Get and set email from registration context
    const { email, setEmail } = useRegistration();
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Show validation error
    const renderError = (field: string) => {
        if (errors[field]) {
            return (
                <ThemedText className="text-red-500 px-4 text-sm">
                    {errors[field]}
                </ThemedText>
            );
        }
        return null;
    };

    // Handle email submission
    const handleEmailSubmit = async () => {
        try {
            setErrors({});

            const emailError = validateEmail(email);

            if (emailError) {
                setErrors({emailErr: emailError});
                Alert.alert("Neplatný email", emailError);
                return;
            }

            setIsSubmitting(true);

            // Check if email already exists
            const exists = await emailExists(email);
            if (exists) {
                router.replace("/login"); // redirect to login screen if email exists
            } else {
                // Continue with registration
                router.push("/sign-with-name");
            }
        } catch (error: any) {
            console.error("Error checking email:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ParallaxScrollView
            className="bg-primary h-screen"
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#000" }}
            headerImage={<></>}
        >
            <BackButton />
            <CustomTextInput
                label="Můj email"
                value={email}
                onChangeText={(text) => {
                    setEmail(text);
                }}
                placeholder="Váš email"
                containerClassName="w-full h-full flex pt-10 px-4"
                inputClassName={`text-white mt-8 ${errors ? 'border-red-500' : ''}`}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <ThemedView className="absolute bottom-10 w-full bg-primary p-4">

                <SubmitButton
                    title={isSubmitting ? "OVĚŘUJI..." : "POTVRDIT"}
                    handlePress={handleEmailSubmit}
                    buttonColorKey="secondary"
                    disabled={isSubmitting}
                />
            </ThemedView>
        </ParallaxScrollView>
    );
};
