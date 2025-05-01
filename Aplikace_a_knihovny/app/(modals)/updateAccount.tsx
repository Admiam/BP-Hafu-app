import React, {useState} from "react";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import BackButton from "@/components/buttons/BackButton";
import CustomTextInput from "@/components/forms/CustomTextInput";
import Animated, {
    useAnimatedRef,
} from 'react-native-reanimated';
import {
    updateUserEmail,
    updateUserName,
    updateUserPassword
} from "@/lib/appwrite";
import {Alert} from "react-native";
import {RouteProp, useRoute} from "@react-navigation/native";
import {ModalStackParamList} from "@/components/navigation/navigation";
import CustomPasswordInput from "@/components/forms/CustomPasswordInput";
import {
    calculatePasswordStrength,
    validateName,
    validateEmail,
    validatePassword,
    validatePasswordConfirmation
} from "@/utils/validation";
import { ThemedText } from "@/components/ThemedText";

const UpdateAccount: React.FC = () => {
    const route = useRoute<RouteProp<ModalStackParamList, 'UpdateAccount'>>();
    const {user} = route.params;

    // Form state
    const [firstName, setFirstName] = useState(user?.first_name || "");
    const [lastName, setLastName] = useState(user?.last_name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [oldPassword, setOldPassword] = useState("");
    const [oldPasswordTwo, setOldPasswordTwo] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [validateNewPassword, setValidateNewPassword] = useState("");

    // Add the missing errors state
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const scrollRef = useAnimatedRef<Animated.ScrollView>();

    // Render error message helper function
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

    // Function to handle the update of the name
    const handleUpdateName = async () => {
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

            // Proceed with update if validation passes
            await updateUserName(firstName, lastName, user.$id);

            Alert.alert("Úspěch", "Vaše jméno bylo úspěšně aktualizováno.", [
                { text: "OK" }
            ]);
        } catch (error) {
            console.error("Error updating name:", error);
            Alert.alert("Chyba", "Nepodařilo se aktualizovat jméno. Zkuste to prosím znovu.");
        }
    };

    // Function to handle the update of the email
    const handleUpdateEmail = async () => {
        try {
            // Clear previous errors
            setErrors({});

            // Validate email
            const emailError = validateEmail(email);

            if (emailError) {
                setErrors({ email: emailError });
                Alert.alert("Chyba", "Zadejte platnou emailovou adresu.");
                return;
            }

            // Check if email has changed
            const isEmailChanged = email.trim() !== user?.email;

            if (!isEmailChanged) {
                Alert.alert("Informace", "Email se nezměnil.");
                return;
            }

            // For email change, password is required
            if (!oldPassword.trim()) {
                setErrors({ oldPassword: "Pro změnu emailu je potřeba zadat současné heslo." });
                Alert.alert("Chyba", "Pro změnu emailu je potřeba zadat současné heslo.");
                return;
            }

            // Proceed with update if validation passes
            await updateUserEmail(email, oldPassword, user.$id);

            Alert.alert("Úspěch", "Váš email byl úspěšně aktualizován.", [
                { text: "OK" }
            ]);

            // Clear password field for security
            setOldPassword("");
        } catch (error) {
            console.error("Error updating email:", error);

            if (error instanceof Error) {
                if (error.message.includes("Invalid credentials")) {
                    setErrors({ oldPassword: "Nesprávné heslo." });
                    Alert.alert("Chyba", "Zadané heslo není správné.");
                } else {
                    Alert.alert("Chyba", "Nepodařilo se aktualizovat email. Zkuste to prosím znovu.");
                }
            } else {
                Alert.alert("Chyba", "Nepodařilo se aktualizovat email. Zkuste to prosím znovu.");
            }
        }
    };

    // Function to handle the update of the password
    const handleUpdatePassword = async () => {
        try {
            setIsSubmitting(true);

            // Clear previous errors
            setErrors({});

            // Validate password fields
            const validationErrors: Record<string, string | null> = {};

            // Validate current password
            if (!oldPasswordTwo.trim()) {
                validationErrors.oldPasswordTwo = "Současné heslo je povinné";
            }

            // Validate new password
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
                console.log("Chyba", `Formulář obsahuje následující chyby:\n${errorMessages}`);
                return;
            }

            // Proceed with update if validation passes
            await updateUserPassword(newPassword, oldPasswordTwo);

            Alert.alert("Úspěch", "Vaše heslo bylo úspěšně aktualizováno.");

            // Clear password fields for security
            setOldPasswordTwo("");
            setNewPassword("");
            setValidateNewPassword("");

        } catch (error) {
            console.error("Error updating email:", error);

            if (error instanceof Error) {
                if (error.message.includes("Invalid credentials")) {
                    setErrors({ oldPasswordTwo: "Nesprávné heslo." });
                    Alert.alert("Chyba", "Zadané heslo není správné.");
                } else {
                    Alert.alert("Chyba", "Nepodařilo se aktualizovat email. Zkuste to prosím znovu.");
                }
            } else {
                Alert.alert("Chyba", "Nepodařilo se aktualizovat email. Zkuste to prosím znovu.");
            }
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
            <BackButton/>

            <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
                {/* Name update section */}
                <CustomTextInput
                    label="Jméno a příjmení"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Jméno"
                    containerClassName="pt-10 px-4"
                    inputClassName={`text-white mt-8 ${errors.firstName ? 'border-red-500' : ''}`}
                    keyboardType="default"
                    autoCapitalize="words"
                />
                {renderError('firstName')}

                <CustomTextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Příjmení"
                    containerClassName="pt-10 px-4"
                    inputClassName={`text-white ${errors.lastName ? 'border-red-500' : ''}`}
                    keyboardType="default"
                    autoCapitalize="words"
                />
                {renderError('lastName')}

                <ThemedView className="w-full bg-primary pt-10 px-4">
                    <SubmitButton
                        title="ULOŽIT"
                        handlePress={handleUpdateName}
                        buttonColorKey="secondary"
                    />
                </ThemedView>

                {/* Email update section */}
                <CustomTextInput
                    label="Změna emailu"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    containerClassName="pt-10 px-4"
                    inputClassName={`text-white mt-8 ${errors.email ? 'border-red-500' : ''}`}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                {renderError('email')}

                <CustomPasswordInput
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    placeholder="Staré heslo"
                    containerClassName="pt-10 px-4"
                    inputClassName={`text-white mt-8 ${errors.oldPassword ? 'border-red-500' : ''}`}
                />
                {renderError('oldPassword')}

                <ThemedView className="w-full bg-primary pt-10 px-4">
                    <SubmitButton
                        title="ULOŽIT"
                        handlePress={handleUpdateEmail}
                        buttonColorKey="secondary"
                    />
                </ThemedView>

                {/* Password update section */}
                <CustomPasswordInput
                    value={oldPasswordTwo}
                    onChangeText={setOldPasswordTwo}
                    placeholder="Staré heslo"
                    containerClassName="pt-10 px-4"
                    inputClassName={`text-white mt-8 ${errors.oldPasswordTwo ? 'border-red-500' : ''}`}
                />
                {renderError('oldPasswordTwo')}

                <CustomPasswordInput
                    label="Nové heslo"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Nové heslo"
                    containerClassName="pt-10 px-4"
                    inputClassName={`text-white mt-8 ${errors.newPassword ? 'border-red-500' : ''}`}
                />
                {newPassword && (
                    <ThemedView className={`h-2 mx-4 mt-2 rounded-full ${
                        calculatePasswordStrength(newPassword) === 'weak' ? 'bg-red-500' :
                            calculatePasswordStrength(newPassword) === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                )}
                {renderError('newPassword')}

                <CustomPasswordInput
                    label="Potvrzení hesla"
                    value={validateNewPassword}
                    onChangeText={setValidateNewPassword}
                    placeholder="Potvrzení hesla"
                    containerClassName="pt-10 px-4"
                    inputClassName={`text-white mt-8 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {renderError('confirmPassword')}

                <ThemedView className="w-full bg-primary pt-10 px-4">
                    <SubmitButton
                        title={isSubmitting ? "UKLÁDÁM..." : "POTVRDIT"}
                        handlePress={handleUpdatePassword}
                        buttonColorKey="secondary"
                        disabled={isSubmitting}
                    />
                </ThemedView>
            </Animated.ScrollView>
        </ParallaxScrollView>
    );
};

export default UpdateAccount;
