import React, { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import BackButton from "@/components/buttons/BackButton";
import { ThemedView } from "@/components/ThemedView";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import CustomPasswordInput from "@/components/forms/CustomPasswordInput";
import { useRegistration, validateRegistrationData } from "@/app/context/RegistrationContext";
import { registerUser} from '@/lib/appwrite'
import {ThemedText} from "@/components/ThemedText";
import {calculatePasswordStrength, validatePassword, validatePasswordConfirmation} from "@/utils/validation";

const SignWithPasswordForm: React.FC = () => {
    const router = useRouter();

    const { isShelter, email, firstName, lastName, birthDate, setPassword, resetRegistration } = useRegistration();
    const [newPassword, setNewPassword] = useState("");
    const [validateNewPassword, setValidateNewPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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



    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrors({});

        const validationErrors: Record<string, string | null> = {};

        if (newPassword.trim()) {
            const passwordResult = validatePassword(newPassword);
            if (!passwordResult.isValid) {
                validationErrors.newPassword = passwordResult.errors[0];
            }

            // Validate password confirmation
            const confirmError = validatePasswordConfirmation(newPassword, validateNewPassword);
            if (confirmError) {
                validationErrors.confirmPassword = confirmError;
            }
        } else {
            validationErrors.newPassword = "Nové heslo je povinné";
        }

        // If there are validation errors, show them and stop
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);

            const errorMessages = Object.values(validationErrors).filter(v => v).join("\n");
            Alert.alert("Chyba", `Formulář obsahuje následující chyby:\n${errorMessages}`);
            return;
        }

        const errors: string[] = validateRegistrationData({
            email,
            firstName,
            lastName,
            birthDate,
            password: newPassword,
            isShelter,
        });
        if (errors.length > 0) {
            console.error("Chyba", errors.join("\n"))
            return;
        }

        try {
            setPassword(newPassword);

            await registerUser({email: email, password: newPassword, firstName: firstName, lastName: lastName, birthDate: birthDate, isShelter: isShelter});

            resetRegistration();

            if(isShelter){
                router.push("/register-shelter");

            }else{
                router.push("/home");

            }
        } catch (error) {
            console.error("Error registering user:", error);
            Alert.alert("Chyba", "Nepodařilo se vytvořit uživatele.");
        }
    };

    return (
        <ParallaxScrollView
            className="bg-primary h-screen"
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#000" }}
            headerImage={<></>}
        >
            <BackButton />
            <CustomPasswordInput
                label="Moje heslo"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Vaše heslo"
                containerClassName=" pt-10 px-20"
                inputClassName="text-white mt-8"
            />
            {newPassword && (
                <ThemedView className={`h-2 mx-20 mt-2 rounded-full ${
                    calculatePasswordStrength(newPassword) === 'weak' ? 'bg-red-500' :
                        calculatePasswordStrength(newPassword) === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
            )}
            {renderError('newPassword')}

            <CustomPasswordInput
                label="Potvrzení hesla"
                value={validateNewPassword}
                onChangeText={setValidateNewPassword}
                placeholder="Opakujte heslo"
                containerClassName="pt-10 px-20"
                inputClassName="text-white mt-8"
            />
            {renderError('confirmPassword')}

            <ThemedView className="absolute bottom-10 w-full bg-primary p-4">
                <SubmitButton title="POTVRDIT"
                              handlePress={handleSubmit}
                              buttonColorKey="secondary"
                />
            </ThemedView>
        </ParallaxScrollView>
    );
};

export default SignWithPasswordForm;
