import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator, Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';
import {useRouter} from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useColorScheme} from "@/hooks/useColorScheme";
import {
    createPetAction, deletePetAction,
    getCurrentUserFormCollection,
    getImageByPetID,
    getImageByShelerID,
    getPetAction,
    UploadedFileInfo,
    UserDocument,
} from "@/lib/appwrite";
import {getDateString} from "@/utils/dateUtils";
import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import {ModalStackParamList, RootStackParamList} from "@/components/navigation/navigation";
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import {getAdoptionFeeString, getFoundDateString, getGenderByType, getSizeString} from "@/utils/dataModifications";
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from '@expo/vector-icons/Feather';
import {Colors} from "@/constants/Colors";
import {StatusBar} from "expo-status-bar";
import {ReportButton} from "@/components/buttons/ReportButton";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {ContactButton} from "@/components/buttons/ContactButton";
import CustomImageSlider from "@/components/CustomImageSlider";

/// Function to convert degrees to radians
interface Coordinates {
    lat: number;
    lng: number;
}

/// Function to convert degrees to radians
function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

/// Function to get coordinates from address using Google Maps Geocoding API
async function getCoordinatesFromAddress(
    street: string,
    postalCode: string,
    city: string,
    country?: string): Promise<Coordinates> {
    const address = `${street}, ${postalCode}, ${city}${country ? `, ${country}` : ''}`;
    const apiKey = 'AIzaSyAVUCvCTBh9l1U0fD1ieE-QAwWpCGw4oqk';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
            lat: location.lat,
            lng: location.lng,
        };
    } else {
        throw new Error('Geocoding error: ' + data.status);
    }
}

/// Function to calculate distance between two coordinates using Haversine formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function PetDetail() {
    const colorScheme = useColorScheme();
    const route = useRoute<RouteProp<ModalStackParamList, 'PetDetail'>>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const router = useRouter();
    const {pet, image} = route.params;
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [petImages, setPetImages] = useState<UploadedFileInfo[]>([]);
    const [shelterImages, setShelterImages] = useState<UploadedFileInfo[]>([]);
    const [distance, setDistance] = useState<number | null>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [breedNames, setBreedNames] = useState<string | null>(null);

    const [currentUser, setCurrentUser] = useState<UserDocument | null>(null);

    useEffect(() => {
        async function fetchUser() {
            const user = await getCurrentUserFormCollection();
            if (user)
                setCurrentUser(user);
        }
        fetchUser();
    }, []); //fetch user on mount
    useEffect(() => {
        async function loadPetImages() {
            if (pet) {
                try {
                    let imageData = await getImageByPetID(pet.$id);

                    setPetImages(
                        imageData.map((img, idx) => ({
                            fileId: img.fileId,
                            fileUrl: img.fileUrl,
                            storageId: img.storageId,
                            slotIndex: idx
                        }))
                    );
                } catch (error) {
                    console.error(`Error loading image for pet ${pet.$id}:`, error);
                    setPetImages([]);
                }
            }
        }

        loadPetImages();
    }, [pet]); // Load pet images when pet changes
    useEffect(() => {
        async function getCurrentLocation() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        }
        getCurrentLocation();
    }, []); // Get current location on mount
    useEffect(() => {
        async function fetchDistance() {
            if (location && pet) {
                try {
                    let petLocation: Coordinates = await getCoordinatesFromAddress(
                        pet.shelter.street,
                        pet.shelter.postalCode,
                        pet.shelter.city,
                        pet.shelter.country
                    );

                    let d = getDistanceFromLatLonInKm(
                        location.coords.latitude,
                        location.coords.longitude,
                        petLocation.lat,
                        petLocation.lng
                    );
                    setDistance(d);
                } catch (error) {
                    console.error("Error calculating distance:", error);
                }
            }
        }
        fetchDistance();
    }, [location, pet]); // Fetch distance when location or pet changes
    useEffect(() => {
        setLoading(true)
        async function loadShelterImages() {
            if (pet.shelter) {
                try {
                    let imageData = await getImageByShelerID(pet.shelter.$id);
                    setShelterImages(
                        imageData.map((img, idx) => ({
                            fileId: img.fileId,
                            fileUrl: img.fileUrl,
                            storageId: img.storageId,
                            slotIndex: idx
                        })))
                } catch (error) {
                    console.error(`Error loading image for pet ${pet.shelter.$id}:`, error);
                    setShelterImages([]);
                }
            }
        }

        loadShelterImages();
        setLoading(false)
    }, []); // Load shelter images when shelter changes
    useEffect(() => {
        async function petActions() {
            if (pet){
                let action = await getPetAction(pet.shelter.owner.$id, pet.$id)
                if (action) {
                    setIsLiked(action.action)
                }
            }
        }
        petActions()
    } ,[])
    useEffect(() => {
        // Suppose 'data' is your array from the API
        const breedNames = pet.breed.map((item: { breed: any; }) => item.breed);
        // You can use setState or any further logic here
        setBreedNames(breedNames);
    }, [pet]);

    const navigateToShelter = (shelterId: string, images: string[]) => {
        navigation.navigate('Modals', {
            screen: 'ShelterDetail',
            params: {
                shelterId: shelterId,
                pet: pet,
                image: images[0]
            },
        });
    }

    const navigateToContact = () => {
        navigation.navigate('Modals', {
            screen: 'ContactShelter',
            params: {
                pet: pet,
            },
        });
    };

    const onResponse = async (liked: boolean): Promise<void> => {
        try {
            if (currentUser){
                if (liked){
                    await createPetAction({
                        action: liked,
                        created_at: new Date().toISOString(),
                        user: currentUser.$id,
                        pet: pet.$id,
                    });
                }else{
                    await deletePetAction(currentUser.$id, pet.$id);
                }

                setIsLiked(liked)
            }
        } catch (error) {
            console.error("Error submitting shelter registration:", error);
            Alert.alert("Chyba", "Nepodařilo se registrovat útulek.");
        }

    };

    const handleReport = () => {
        // router.push('Report', {pet});
    }

    if (loading) {
        return (
            <ThemedView className="flex align-center justify-center" >
                <ActivityIndicator size="large" />
            </ThemedView>
        );
    }

    if (!pet) {
        return (
            <ThemedView className="flex align-center justify-center">
                <Text>Pet not found</Text>
            </ThemedView>
        );
    }

    return (
        <ThemedView className="flex-1">
            <StatusBar translucent backgroundColor="transparent" animated={true}/>
            <ScrollView contentContainerStyle={{flexGrow:1}}>
                {petImages.length > 0 ? (
                    <CustomImageSlider images={petImages} />

                ) : (
                    <ThemedText>No images available</ThemedText>
                )}

                <ThemedView className="flex-row items-center justify-between p-4 ">
                    <ThemedView className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()}>
                            <MaterialIcons name="arrow-back" size={28} color={colorScheme === 'dark' ? 'white' : 'black'} />
                        </TouchableOpacity>
                        <ThemedText type="descriptionTitle" className="ml-4">{pet.name}</ThemedText>
                    </ThemedView>
                    <ThemedView className="flex-row items-center">
                        {isLiked ? (
                            <TouchableOpacity className="flex-row items-center" onPress={() => onResponse(false)}>
                                <FontAwesome name="heart"  size={23} color={Colors.dark.buttonPrimary} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity className="flex-row items-center" onPress={() => onResponse(true)}>
                                <FontAwesome name="heart-o"  size={23} color={Colors.dark.buttonPrimary} />
                            </TouchableOpacity>
                        )}

                    </ThemedView>
                </ThemedView>

                <ThemedView className="pb-16 flex flex-column space-y-4">
                    <ThemedView className="w-full flex flex-column p-3 rounded-xl" style={{backgroundColor: colorScheme === 'dark' ? Colors.dark.descriptionBg : Colors.light.descriptionBg}}>
                        <ThemedText className="text-sm font-semibold" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}}>O mně</ThemedText>
                        <ThemedText type="default">{pet.description}</ThemedText>
                    </ThemedView>
                    <ThemedView className="w-full flex flex-column p-3 rounded-xl" style={{backgroundColor: colorScheme === 'dark' ? Colors.dark.descriptionBg : Colors.light.descriptionBg}}>
                        <ThemedText className="text-sm font-semibold" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}}>Základní informace</ThemedText>
                        <ThemedView className="flex flex-col divide-y-2 divide-y-reverse divide-neutral-700 py-3">
                            {distance !== null && (
                                <ThemedView className="flex-row py-3">
                                    <Entypo name="location-pin" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                    <ThemedText className="ml-2">{distance.toFixed(1)} km daleko</ThemedText>
                                </ThemedView>
                            )}
                            <ThemedView className="flex-row py-3">
                                {pet.gender === 1 ?
                                    <MaterialCommunityIcons name="gender-male" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={24} color={colorScheme === 'dark' ? 'white' : 'black'} /> :
                                    <MaterialCommunityIcons name="gender-female" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                }
                                <ThemedText className="ml-2">{getGenderByType(pet.gender, pet.type.type)}</ThemedText>
                            </ThemedView>
                            <ThemedView className="flex-row py-3">
                                <MaterialCommunityIcons name="clock-outline" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                <ThemedText className="ml-2">{getDateString(pet.birth_date)}</ThemedText>
                            </ThemedView>
                            {pet.size && pet.size.size_type && pet.size.size && (
                            <ThemedView className="flex-row py-3">
                                <Ionicons name="resize-outline" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                <ThemedText className="ml-2">{getSizeString(pet.size.size_type, pet.size.size)}</ThemedText>
                            </ThemedView>
                            )}
                            {pet.weight && (
                            <ThemedView className="flex-row py-3">
                                <MaterialCommunityIcons name="weight-kilogram" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                <ThemedText className="ml-2">{pet.weight} kg</ThemedText>
                            </ThemedView>
                            )}
                            {pet.crossbreed === true ? (
                                <ThemedView className="flex-row py-3">
                                    {pet.type.type === 'dog' ?
                                        <FontAwesome6 name="dog" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={20} color={colorScheme === 'dark' ? 'white' : 'black'} /> :
                                        <FontAwesome6 name="cat" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={20} color={colorScheme === 'dark' ? 'white' : 'black'} /> }
                                    <ThemedText className="ml-2">Kříženec (
                                        {Array.isArray(breedNames)
                                            ? breedNames.join(', ')
                                            : breedNames}
                                        )</ThemedText>
                                </ThemedView>
                            ): (
                                <ThemedView className="flex-row py-3">
                                    {pet.type.type === 'dog' ?
                                        <FontAwesome6 name="dog" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={20} color={colorScheme === 'dark' ? 'white' : 'black'} /> :
                                        <FontAwesome6 name="cat" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={20} color={colorScheme === 'dark' ? 'white' : 'black'} /> }
                                    <ThemedText className="ml-2">
                                        {Array.isArray(breedNames)
                                            ? breedNames.join(', ')
                                            : breedNames}
                                        </ThemedText>
                                </ThemedView>
                            )}


                            <ThemedView className="flex-row py-3">
                                <MaterialIcons name="calendar-today" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                <ThemedText className="ml-2">{getFoundDateString(pet.placement_date)}</ThemedText>
                            </ThemedView>
                            <ThemedView className="flex-row py-3">
                                <FontAwesome6 name="house" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                <ThemedText className="ml-2">{pet.shelter.name}</ThemedText>
                            </ThemedView>
                            {pet.adoption_fee !== null && (
                                <ThemedView className="flex-row pb-3 py-3">
                                    <FontAwesome6 name="money-bill-wave" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                    <ThemedText className="ml-2">{getAdoptionFeeString(pet.adoption_fee)}</ThemedText>
                                </ThemedView>
                            )}
                        </ThemedView>
                        <ThemedView className="mt-3 flex-row justify-between w-full">
                            <ThemedView className="items-center">
                                <ThemedText type="subtitle">Očkování</ThemedText>
                                <ThemedView className="items-center justify-center mt-1">
                                    {pet.vaccination ? (
                                        <Feather name="check-circle" size={24} color="green" />
                                    ) : (
                                        <Feather name="x-circle" size={24} color="red" />
                                    )}
                                </ThemedView>
                            </ThemedView>
                            <ThemedView className="items-center">
                                <ThemedText type="subtitle">Odčervení</ThemedText>
                                <ThemedView className="items-center justify-center mt-1">
                                    {pet.deworming ? (
                                        <Feather name="check-circle" size={24} color="green" />
                                    ) : (
                                        <Feather name="x-circle" size={24} color="red" />
                                    )}
                                </ThemedView>
                            </ThemedView>
                            <ThemedView className="items-center">
                                <ThemedText type="subtitle">Čipování</ThemedText>
                                <ThemedView className="items-center justify-center mt-1">
                                    {pet.chipping ? (
                                        <Feather name="check-circle" size={24} color="green" />
                                    ) : (
                                        <Feather name="x-circle" size={24} color="red" />
                                    )}
                                </ThemedView>
                            </ThemedView>
                            <ThemedView className="items-center">
                                <ThemedText type="subtitle">Kastrování</ThemedText>
                                <ThemedView className=" items-center justify-center mt-1">
                                    {pet.castration ? (
                                        <Feather name="check-circle" size={24} color="green" />
                                    ) : (
                                        <Feather name="x-circle" size={24} color="red" />
                                    )}
                                </ThemedView>
                            </ThemedView>
                        </ThemedView>
                    </ThemedView>
                    {pet.handicap && (
                    <ThemedView className="w-full flex flex-column p-3 rounded-xl" style={{backgroundColor: colorScheme === 'dark' ? Colors.dark.descriptionBg : Colors.light.descriptionBg}}>
                        <ThemedText className="text-sm font-semibold" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}}>Dodatečné informace</ThemedText>
                        <ThemedText className="my-3" type="title">❤️‍🩹 Handicapovaný</ThemedText>
                        <ThemedText type="default">{pet.handicap_description}</ThemedText>
                    </ThemedView>

                        )}
                    <ThemedView className="w-full flex flex-column p-3 rounded-xl" style={{backgroundColor: colorScheme === 'dark' ? Colors.dark.descriptionBg : Colors.light.descriptionBg}}>
                    <ThemedText className="text-sm font-semibold" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}}>Informace o útulku</ThemedText>
                    <ThemedView className="flex-row space-x-3 mt-3">
                        {!loading && shelterImages[0] && shelterImages[0].fileUrl && (
                            <Image className="rounded-xl" source={{ uri: shelterImages[0].fileUrl }} style={styles.shelterImage} />
                        )}
                        <ThemedView className="flex-col justify-between" style={{ width: '70%' }}>
                        <ThemedText className="text-pretty" style={{
                            flexWrap: 'wrap',
                            flexShrink: 1,
                            textAlign: 'left',
                        }} type="logo">{pet.shelter.name}</ThemedText>
                        <ThemedView className="flex items-start">
                            <TouchableOpacity className="rounded-xl p-2 flex items-center justify-center" style={{backgroundColor: colorScheme === 'dark' ? Colors.dark.buttonPrimary : Colors.light.buttonPrimary}} onPress={() => {
                                //@ts-ignore
                                navigateToShelter(pet.shelter.$id, shelterImages)}}
                            >
                                <ThemedText className="text-sm font-bold" style={{color: "black"}}>
                                    Dozvědět se více
                                </ThemedText>
                            </TouchableOpacity>
                        </ThemedView>
                    </ThemedView>
                    </ThemedView>
                </ThemedView>
                    <ContactButton handlePress={navigateToContact} />
                    <ReportButton handlePress={handleReport} />
                </ThemedView>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 500,
        backgroundColor: '#eee',
    },
    shelterImage: {
        width: 100,
        height: 100,
        backgroundColor: '#eee',
    },
});
