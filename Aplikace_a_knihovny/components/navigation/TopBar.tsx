import React from "react";
import { TouchableOpacity} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from '@/constants/Colors';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export interface TopBarIconConfig {
    library?: "MaterialIcons" | "Ionicons" | "FontAwesome" | "FontAwesome5" | "FontAwesome6"; // Extend if needed
    name: string;
    size?: number;
    color?: string;
    onPress: () => void;
}
export type IconLibrary = "MaterialIcons" | "Ionicons" | "FontAwesome" | "FontAwesome5" | "FontAwesome6";

export interface TopBarProps {
    title: string;
    leftIcon?: TopBarIconConfig;
    rightIcon?: TopBarIconConfig;
    isShelter: boolean | undefined;

}

export const IconComponents: Record<IconLibrary, React.ComponentType<any>> = {
    MaterialIcons,
    Ionicons,
    FontAwesome,
    FontAwesome5,
    FontAwesome6,
};

export const TopBar: React.FC<TopBarProps> = ({
                                                  title,
                                                  leftIcon,
                                                  rightIcon,
                                                  isShelter,
                                              }) => {
    const colorScheme = useColorScheme();
    return (
        <ThemedView
            className="w-full flex flex-row justify-between items-center py-2 px-4"
        >
            {leftIcon && isShelter ? (
                <TouchableOpacity onPress={leftIcon.onPress}>
                    {React.createElement(IconComponents[leftIcon.library || "MaterialIcons"], {
                        name: leftIcon.name,
                        size: leftIcon.size || 35,
                        color: leftIcon.color || (colorScheme === "dark" ? "white" : "black"),
                    })}
                </TouchableOpacity>
            ) : (
                <></>
            )}

            <ThemedText type="logo" className="text-2xl font-bold" style={{color: Colors.dark.secondary}}>
                {title}
            </ThemedText>

            {rightIcon ? (
                <TouchableOpacity onPress={rightIcon.onPress}>
                    {React.createElement(IconComponents[rightIcon.library || "Ionicons"], {
                        name: rightIcon.name,
                        size: rightIcon.size || 35,
                        color: rightIcon.color || (colorScheme === "dark" ? "white" : "black"),
                    })}
                </TouchableOpacity>
            ) : (
                <></>
            )}
        </ThemedView>
    );
};

export default TopBar;
