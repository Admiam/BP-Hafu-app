// src/navigation/DrawerNavigator.tsx
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "@/app/(drawer)/(tabs)/home";
import PetManagementScreen from "@/app/(drawer)/PetManagement";

const Drawer = createDrawerNavigator();

const SideBar: React.FC = () => {
    return (
        <Drawer.Navigator initialRouteName="home">
            <Drawer.Screen name="home" component={HomeScreen} />
            <Drawer.Screen name="petManagement" component={PetManagementScreen} />
        </Drawer.Navigator>
    );
};

export default SideBar;
