import React from "react";
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    View,
    ViewProps,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import {ThemedView} from "@/components/ThemedView";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";


export interface IvisibleButtonProps extends ViewProps {
    handlePress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    buttonColorOverride?: string;
    textColorOverride?: string;
    className?: string;
    buttonText: string;
    isVisible: boolean;
}

export function InvisibleButton({
                                 handlePress,
                                 isLoading = false,
                                 disabled = false,
                                 buttonColorOverride,
                                 textColorOverride,
                                 className, buttonText, isVisible,
                                 ...otherProps
                             }: IvisibleButtonProps) {
    const colorScheme = useColorScheme();

    return (
        <ThemedView {...otherProps}>
            <TouchableOpacity
                style={[
                    styles.button,
                    {
                        backgroundColor: colorScheme === 'dark' ? Colors.dark.descriptionBg : Colors.light.descriptionBg,
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
                        { isVisible ? (
                            <MaterialCommunityIcons name="eye-off" className="mb-2" size={24} color={colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText} />
                        ):(
                            <MaterialCommunityIcons name="eye" className="mb-2" size={24} color={colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText} />
                        )}
                        <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText }]}>
                            {buttonText}
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
