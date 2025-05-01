import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {useColorScheme} from "@/hooks/useColorScheme";
import {Colors} from "@/constants/Colors";

const BackButton: React.FC = () => {
    const router = useRouter();
    const theme = useColorScheme() ?? 'light';

    return (
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <MaterialIcons name="keyboard-arrow-left" size={34}
                           style={{ color: theme === 'light' ? Colors.light.text : Colors.dark.text }}
            />
        </TouchableOpacity>
    );
};

export default BackButton;
