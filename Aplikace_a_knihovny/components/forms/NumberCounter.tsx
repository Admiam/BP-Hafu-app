// NumberCounter.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface NumberCounterProps {
    label?: string;
    value: number;
    onChange: (newValue: number) => void;
    containerClassName?: string;
    buttonClassName?: string;
    textClassName?: string;
    min?: number;
    max?: number;
}

const NumberCounter: React.FC<NumberCounterProps> = ({
                                                         label,
                                                         value,
                                                         onChange,
                                                         containerClassName,
                                                         buttonClassName,
                                                         textClassName,
                                                         min = -Infinity,
                                                         max = Infinity,
                                                     }) => {
    const theme = useColorScheme();

    return (
        <ThemedView className={containerClassName}>
            {label && <ThemedText type="title">{label}</ThemedText>}
            <ThemedView style={styles.counterContainer} className={buttonClassName}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            borderColor:
                                theme === 'light'
                                    ? Colors.light.buttonPrimary
                                    : Colors.dark.buttonPrimary,
                            backgroundColor:
                                theme === 'light'
                                    ? Colors.light.buttonPrimary
                                    : Colors.dark.buttonSecondary,
                        },
                    ]}
                    onPress={() => {
                        if (value > min) {
                            onChange(value - 1);
                        }
                    }}
                >
                    <ThemedText style={styles.buttonText}>-</ThemedText>
                </TouchableOpacity>
                <ThemedText className={textClassName} style={styles.valueText}>
                    {value}
                </ThemedText>
                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            borderColor:
                                theme === 'light'
                                    ? Colors.light.buttonPrimary
                                    : Colors.dark.buttonPrimary,
                            backgroundColor:
                                theme === 'light'
                                    ? Colors.light.buttonPrimary
                                    : Colors.dark.buttonSecondary,
                        },
                    ]}
                    onPress={() => {
                        if (value < max) {
                            onChange(value + 1);
                        }
                    }}
                >
                    <ThemedText style={styles.buttonText}>+</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    valueText: {
        marginHorizontal: 16,
        fontSize: 18,
        fontWeight: '600',
    },
});

export default NumberCounter;
