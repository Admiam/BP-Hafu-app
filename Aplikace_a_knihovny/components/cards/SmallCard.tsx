import {PetsDocument} from "@/lib/appwrite";
import {Dimensions, Image, StyleSheet, TouchableOpacity} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";
import {getShortDateString} from "@/utils/dateUtils";
import DistanceDisplay from "@/components/DistanceDisplay";
import React from "react";
import {LocationObject} from "expo-location";

interface RenderPetItemProps {
    item: PetsDocument;
    petImages: Record<string, string>;
    location: LocationObject | null;
    navigateToDetail: (pet: PetsDocument, image: string) => void;
}

const SmallCard = ({ item, petImages, location, navigateToDetail }: RenderPetItemProps) => (
    <TouchableOpacity style={styles.petItem} onPress={() => navigateToDetail(item, petImages[item.$id])}>
        <Image
            source={{uri: petImages[item.$id] || "https://thumbs.dreamstime.com/b/cat-staring-camera-pink-question-mark-behind-generative-ai-concept-curiosity-wonder-as-seems-to-be-316341455.jpg"}}
            style={styles.petImage}/>
        <LinearGradient
            colors={["transparent", "rgba(0, 0, 0, 0.88)"]}
            style={[StyleSheet.absoluteFillObject, styles.gradientOverlay]}
        />
        <ThemedView className="left-1 bottom-1 w-full flex-col absolute">
            <ThemedText className="text font-semibold">{item.name}</ThemedText>
            <ThemedView className="flex-row justify-between w-full pr-2">
                <ThemedText className=" text-sm font-medium">{getShortDateString(item.birth_date)}</ThemedText>
                {location && (
                    <DistanceDisplay pet={item} location={location}/>
                )}
            </ThemedView>
        </ThemedView>
    </TouchableOpacity>
);

export default SmallCard;

const screenWidth = Dimensions.get("window").width;
const numColumns = screenWidth > 600 ? 3 : 2;
const itemWidth = screenWidth / numColumns - 32;

const styles = StyleSheet.create({
    gridList: {
        marginLeft: 10,
    },
    petItem: {
        width: itemWidth,
        margin: 10,
    },
    petImage: {
        width: itemWidth,
        height: itemWidth,
        borderRadius: 10,
    },
    gradientOverlay: {
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        top: 33,
    },
});