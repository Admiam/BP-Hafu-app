// CustomTextArea.tsx
import React, { useState } from "react";
import { TextInput, TextInputProps, StyleSheet} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import {Colors} from "@/constants/Colors";
import {useColorScheme} from "@/hooks/useColorScheme";

export interface CustomTextAreaProps extends TextInputProps {
    label?: string;
    containerClassName?: string;
    inputClassName?: string;
    maxCharacters?: number;
    className?: string;
}

const CustomTextArea: React.FC<CustomTextAreaProps> = ({
                                                           label,
                                                           containerClassName,
                                                           inputClassName,
                                                           maxCharacters,
                                                           value,
                                                           onChangeText,
                                                           placeholder,
                                                           ...props
                                                       }) => {
    const theme = useColorScheme() ?? "light";
    const [charCount, setCharCount] = useState(0);

    const handleChangeText = (text: string) => {
        setCharCount(text.length);
        if (onChangeText) {
            onChangeText(text);
        }
    };

    return (
        <ThemedView className={containerClassName}>
            <ThemedText type="title">{label}</ThemedText>
            <ThemedView style={styles.textAreaContainer}>
                <TextInput
                    value={value}
                    onChangeText={handleChangeText}
                    placeholder={placeholder}
                    multiline
                    className={inputClassName}
                    style={[styles.input, {backgroundColor:
                            theme === "light"
                                ? Colors.light.buttonSecondary
                                : Colors.dark.buttonSecondary,}]}
                    textAlignVertical="top" // ensures text starts at the top
                    {...props}
                />
                <ThemedText style={styles.counter}>
                    {charCount}/{maxCharacters}
                </ThemedText>
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    label: {
        marginBottom: 4,
        fontSize: 16,
        fontWeight: "600",
    },
    textAreaContainer: {
        position: "relative",
    },
    input: {
        height: 150, // adjust height as needed
        fontSize: 16,
        borderWidth: 1,
        padding: 10,
        borderRadius: 4,
    },
    counter: {
        position: "absolute",
        bottom: 4,
        right: 10,
        fontSize: 12,
        color: "#828693",
    },
});

export default CustomTextArea;
