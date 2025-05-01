import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import {useColorScheme} from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";


interface ThreeOptionToggleProps {
    label?: string;
    option1Label: string;
    option1Value: string;
    option2Label: string;
    option2Value: string;
    option3Label: string;
    option3Value: string;
    selectedValue: string;
    onChange: (newValue: string) => void;
    containerClassName?: string;
    inputClassName?: string;
}

const ThreeOptionToggle: React.FC<ThreeOptionToggleProps> = ({
                                                             label,
                                                             option1Label,
                                                             option1Value,
                                                             option2Label,
                                                             option2Value,
                                                                option3Label,
                                                                option3Value,
                                                             selectedValue,
                                                             onChange,
                                                             containerClassName,
                                                             inputClassName,
                                                         }) => {
    // highlight whichever button is selectedValue
    const theme = useColorScheme();

    return (
        <ThemedView className={containerClassName}>
            {label && <ThemedText  type="title">{label}</ThemedText>}

            <ThemedView className={inputClassName}>
                {/* Button 1 */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        selectedValue === option1Value ? {borderColor: theme == 'light' ? Colors.light.buttonPrimary : Colors.dark.buttonPrimary} : {borderColor: theme == 'light' ? Colors.light.buttonThird : Colors.dark.buttonThird},
                        {backgroundColor: theme == 'light' ? Colors.light.buttonPrimary : Colors.dark.buttonSecondary}
                    ]}
                    className="mr-4"

                    onPress={() => onChange(option1Value)}
                >
                    <ThemedText style={[selectedValue === option1Value ? {color: theme == 'light' ? Colors.light.buttonPrimary : Colors.dark.buttonPrimary} : {color: theme == 'light' ? Colors.light.buttonThird : Colors.dark.buttonThird}, styles.buttonText]}>
                        {option1Label}
                    </ThemedText>
                </TouchableOpacity>

                {/* Button 2 */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        selectedValue === option2Value ? {borderColor: theme == 'light' ? Colors.light.buttonPrimary : Colors.dark.buttonPrimary} : {borderColor: theme == 'light' ? Colors.light.buttonThird : Colors.dark.buttonThird},
                        {backgroundColor: theme == 'light' ? Colors.light.buttonPrimary : Colors.dark.buttonSecondary}
                    ]}
                    className="mr-4"
                    onPress={() => onChange(option2Value)}
                >
                    <ThemedText style={[selectedValue === option2Value ? {color: theme == 'light' ? Colors.light.buttonPrimary : Colors.dark.buttonPrimary} : styles.textUnselected, styles.buttonText]}>
                        {option2Label}
                    </ThemedText>
                </TouchableOpacity>
                {/* Button 3 */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        selectedValue === option3Value ? {borderColor: theme == 'light' ? Colors.light.buttonPrimary : Colors.dark.buttonPrimary} : {borderColor: theme == 'light' ? Colors.light.buttonThird : Colors.dark.buttonThird},
                        {backgroundColor: theme == 'light' ? Colors.light.buttonPrimary : Colors.dark.buttonSecondary}
                    ]}
                    onPress={() => onChange(option3Value)}
                >
                    <ThemedText style={[selectedValue === option3Value ? {color: theme == 'light' ? Colors.light.buttonPrimary : Colors.dark.buttonPrimary} : styles.textUnselected, styles.buttonText]}>
                        {option3Label}
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </ThemedView>
    );
};

export default ThreeOptionToggle;

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonUnselected: {
        backgroundColor: "#ddd",
    },
    textSelected: {
        color: "#fff",
    },
    textUnselected: {
        color: "#333",
    },
});
