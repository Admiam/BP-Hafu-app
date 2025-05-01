import React from "react";
import { TextInput, TextInputProps, StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

interface CustomTextInputProps extends TextInputProps {
    label?: string;
    containerClassName?: string;
    inputClassName?: string;
    className?: string;
    isOnDrop?: boolean;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
                                                    label,
                                                    containerClassName,
                                                    inputClassName,
                                                    placeholder,
                                                    value,
                                                    keyboardType,
                                                    onChangeText, autoCapitalize, isOnDrop,
                                                    ...props
                                               }) => {
    return (
        <ThemedView className={containerClassName}>
            {label && (<ThemedText type="title">{label}</ThemedText>)}
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                style={styles.input}
                className={inputClassName}
                keyboardType={keyboardType}
                autoCorrect={false}
                autoCapitalize={autoCapitalize}
                selectTextOnFocus={false}
                maxLength={100}
                {...props}
            />
        </ThemedView>
    );
};

const styles = StyleSheet.create({

    input: {
        height: 40,
        fontSize: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#828693',
    },
});

export default CustomTextInput;
