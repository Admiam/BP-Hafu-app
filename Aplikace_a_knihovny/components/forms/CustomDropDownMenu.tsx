import React, { useState } from "react";
import {
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";

export interface DropdownItem {
    label: string;
    value: string;
}

export interface CustomDropDownMenuProps {
    label?: string;
    value: string;
    onValueChange: (value: string) => void;
    data: DropdownItem[];
    containerClassName: string;
    inputClassName: string;
    className?: string;
}
const MAX_VISIBLE_ITEMS = 5;
const ITEM_HEIGHT = 48;

const CustomDropDownMenu: React.FC<CustomDropDownMenuProps> = ({
                                                                   label,
                                                                   value,
                                                                   onValueChange,
                                                                   data,
                                                                   containerClassName,
                                                                   inputClassName,
                                                                   ...props
                                                               }) => {
    const [open, setOpen] = useState(false);
    const theme = useColorScheme() ?? "light";

    const toggleDropdown = () => setOpen((prev) => !prev);

    const handleSelect = (selectedValue: string) => {
        onValueChange(selectedValue);
        setOpen(false);
    };

    // Find the label for the current value
    const selectedLabel =
        data.find((item) => item.value === value)?.label || "Vyber možnost";

    const dropdownMaxHeight = Math.min(data.length, MAX_VISIBLE_ITEMS) * ITEM_HEIGHT;

    return (
        <ThemedView className={containerClassName}>
            <ThemedText type="title">{label}</ThemedText>
            <TouchableOpacity
                onPress={toggleDropdown}
                className={inputClassName}
                style={styles.inputContainer}
            >
                <ThemedText
                    style={{
                        color:
                            theme === "light"
                                ? Colors.light.buttonSecondary
                                : Colors.dark.icon,
                    }}
                >
                    {selectedLabel}
                </ThemedText>
                <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color={
                        theme === "light"
                            ? Colors.light.buttonSecondary
                            : Colors.dark.icon
                    }
                    style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
                />
            </TouchableOpacity>
            {open && (
                <ThemedView
                    style={[
                        styles.optionsContainer,
                        {
                            backgroundColor:
                                theme === "light"
                                    ? Colors.light.buttonSecondary
                                    : Colors.dark.buttonSecondary,
                        },
                    ]}
                >
                    <ScrollView
                        style={{ maxHeight: dropdownMaxHeight }}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={data.length > MAX_VISIBLE_ITEMS}
                    >
                        {data.map((item) => (
                            <TouchableOpacity
                                key={item.value}
                                onPress={() => handleSelect(item.value)}
                                style={[
                                    styles.option,
                                    {
                                        borderBottomColor:
                                            theme === "light"
                                                ? Colors.light.buttonTextSecondary
                                                : Colors.dark.buttonTextSecondary,
                                    },
                                ]}
                            >
                                <ThemedText>{item.label}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                </ThemedView>
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 40,
        borderBottomWidth: 2,
        borderBottomColor: "#828693",
    },
    optionsContainer: {
        marginTop: 4,
        marginBottom: 10,
    },
    option: {
        padding: 10,
        borderBottomWidth: 1,
    },
});

export default CustomDropDownMenu;
