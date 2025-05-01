import ParallaxScrollView from '@/components/ParallaxScrollView';
import TopBar from "@/components/navigation/TopBar";
import React, {useEffect, useState} from "react";
import {
    getCurrentUserFormCollection, getImageByPetID,
    getPetsByShelterID,
    PetsDocument, PetsDocumentNavigation,
    UserDocument
} from "@/lib/appwrite";
import {DrawerActions, NavigationProp, RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import {SubmitButton} from "@/components/buttons/SubmitButton";
import {Dimensions, FlatList, StyleSheet} from "react-native";
import {ThemedText} from "@/components/ThemedText";
import {calculateMonthsFromBirthdate} from "@/utils/dateUtils";
import {ThemedView} from "@/components/ThemedView";
import {
    DrawerParamList,
    FilterCriteria,
    RootStackParamList,
} from "@/components/navigation/navigation";
import * as Location from "expo-location";
import smallCard from "@/components/cards/SmallCard";


const PetManagementScreen = () => {
    const [pets, setPets] = useState<PetsDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<UserDocument | null>(null);
    const [petImages, setPetImages] = useState<Record<string, string>>({});
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<DrawerParamList, 'PetManagement'>>();
    const filter = route.params?.filter as FilterCriteria | undefined;

    useEffect(() => {
        async function fetchUser() {
            const user = await getCurrentUserFormCollection();
            setCurrentUser(user);
        }
        fetchUser();
    }, []); //fetch user on mount
    useEffect(() => {
        async function fetchPets() {
            try {
                const allPets = await getPetsByShelterID();
                if (!allPets) return;

                // @ts-ignore
                let availablePets:PetsDocumentNavigation[] = allPets

                if (filter) {
                    availablePets = availablePets.filter((pet) => {

                        if (filter.selectedBreeds && filter.selectedBreeds.length) {
                            // Turn the pet’s breed field into an array of plain IDs/strings
                            const petBreedIds: string[] = Array.isArray(pet.breed)
                                ? pet.breed.map(b => (typeof b === "string" ? b : b.$id))
                                : typeof pet.breed === "string"
                                    ? [pet.breed]
                                    : [pet.breed.$id];

                            // keep the pet if there is ANY overlap
                            const hasMatch = petBreedIds.some(id => filter.selectedBreeds!.includes(id));

                            if (!hasMatch) return false;
                        }


                        if (filter.type && pet.type.type !== filter.type && filter.type !== "all") {
                            return false;
                        }


                        // Apply gender filter
                        if (filter.gender && filter.gender !== "all" && pet.gender.toString() !== filter.gender) {
                            return false;
                        }



                        // Apply age filter
                        if (filter.ageNumber !== undefined && filter.ageNumber !== 0) {
                            const petAgeInMonths = calculateMonthsFromBirthdate(pet.birth_date);
                            const filterAgeInMonths = filter.isMonth ? filter.ageNumber : filter.ageNumber * 12;

                            if (petAgeInMonths > filterAgeInMonths) {
                                return false;
                            }
                        }

                        // @ts-ignore
                        if (filter.size && filter.size !== "" && pet.size.$id !== filter.size) {
                            return false;
                        }

                        // Apply health filters
                        if (filter.vaccination !== undefined && pet.vaccination !== filter.vaccination) {
                            return false;
                        }

                        if (filter.deworming !== undefined && pet.deworming !== filter.deworming) {
                            return false;
                        }

                        if (filter.chipping !== undefined && pet.chipping !== filter.chipping) {
                            return false;
                        }

                        if (filter.castration !== undefined && pet.castration !== filter.castration) {
                            return false;
                        }

                        if (filter.handicap !== undefined && pet.handicap !== filter.handicap) {
                            return false;
                        }

                        return true;
                    });
                }

                // @ts-ignore
                setPets(availablePets);
            } catch (error) {
                console.error("Error fetching pets:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchPets();
    }, []); //fetch pets on mount
    useEffect(() => {
        async function loadPetImages() {
            if (pets.length > 0) {
                const imagePromises = pets.map(async (pet) => {
                    try {
                        const imageData = await getImageByPetID(pet.$id);
                        return {petId: pet.$id, imageUrl: imageData[0].fileUrl || ''};
                    } catch (error) {
                        console.error(`Error loading image for pet ${pet.$id}:`, error);
                        return {petId: pet.$id, imageUrl: ''};
                    }
                });

                const results = await Promise.all(imagePromises);
                const imagesMap = results.reduce((acc, {petId, imageUrl}) => {
                    if (typeof imageUrl === "string") {
                        acc[petId] = imageUrl;
                    }
                    return acc;
                }, {} as Record<string, string>);

                setPetImages(imagesMap);
            }
        }

        loadPetImages();
    }, [pets]); //load pet images when pets change
    useEffect(() => {
        async function getCurrentLocation() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        }
        getCurrentLocation();
    }, []); // Get current location on mount


    const handleSubmit = async () => {
        navigation.navigate('Modals', {
            screen: 'RegisterPet',
        });
    }

    const onOptions = () => {
        navigation.navigate('Modals', {
            screen: 'Filter',
            params: { pet: pets, navigateTo: "PetManagement"},
        });
    };
    function onMenu() {
        navigation.dispatch(DrawerActions.openDrawer());
    }

    const navigateToDetail = (pet: PetsDocument, image: string) => {
        navigation.navigate('Modals', {
            screen: 'ShelterPetDetail',
            params: {
                pet: pet,
                image: image
            },
        });
    };


    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
            headerImage={<></>}
        >
            <TopBar
                title="Hafu"
                isShelter={currentUser?.is_shelter}
                leftIcon={{
                    library: "MaterialIcons",
                    name: "menu",
                    onPress: onMenu,
                }}
                rightIcon={{
                    library: "Ionicons",
                    name: "options",
                    onPress: onOptions,
                }}
            />
            <ThemedView className="mx-4">
                <SubmitButton title="PŘIDAT MAZLÍKA"
                              handlePress={handleSubmit}
                              buttonColorKey="secondary"
                />
            </ThemedView>

            <ThemedView className="flex mt-4">
                <FlatList
                    data={pets}
                    keyExtractor={(item) => item.$id}
                    renderItem={({ item }) =>
                        smallCard({
                            item,
                            petImages,
                            location,       // the current location from your state
                            navigateToDetail,
                        })
                    }
                    numColumns={numColumns}
                    contentContainerStyle={styles.gridList}
                    ListEmptyComponent={() => <ThemedText>Nic tu není</ThemedText>}

                />
            </ThemedView>

        </ParallaxScrollView>
    )
} //

export default PetManagementScreen;

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