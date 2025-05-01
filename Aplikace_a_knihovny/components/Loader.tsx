import React from "react";
import { ActivityIndicator, Dimensions, Platform, } from "react-native";
import {ThemedView} from "@/components/ThemedView";

interface LoaderProps {
    isLoading: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isLoading }) => {
    const osName = Platform.OS;
    const screenHeight = Dimensions.get("screen").height;

    if (!isLoading) return null;

    return (
        <ThemedView
            className="absolute flex justify-center items-center w-full h-full bg-primary/60 z-10"
            style={{ height: screenHeight }}
        >
            <ActivityIndicator
                animating={isLoading}
                color="#fff"
                size={osName === "ios" ? "large" : 50}
            />
        </ThemedView>
    );
};

export default Loader;
