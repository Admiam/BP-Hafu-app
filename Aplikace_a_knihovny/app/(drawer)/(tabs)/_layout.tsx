import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import HomeScreen from "@/app/(drawer)/(tabs)/home";
import ExploreScreen from "@/app/(drawer)/(tabs)/explore";
import MatchesScreen from "@/app/(drawer)/(tabs)/matches";
import AccountScreen from "@/app/(drawer)/(tabs)/account";


const Tab = createBottomTabNavigator();

export default function TabLayout() {
    // Detect current color scheme (light/dark)
    const colorScheme = useColorScheme();

    return (
        <>
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                    headerShown: false,
                    tabBarShowLabel: false,
                }}
            >
                <Tab.Screen
                    name="home"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <MaterialCommunityIcons name={focused ? 'cards' : 'cards-outline'} size={24} color={color} />
                        ),
                    }}
                    component={HomeScreen}
                />
                <Tab.Screen
                    name="explore"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <MaterialCommunityIcons name={focused ? 'view-grid' : 'view-grid-outline'} size={24} color={color} />
                        ),
                    }}
                    component={ExploreScreen}
                />
                <Tab.Screen
                    name="matches"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <MaterialCommunityIcons name={focused ? 'cards-heart' : 'cards-heart-outline'} size={24} color={color} />
                        ),
                    }}
                    component={MatchesScreen}
                />
                <Tab.Screen
                    name="account"
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <MaterialCommunityIcons name={focused ? 'account' : 'account-outline'} size={24} color={color} />
                        ),
                    }}
                    component={AccountScreen}
                />
            </Tab.Navigator>
    </>

);
}
