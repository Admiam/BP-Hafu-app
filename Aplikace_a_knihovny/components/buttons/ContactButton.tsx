import React from "react";
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    ViewProps,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import {ThemedView} from "@/components/ThemedView";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export interface ReportButtonProps extends ViewProps {
    handlePress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    buttonColorOverride?: string;
    textColorOverride?: string;
    className?: string;
}

export function ContactButton({
                                 handlePress,
                                 isLoading = false,
                                 disabled = false,
                                 buttonColorOverride,
                                 textColorOverride,
                                 className,
                                 ...otherProps
                             }: ReportButtonProps) {
    const colorScheme = useColorScheme();

    return (
        <ThemedView {...otherProps}>
            <TouchableOpacity
                style={[
                    styles.button,
                    {
                        backgroundColor: colorScheme === 'dark' ? Colors.dark.buttonPrimary : Colors.light.buttonPrimary,
                        opacity: disabled || isLoading ? 0.5 : 1,
                    },
                ]}

                onPress={handlePress}
                disabled={isLoading || disabled}
                activeOpacity={0.7}
                className="rounded-xl"
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <ThemedView className="flex-row space-x-2 items-center">
                        <FontAwesome name="send" className="mb-2" size={24} color={colorScheme === 'dark' ? "black" : "black"} />
                        <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? "black" : "black" }]}>
                            KONTAKTOVAT
                        </Text>
                    </ThemedView>
                )}
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    button: {
        width: "100%",
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
});
