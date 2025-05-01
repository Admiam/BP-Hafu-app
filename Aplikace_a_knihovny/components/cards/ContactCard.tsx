import {PetsDocument} from "@/lib/appwrite";
import {Dimensions, Image, StyleSheet, TouchableOpacity} from "react-native";
import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";
import {getShortDateString} from "@/utils/dateUtils";
import DistanceDisplay from "@/components/DistanceDisplay";
import React from "react";
import {LocationObject} from "expo-location";
import {Colors} from "@/constants/Colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface RenderPetItemProps {
    item: PetsDocument;
    petImages: Record<string, string>;
    location: LocationObject | null;
    navigateToDetail: (pet: PetsDocument, image: string) => void;
    navigateToContact: (pet: PetsDocument) => void;
    colorScheme: string | null | undefined ;
}

const ContactCard = ({ item, petImages, location, navigateToDetail, navigateToContact, colorScheme }: RenderPetItemProps) => {
    return (
        <ThemedView className="w-full flex-row justify-between items-center px-4 mb-3">

            <TouchableOpacity className=" flex-row flex-grow space-x-2"
                              onPress={() => navigateToDetail(item, petImages[item.$id])}>

                <Image
                    source={{uri: petImages[item.$id] || "https://thumbs.dreamstime.com/b/cat-staring-camera-pink-question-mark-behind-generative-ai-concept-curiosity-wonder-as-seems-to-be-316341455.jpg"}}
                    style={styles.petImage}/>

                <ThemedView className="flex-col justify-between py-3">
                    <ThemedText className="text font-semibold">{item.name}</ThemedText>
                    <ThemedView className="flex-row">
                        <MaterialCommunityIcons name="clock-outline" size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
                        <ThemedText className="text-sm font-medium ml-1">{getShortDateString(item.birth_date)}</ThemedText>
                    </ThemedView>
                    {location && (
                        <DistanceDisplay pet={item} location={location}/>
                    )}
                </ThemedView>

            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigateToContact(item)}>
                <FontAwesome name="send" className="" size={35} color={Colors.dark.buttonPrimary} />
            </TouchableOpacity>
        </ThemedView>
    );
}

export default ContactCard;

const styles = StyleSheet.create({
    gridList: {
        marginLeft: 10,
    },
    petImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    gradientOverlay: {
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        top: 33,
    },
});