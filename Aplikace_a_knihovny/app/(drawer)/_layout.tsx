import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabLayout from "@/app/(drawer)/(tabs)/_layout";
import PetManagementScreen from "@/app/(drawer)/PetManagement";
import ShelterProfileScreen from "@/app/(drawer)/ShelterProfile";


const Drawer = createDrawerNavigator();

const DrawerLayout: React.FC = () => {
    return (
        <Drawer.Navigator
            screenOptions={{ headerShown: false,     drawerActiveTintColor: '#31eded',
            }}
        >
            <Drawer.Screen name="(tabs)" component={TabLayout} options={{ drawerLabel: "Home" }} />
            <Drawer.Screen name="PetManagement" component={PetManagementScreen} options={{ drawerLabel: "Inzerce mazlíků",}} />
            <Drawer.Screen name="ShleterProfile" component={ShelterProfileScreen} options={{ drawerLabel: "Profil" }} />
        </Drawer.Navigator>
    );
};

export default DrawerLayout;
