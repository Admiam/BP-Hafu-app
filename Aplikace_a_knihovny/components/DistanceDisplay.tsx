import React, { useEffect, useState } from "react";
import { PetsDocument } from "@/lib/appwrite";
import { LocationObject } from "expo-location";
import {fetchDistance} from "@/utils/distanceUtils";
import {ThemedText} from "@/components/ThemedText";
import Entypo from "@expo/vector-icons/Entypo";
import {ThemedView} from "@/components/ThemedView";
import {useColorScheme} from "@/hooks/useColorScheme";

interface DistanceDisplayProps {
    pet: PetsDocument;
    location: LocationObject | null;
}

const DistanceDisplay: React.FC<DistanceDisplayProps> = ({ pet, location }) => {
    const [distance, setDistance] = useState<string>("");
    const colorScheme = useColorScheme();

    useEffect(() => {
        if (location && pet) {
            fetchDistance(pet, location)
                .then((d) => setDistance(d))
                .catch((err) => {
                    console.error("Error calculating distance:", err);
                    setDistance("0");
                });
        }
    }, [pet, location]);

    if (!distance) return null;
    return (
        <ThemedView className="flex-row">
            <Entypo name="location-pin" size={16} color={colorScheme === 'dark' ? 'white' : 'black'}/>
            <ThemedText className="text-sm font-medium ml-1">{distance}</ThemedText>
        </ThemedView>
    );
};

export default DistanceDisplay;
