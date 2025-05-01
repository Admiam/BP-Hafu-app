import React, { useState } from 'react';
import {Alert} from 'react-native';
import {ThemedText} from "@/components/ThemedText";
import {ThemedView} from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import {SubmitButton} from "@/components/buttons/SubmitButton";
import {router} from "expo-router";
import CustomTextInput from "@/components/forms/CustomTextInput";
import BackButton from "@/components/buttons/BackButton";
import {useRegistration} from "@/app/context/RegistrationContext";
import {validateName} from "@/utils/validation";

const SignWithNameForm: React.FC = () => {
    const {firstName, setFirstName} = useRegistration();
    const {lastName, setLastName} = useRegistration();
    const [errors, setErrors] = useState<Record<string, string | null>>({});

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


    const handleSetName = async () => {
        try {
            // Clear previous errors
            setErrors({});

            // Validate name fields
            const firstNameError = validateName(firstName, "Jméno");
            const lastNameError = validateName(lastName, "Příjmení");

            // If there are validation errors, show them and stop
            if (firstNameError || lastNameError) {
                setErrors({
                    firstName: firstNameError,
                    lastName: lastNameError
                });

                Alert.alert("Chyba", "Formulář obsahuje chyby. Opravte je prosím a zkuste to znovu.");
                return;
            }

            router.push("/sign-with-birth-date")

        } catch (error) {
            console.error("Error updating name:", error);
            Alert.alert("Chyba", "Nepodařilo se aktualizovat jméno. Zkuste to prosím znovu.");
        }
    };

    return (
        <ParallaxScrollView className="bg-primary h-screen"
                            headerBackgroundColor={{ light: "#D0D0D0", dark: "#000" }}
                            headerImage={<></>}
        >
            <BackButton />
            <CustomTextInput label="Moje jméno" value={firstName} onChangeText={setFirstName} placeholder="Vaše jméno" containerClassName="pt-10 px-20" inputClassName="text-white mt-8" keyboardType="default" autoCapitalize="words" />
            {renderError('firstName')}
            <CustomTextInput label="Příjmení" value={lastName} onChangeText={setLastName} placeholder="Vaše příjmení" containerClassName="pt-10 px-20" inputClassName="text-white mt-8" keyboardType="default" autoCapitalize="words" />
            {renderError('lastName')}

            <ThemedView className="absolute bottom-10 w-full bg-primary p-4">
                <SubmitButton
                    title="POTVRDIT"
                    handlePress={handleSetName}
                    buttonColorKey="secondary"
                />

            </ThemedView>
        </ParallaxScrollView>
    );
};


export default SignWithNameForm;
