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
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";


export interface EditButtonProps extends ViewProps {
    handlePress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    buttonColorOverride?: string;
    textColorOverride?: string;
    className?: string;
}

export function EditButton({
                                 handlePress,
                                 isLoading = false,
                                 disabled = false,
                                 buttonColorOverride,
                                 textColorOverride,
                                 className,
                                 ...otherProps
                             }: EditButtonProps) {
    const colorScheme = useColorScheme();

    return (
        <ThemedView {...otherProps}>
            <TouchableOpacity
                style={[
                    styles.button,
                    {
                        backgroundColor: colorScheme === 'dark' ? Colors.dark.descriptionBg : Colors.light.descriptionBg,
                        opacity: disabled || isLoading ? 0.5 : 1,
                        borderColor: colorScheme === 'dark' ? Colors.dark.buttonPrimary : Colors.light.buttonPrimary,
                    },
                ]}

                onPress={handlePress}
                disabled={isLoading || disabled}
                activeOpacity={0.7}
                className="rounded-xl border-2"
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <ThemedView className="flex-row space-x-2 items-center">
                        <FontAwesome6 name="edit" className="mb-2" size={22} color={colorScheme === 'dark' ? Colors.dark.buttonPrimary : Colors.light.buttonPrimary} />
                        <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? Colors.dark.buttonPrimary : Colors.light.buttonPrimary }]}>
                            UPRAVIT
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
