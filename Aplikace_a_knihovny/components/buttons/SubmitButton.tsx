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

export type ThemeColorKey = keyof typeof Colors.light;

export interface SubmitButtonProps extends ViewProps {
    title: string;
    handlePress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    buttonColorKey?: ThemeColorKey;
    buttonColorOverride?: string;
    textColorKey?: ThemeColorKey;
    textColorOverride?: string;
    className?: string;
}

export function SubmitButton({
                                    title,
                                    handlePress,
                                    isLoading = false,
                                    disabled = false,
                                    buttonColorKey,
                                    buttonColorOverride,
                                    textColorKey,
                                    textColorOverride,
                                    className,
                                    ...otherProps
                                }: SubmitButtonProps) {
    const theme = useColorScheme();

    // 1) Determine final button background color
    const fallbackButtonKey = buttonColorKey ?? "buttonColor";
    // @ts-ignore
    const themeButtonColor = Colors[theme][fallbackButtonKey];
    const finalButtonColor = buttonColorOverride || themeButtonColor;

    // 2) Determine final text color
    const fallbackTextKey = textColorKey ?? "buttonText";
    // @ts-ignore
    const themeTextColor = Colors[theme][fallbackTextKey];
    const finalTextColor = textColorOverride || themeTextColor;

    return (
        <ThemedView {...otherProps}>
            <TouchableOpacity
                style={[
                    styles.button,
                    {
                        backgroundColor: finalButtonColor,
                        opacity: disabled || isLoading ? 0.5 : 1,
                    },
                ]}
                onPress={handlePress}
                disabled={isLoading || disabled}
                activeOpacity={0.7}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={[styles.buttonText, { color: finalTextColor }]}>
                        {title}
                    </Text>
                )}
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    button: {
        width: "100%",
        marginTop: 10,
        paddingVertical: 14,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
});
