import React from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
} from "react-native";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";

interface CustomDateInputProps extends TextInputProps {
    label?: string;
    iosDate?: Date;
    onChangeIos?: (event: DateTimePickerEvent, selectedDate?: Date) => void;
    day?: string;
    setDay?: (text: string) => void;
    month?: string;
    setMonth?: (text: string) => void;
    year?: string;
    setYear?: (text: string) => void;
    platform: "ios" | "android" | "windows" | "macos" | "web";
    containerClassName?: string;
    inputClassName?: string;
}

const CustomDateInput: React.FC<CustomDateInputProps> = ({
                                                                       label,
                                                                       iosDate,
                                                                       onChangeIos,
                                                                       day,
                                                                       setDay,
                                                                       month,
                                                                       setMonth,
                                                                       year,
                                                                       setYear,
                                                                       platform,
                                                                       containerClassName,
                                                                       inputClassName,
                                                                   }) => {
    return (
        <ThemedView className={containerClassName}>
            <ThemedText type="title">{label}</ThemedText>

            {platform === "ios" ? (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={iosDate ?? new Date()} // fallback if iosDate is undefined
                    mode="date"
                    display="spinner"
                    onChange={onChangeIos}
                    className={inputClassName}
                />
            ) : (
                <ThemedView className={inputClassName} style={styles.inputRow}>
                    <TextInput
                        value={day}
                        onChangeText={setDay}
                        placeholder="DD"
                        style={styles.input}
                        keyboardType="number-pad"
                        maxLength={2}
                    />
                    <Text style={styles.separator}>/</Text>
                    <TextInput
                        value={month}
                        onChangeText={setMonth}
                        placeholder="MM"
                        style={styles.input}
                        keyboardType="number-pad"
                        maxLength={2}
                    />
                    <Text style={styles.separator}>/</Text>
                    <TextInput
                        value={year}
                        onChangeText={setYear}
                        placeholder="YYYY"
                        style={[styles.input, styles.yearInput]}
                        keyboardType="number-pad"
                        maxLength={4}
                    />
                </ThemedView>
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: "#fff",
        color: "#fff",
        textAlign: "center",
        fontSize: 18,
        paddingVertical: 4,
        marginHorizontal: 4,
        width: 50,
    },
    yearInput: {
        width: 80,
    },
    separator: {
        color: "#fff",
        fontSize: 24,
        marginHorizontal: 2,
    },
});

export default CustomDateInput;
