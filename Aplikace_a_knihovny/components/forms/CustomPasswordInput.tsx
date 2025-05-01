import React, { useState } from "react";
import { TextInput, TextInputProps, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface CustomPasswordInputProps extends TextInputProps {
    label?: string;
    containerClassName?: string;
    inputClassName: string;
    className?: string;
}

const CustomPasswordInput: React.FC<CustomPasswordInputProps> = ({
                                                                     label = "Moje heslo",
                                                                     containerClassName,
                                                                     inputClassName,
                                                                     placeholder = "Vaše heslo",
                                                                     value,
                                                                     onChangeText,
                                                                     autoCapitalize = "none",
                                                                     ...props
                                                                 }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <ThemedView className={containerClassName}>
            {label && <ThemedText type="title">{label}</ThemedText>}
            <View style={styles.inputRow}>
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={!isPasswordVisible}
                    className={inputClassName}
                    style={styles.input}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={false}
                    maxLength={100}
                    {...props}
                />
                <TouchableOpacity
                    onPress={() => setIsPasswordVisible((prev) => !prev)}
                    style={styles.iconContainer}
                >
                    <MaterialIcons
                        name={isPasswordVisible ? "visibility" : "visibility-off"}
                        size={24}
                        color="#fff"
                    />
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "#828693",
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 16,
        // color: "#828693",
        paddingVertical: 4,

    },
    iconContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        paddingTop: 40,

    },
});

export default CustomPasswordInput;
