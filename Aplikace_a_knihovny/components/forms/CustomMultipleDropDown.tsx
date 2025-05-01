import React, { useState, useEffect } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import Checkbox from 'expo-checkbox';
import {ThemedText} from "@/components/ThemedText";
import {ThemedView} from "@/components/ThemedView";
import {Colors} from "@/constants/Colors";
import {useColorScheme} from "@/hooks/useColorScheme";
import {MaterialIcons} from "@expo/vector-icons";

export interface DropdownItem {
    label: string;
    value: string;
}

type DropdownProps = {
    label: string;
    data: DropdownItem[];
    value: DropdownItem | DropdownItem[] | string | string[]
    onValueChange: (value: DropdownItem | DropdownItem[]) => void;
    onCrossbreedChange: (value: boolean) => void;
    inputClassName?: string;
    containerClassName?: string;
    crossbreed?: string;

};

const MAX_VISIBLE_ITEMS = 5;
const ITEM_HEIGHT = 48;

const CustomMultipleDropdownMenu: React.FC<DropdownProps> = ({ label, data, value, onValueChange, onCrossbreedChange,inputClassName, containerClassName, crossbreed }) => {
    const [isCrossbreed, setIsCrossbreed] = useState<boolean>(crossbreed === 'true');
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const [selectedBreeds, setSelectedBreeds] = useState<{ label: string; value: string }[]>([]);

    const theme = useColorScheme() ?? "light";
    const dropdownMaxHeight = Math.min(data.length, MAX_VISIBLE_ITEMS) * ITEM_HEIGHT;

    useEffect(() => {
        if (Array.isArray(value)) {
            if (value.length > 0 && typeof value[0] === "string") {
                // value is string[]
                setSelectedBreeds(value as DropdownItem[]);
                setIsCrossbreed(value.length > 1);
            } else {
                // value is {label, value}[]
                setSelectedBreeds(value as DropdownItem[]);
                setIsCrossbreed(value.length > 1);
            }
        } else if (value && typeof value === 'object' && 'label' in value && 'value' in value) {
            // value is a single {label, value} object
            setSelectedBreeds([value]);
            setIsCrossbreed(false);
        } else if (typeof value === 'string') {
            setSelectedBreeds(value ? [{ label: value, value }] : []);
            setIsCrossbreed(false);
        } else {
            setSelectedBreeds([]);
            setIsCrossbreed(false);
        }
    }, [value]);



    // Handler for toggling the Crossbreed checkbox
    const toggleCrossbreed = (newValue: boolean) => {
        setIsCrossbreed(newValue);
        if (!newValue) {
            // If Crossbreed is turned off, ensure only one breed remains selected
            if (selectedBreeds.length > 1) {
                const singleBreed = selectedBreeds[0];  // keep the first selected breed
                setSelectedBreeds([singleBreed]);
                onValueChange(singleBreed);             // notify parent with single DropdownItem
                onCrossbreedChange(false)
            }
        }
        // If turning on Crossbreed, allow multiple selections (no immediate change to selection)
    };

    // Handler for selecting a breed from the dropdown
    const onSelectBreed = (breedLabel: string, breedValue: string) => {
        const breedObj = { label: breedLabel, value: breedValue };
        if (isCrossbreed) {
            // Multi-select mode: toggle selection of this breed
            const alreadySelected = selectedBreeds.some(b => b.value === breedValue);
            let newSelection;
            if (alreadySelected) {
                // If already selected, remove it
                newSelection = selectedBreeds.filter(b => b.value !== breedValue);
            } else {
                // Add breed if less than 3 already selected
                if (selectedBreeds.length < 3) {
                    newSelection = [...selectedBreeds, breedObj];
                } else {
                    newSelection = selectedBreeds; // Don't add more than 3
                }
            }
            setSelectedBreeds(newSelection);
            onValueChange(newSelection);
            onCrossbreedChange(isCrossbreed);
        } else {
            // Single-select mode: select the breed and close dropdown
            setSelectedBreeds([breedObj]);
            onValueChange(breedObj);
            onCrossbreedChange(isCrossbreed);
            setDropdownOpen(false);  // close after single selection
        }
    };

    // Handler for removing a selected breed (when 'X' pressed on a chip)
    const removeBreed = (breedValue: string) => {
        const newSelection = selectedBreeds.filter(b => b.value !== breedValue);
        setSelectedBreeds(newSelection);
        if (!isCrossbreed) {
            onValueChange(newSelection[0] || null);
        } else {
            onValueChange(newSelection);
        }
        onCrossbreedChange(isCrossbreed);
    };

    // Display text for the dropdown button
    const renderDropdownText = () => {
        if (isCrossbreed) {
            if (selectedBreeds.length === 0) return 'Vyber více plemen max 3 ...';
            if (selectedBreeds.length === 1) return selectedBreeds[0].label;
            // If multiple selected, show a summary (e.g., "2 breeds selected")
            return `${selectedBreeds.length} vybráno plemen`;
        } else {
            // Single-select mode
            return selectedBreeds[0]?.label || 'Vyber plemeno...';
        }
    };

    return (
        <ThemedView className={containerClassName}>
            {/* Label for the dropdown field */}
            {label ? <ThemedText type="title">{label}</ThemedText> : null}



            {/* Dropdown header (press to open/close list) */}
            <TouchableOpacity
                style={styles.inputContainer}
                activeOpacity={0.7}
                onPress={() => setDropdownOpen(prev => !prev)}
                className={inputClassName}
            >
                <Text style={styles.dropdownHeaderText}>{renderDropdownText()}</Text>
                <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color={
                        theme === "light"
                            ? Colors.light.buttonSecondary
                            : Colors.dark.icon
                    }
                    style={{ transform: [{ rotate: dropdownOpen ? "180deg" : "0deg" }] }}
                />
            </TouchableOpacity>

            {/* Dropdown options list */}
            {dropdownOpen && (
                <ThemedView style={[
                    styles.optionsContainer,
                    {
                        backgroundColor:
                            theme === "light"
                                ? Colors.light.buttonSecondary
                                : Colors.dark.buttonSecondary,
                    },
                ]}>
                    <ScrollView
                        style={{ maxHeight: dropdownMaxHeight }}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={data.length > MAX_VISIBLE_ITEMS}
                    >
                    {data.map((breed) => (
                        <TouchableOpacity
                            key={breed.value}
                            style={[
                                styles.option,
                                {
                                    borderBottomColor:
                                        theme === "light"
                                            ? Colors.light.buttonTextSecondary
                                            : Colors.dark.buttonTextSecondary,
                                },
                            ]}
                            onPress={() => onSelectBreed(breed.label, breed.value)}
                        >
                            <ThemedText
                                style={[
                                    selectedBreeds.some(selected => selected.value === breed.value)
                                    && {color: theme === "light"
                                    ? Colors.light.buttonPrimary
                                    : Colors.dark.buttonPrimary, fontWeight: 'bold'}
                            ]}
                            >
                                {breed.label}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                    </ScrollView>

                </ThemedView>
            )}

            {/* Display selected breeds as chips (only in crossbreed mode or if multiple selected) */}
            {selectedBreeds.length > 1 && (
                <View style={styles.chipsContainer}>
                    {selectedBreeds.map(breed => (
                        <View key={breed.value} style={[styles.chip, {borderColor: theme === "light"
                                ? Colors.light.buttonPrimary
                                : Colors.dark.buttonPrimary, borderWidth: 2, backgroundColor: theme === "light"
                                ? Colors.light.buttonSecondary
                                : Colors.dark.buttonSecondary}]}>
                            <Text style={[styles.chipText, {color: theme === "light"
                                    ? Colors.light.buttonPrimary
                                    : Colors.dark.buttonPrimary}]}>{breed.label}</Text>
                            <TouchableOpacity onPress={() => removeBreed(breed.value)}>
                                <Text style={[styles.removeChip, {color: theme === "light"
                                        ? Colors.light.buttonPrimary
                                        : Colors.dark.buttonPrimary}]}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
            {/* Crossbreed toggle */}
            <ThemedView  className="flex-row items-center gap-1 mt-2">
                <Checkbox value={isCrossbreed} onValueChange={toggleCrossbreed} color={theme === "light"
                    ? Colors.light.buttonPrimary
                    : Colors.dark.buttonPrimary} />
                <Text style={{color:
                        theme === "light"
                            ? Colors.light.buttonTextSecondary
                            : Colors.dark.buttonTextSecondary}}>Kříženec</Text>
            </ThemedView>
        </ThemedView>
    );
};

export default CustomMultipleDropdownMenu;

// Example styles for a modern UI look (adjust to match existing CustomDropDownMenu style)
const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 8,
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
        color: '#333',
        fontWeight: '600',
    },
    crossbreedLabel: {
        marginLeft: 4,
        fontSize: 14,
        color: '#333',
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 40,
        borderBottomWidth: 2,
        borderBottomColor: "#828693",
        // paddingHorizontal: 8,
    },
    dropdownHeaderText: {
        fontSize: 14,
        color: '#555',
    },
    dropdownArrow: {
        fontSize: 16,
        color: '#555',
    },
    optionsContainer: {
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 4,
        backgroundColor: '#fff',
        marginTop: 4,
        // You might want to set a maxHeight and make it scrollable if many options:
        // maxHeight: 150,
        // overflow: 'hidden',
    },
    optionItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    optionText: {
        fontSize: 14,
        color: '#333',
    },
    optionTextSelected: {
        fontWeight: '600',
        color: '#000',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginRight: 6,
        marginBottom: 6,
    },
    chipText: {
        fontSize: 13,
        marginRight: 4,
    },
    removeChip: {
        fontSize: 16,
    },
    option: {
        padding: 10,
        borderBottomWidth: 1,
    },
});
