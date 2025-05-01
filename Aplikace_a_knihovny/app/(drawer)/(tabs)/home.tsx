import React, {useCallback, useEffect, useState} from "react";
import {ActivityIndicator, Alert, Text} from "react-native";
import {
    runOnJS,
    useAnimatedReaction,
    useSharedValue
} from "react-native-reanimated";
import {Stack, useFocusEffect} from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import Card from "@/components/cards/Card";
import TopBar from "@/components/navigation/TopBar";
import {
    createPetAction,
    getCurrentUserFormCollection,
    getImageByPetID, getLikedPets, getPetByID, getPets,
    PetsDocument, PetsDocumentNavigation,
    UserDocument, UserPetActionsInput
} from "@/lib/appwrite";
import {
    DrawerActions,
    NavigationProp,
    RouteProp,
    useIsFocused,
    useNavigation,
    useRoute
} from "@react-navigation/native";
import {
    FilterCriteria,
    RootStackParamList,
    TabStackParamList
} from "@/components/navigation/navigation";
import * as Location from "expo-location";
import {calculateMonthsFromBirthdate} from "@/utils/dateUtils";
import {ThemedText} from "@/components/ThemedText";

const HomeScreen = () => {

    const activeIndex = useSharedValue(0);
    const route = useRoute<RouteProp<TabStackParamList, 'home'>>();
    const filter = route.params?.filter as FilterCriteria | undefined;

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const [index, setIndex] = useState(0);
    const [currentUser, setCurrentUser] = useState<UserDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [pets, setPets] = useState<PetsDocument[]>([]);
    const [petImages, setPetImages] = useState<Record<string, string>>({});
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [actions, setActions] = useState<UserPetActionsInput[]>([]);

    const TIMER_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours threshold
    const isFocused = useIsFocused();
    useFocusEffect(
        useCallback(() => {
            // nothing special on focus
            return () => {

                // runs when HomeScreen loses focus
                // @ts-ignore
                navigation.setParams({ filter: undefined });

            };
        }, [navigation])
    );

    useEffect(() => {
        if (isFocused) {

            async function fetchData(){
                setLoading(true);
                try {

                    const user = await getCurrentUserFormCollection();
                    setCurrentUser(user);

                    if (!user) return

                    const [allPets, petActions] = await Promise.all([
                        getPets(),
                        getLikedPets(user.$id),
                    ]);
                    if (!allPets || !petActions) return;

                    const likedPetIds = new Set<string>();
                    const dislikedPetIds = new Set<string>();

                    for (const action of petActions) {
                        let petId = await getPetByID(action.pet.$id);
                        // Only consider actions belonging to the current user.
                        if (typeof action.user !== "string" && action.user.$id === user.$id && petId) {
                            if (action.action === true) {
                                likedPetIds.add(petId.$id);
                            } else if (action.action === false) {
                                // Calculate if the disliked action is old enough.
                                const actionTime = new Date(action.created_at).getTime();
                                if (Date.now() - actionTime > TIMER_THRESHOLD_MS) {
                                    // Pet is disliked but timer has passed so we consider it available.
                                    dislikedPetIds.add(petId.$id);
                                }
                            }
                        }
                    }

                    // @ts-ignore
                    let availablePets:PetsDocumentNavigation[] = allPets.filter((pet) => {
                        if (likedPetIds.has(pet.$id) || !pet.is_visible) return false;
                        return true;
                    });

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

                    let { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        console.error('Permission to access location was denied');
                        return;
                    }
                    let location = await Location.getCurrentPositionAsync({});
                    setLocation(location);
                    // @ts-ignore
                    setPets(availablePets);
                    setActions(petActions);
                } catch (error) {
                    console.error("Error fetching filtered pets:", error);
                } finally {
                    setLoading(false);
                }
            }
            fetchData()
        }
    }, [isFocused]);
    useEffect(() => {
        async function fetchUser() {
            const user = await getCurrentUserFormCollection();
            setCurrentUser(user);
        }
        fetchUser();
    }, []); //fetch user on mount
    useEffect(() => {
        async function fetchLikedPets() {
            try {
                if (!currentUser || !currentUser.$id) return;

                const [allPets, petActions] = await Promise.all([
                    getPets(),
                    getLikedPets(currentUser.$id),
                ]);

                if (!allPets || !petActions) return;

                const likedPetIds = new Set<string>();
                const dislikedPetIds = new Set<string>();

                for (const action of petActions) {
                    let petId = await getPetByID(action.pet.$id);
                    // Only consider actions belonging to the current user.
                    if (typeof action.user !== "string" && action.user.$id === currentUser.$id && petId) {
                        if (action.action === true) {
                            likedPetIds.add(petId.$id);
                        } else if (action.action === false) {
                            // Calculate if the disliked action is old enough.
                            const actionTime = new Date(action.created_at).getTime();
                            if (Date.now() - actionTime > TIMER_THRESHOLD_MS) {
                                // Pet is disliked but timer has passed so we consider it available.
                                dislikedPetIds.add(petId.$id);
                            }
                        }
                    }
                }

                // @ts-ignore
                let availablePets:PetsDocumentNavigation[] = allPets.filter((pet) => {
                    if (likedPetIds.has(pet.$id) || !pet.is_visible) return false;
                    return true;
                });



                if (filter) {
                    availablePets = availablePets.filter((pet) => {

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


                        // Apply size filter
                        if (filter.size && filter.size !== "" && pet.size !== filter.size) {
                            return false;
                        }

                        // Apply crossbreed filter
                        if (filter.crossbreed !== undefined && pet.crossbreed !== filter.crossbreed) {
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
                setActions(petActions);
            } catch (error) {
                console.error("Error fetching filtered pets:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchLikedPets();
    }, [currentUser]);
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

    useAnimatedReaction(
        () => activeIndex.value,
        (value, prevValue) => {
            if (Math.floor(value) !== index) {
                runOnJS(setIndex)(Math.floor(value));
            }
        }
    );

    const onResponse = async (liked: boolean, pet: PetsDocument): Promise<void> => {
        try {
            if (currentUser){
                 await createPetAction({
                    action: liked,
                    created_at: new Date().toISOString(),
                    user: currentUser.$id,
                    pet: pet.$id,
                });
            }

        } catch (error) {
            console.error("Error submitting shelter registration:", error);
            Alert.alert("Chyba", "Nepodařilo se registrovat útulek.");
        }

    };

    const navigateToDetail = (pet: PetsDocument, image: string) => {
        navigation.navigate('Modals', {
                screen: 'PetDetail',
                params: { pet: pet, image: image },
            });
    }

    const onOptions = () => {
        navigation.navigate('Modals', {
            screen: 'Filter',
            params: { pet: pets, navigateTo: "home"},
        });
    };

    const onMenu = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#000" }}
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
                <ThemedView className="mt-4 flex items-center justify-items-start">
                    <Stack.Screen options={{ headerShown: false }} />
                    <Text style={{ top: 70, position: "absolute" }}>Current index: {index}</Text>
                    {loading ? (
                        <ThemedView className="w-full h-full justify-center items-center flex">
                            <ActivityIndicator size="large" color="#64FCD9" />
                            <ThemedText style={{ marginTop: 10 }}>Načítání...</ThemedText>
                        </ThemedView>
                    ) : (
                        pets.map((pet, idx) => (
                            <Card
                                key={`pet-${idx}`}
                                pet={pet}
                                images={petImages[pet.$id]}
                                numOfCards={pets.length}
                                index={idx}
                                activeIndex={activeIndex}
                                onResponse={onResponse}
                                navigateToDetail={navigateToDetail}
                                location={location}
                            />
                        ))
                    )}
                    {pets.length === 0 && (
                        <ThemedText>Nic tu není</ThemedText>
                    )}
                </ThemedView>
        </ParallaxScrollView>
    );
};

export default HomeScreen;
