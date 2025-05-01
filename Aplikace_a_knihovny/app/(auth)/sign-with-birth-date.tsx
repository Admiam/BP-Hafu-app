import React, { useState } from "react";
import {Platform, StyleSheet, Alert} from "react-native";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import { router } from "expo-router";
import BackButton from "@/components/buttons/BackButton";
import {useRegistration} from "@/app/context/RegistrationContext";
import CustomDateInput from "@/components/forms/CustomDateInput";
import {
    validateUserBirthDate,
    validateUserDate
} from "@/utils/validation";

const SignWithBirthDateForm: React.FC = () => {
    // Pull out the "birthDate" from context, plus the setter method
    const { setBirthDate } = useRegistration();

    // iOS DateTimePicker local state
    const [iosDate, setIosDate] = useState(new Date());

    // Android local states for day, month, year
    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Called when iOS DateTimePicker changes
    const onChangeIos = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === "set" && selectedDate) {
            setIosDate(selectedDate);
        }
    };

    const handleSubmit = () => {


        if (Platform.OS === "ios"){
            const birth = validateUserBirthDate(iosDate);
            if (birth) {
                setErrors({dateErr: birth});
                Alert.alert("Neplatný datum narození", birth);
                return;
            }
        }else{
            const birth = validateUserDate(day, month, year);
            if (birth) {
                setErrors({dateErr: birth});
                Alert.alert("Neplatný datum narození", birth);
                return;
            }
        }


        setIsSubmitting(true);

        let finalDate: string;

        if (Platform.OS === "ios") {
            // Format the iOS date (YYYY-MM-DD)
            finalDate = format(iosDate, "yyyy-MM-dd");
        } else {
            // Combine day, month, year from local states
            const d = parseInt(day, 10) || 1;
            const m = parseInt(month, 10) - 1 || 0; // zero-based
            const y = parseInt(year, 10) || 2000;

            // Construct a real Date, then format
            const constructed = new Date(y, m, d);
            finalDate = format(constructed, "yyyy-MM-dd");
        }

        // 2) Save to context
        setBirthDate(finalDate);
        // console.log("Birth date stored in context:", finalDate);

        // 3) Navigate to next screen
        router.push("/sign-with-password");
    };

    return (
        <ParallaxScrollView
            className="bg-primary h-screen"
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#000" }}
            headerImage={<></>}
        >
            <BackButton />
            <CustomDateInput label="Zadejte své datum narození" platform={Platform.OS} iosDate={iosDate} onChangeIos={onChangeIos} day={day} setDay={setDay} month={month} setMonth={setMonth} year={year} setYear={setYear} containerClassName="pt-10 px-4" inputClassName="text-white mt-8"/>
            {renderError('dateErr')}

            <ThemedView className="absolute bottom-10 w-full bg-primary p-4">
                <SubmitButton title="POTVRDIT"
                              handlePress={handleSubmit}
                              buttonColorKey="secondary"
                />
            </ThemedView>
        </ParallaxScrollView>
    );
};

export default SignWithBirthDateForm;
