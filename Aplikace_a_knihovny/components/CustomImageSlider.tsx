import React, { useState } from 'react';
import { Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import {LinearGradient} from "expo-linear-gradient";
import {Colors} from "@/constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {useColorScheme} from "@/hooks/useColorScheme";

type CustomImageSliderProps = {
    images: { fileUrl: string }[];
};

const CustomImageSlider: React.FC<CustomImageSliderProps> = ({ images }) => {

    const [currentIndex, setCurrentIndex] = useState(0);
    const theme = useColorScheme() ?? 'light';

    const goToNext = () => {
        if (currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (!images || images.length === 0) {
        return <ThemedText>No images available</ThemedText>;
    }

    return (
        <ThemedView className="w-full" style={styles.container}>
            <Image source={{ uri: images[currentIndex].fileUrl }} style={styles.image} />
            <LinearGradient
                colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.navButtonGradientLeft}
            >
                <TouchableOpacity
                    onPress={goToPrevious}
                    style={[styles.navButton, styles.leftButton, currentIndex === 0 && styles.disabledButton]}
                    disabled={currentIndex === 0}
                >
                    <Text style={[styles.navText, currentIndex === 0 && { opacity: 0 }]}>
                        <MaterialIcons name="keyboard-arrow-left" size={34} style={{ color: theme === 'light' ? Colors.light.text : Colors.dark.text }}
                    /></Text>
                </TouchableOpacity>
            </LinearGradient>
            <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.navButtonGradientRight}
            >
                <TouchableOpacity
                    onPress={goToNext}
                    style={[styles.navButton, styles.rightButton, currentIndex === images.length - 1 && styles.disabledButton]}
                    disabled={currentIndex === images.length - 1}
                >
                    <Text style={[styles.navText, currentIndex === images.length - 1 && { opacity: 0 }]}>
                        <MaterialIcons name="keyboard-arrow-right" size={34} style={{ color: theme === 'light' ? Colors.light.text : Colors.dark.text }}></MaterialIcons>
                    </Text>
                </TouchableOpacity>
            </LinearGradient>

        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        height: 500,
    },
    image: {
        width: '100%',
        height: 500,
        backgroundColor: '#eee',
        zIndex: 1,
    },
    navButton: {
        position: 'absolute',
        width: '30%',
        height: 500,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    leftButton: {
        left: 0,
    },
    rightButton: {
        right: 0,
    },
    navText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        opacity: 0.7,

    },
    disabledButton: {
        backgroundColor: 'rgba(0,0,0,0)',
    },
    navButtonGradientLeft: {
        position: 'absolute',
        left: 0,
        width: '50%',
        height: 500,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    navButtonGradientRight: {
        position: 'absolute',
        right: 0,
        width: '50%',
        height: 500,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    }
});

export default CustomImageSlider;
