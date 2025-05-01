import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import {useRouter} from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useColorScheme} from "@/hooks/useColorScheme";
import {
    getCurrentUserFormCollection,
    getImageByShelerID,
    getShelterByUserID,
    ShelterDocument, UploadedFileInfo, UserDocument
} from "@/lib/appwrite";
import {DrawerActions, NavigationProp, useNavigation} from "@react-navigation/native";
import {RootStackParamList} from "@/components/navigation/navigation";
import Entypo from '@expo/vector-icons/Entypo';
import * as Location from 'expo-location';
import {
    formatPhoneNumber,
} from "@/utils/dataModifications";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import {Colors} from "@/constants/Colors";
import {SubmitButton} from "@/components/buttons/SubmitButton";
import {FontAwesome5} from "@expo/vector-icons";
import TopBar from "@/components/navigation/TopBar";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import {EditButton} from "@/components/buttons/EditButton";
import CustomImageSlider from "@/components/CustomImageSlider";
// import { GOOGLE_MAPS_API_KEY } from '@env';

// Interface for geolocation coordinates
interface Coordinates {
    lat: number;
    lng: number;
}

// Converts degrees to radians (used for distance calculation)
function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

// Uses Google Maps Geocoding API to convert address into coordinates
async function getCoordinatesFromAddress(
    street: string,
    postalCode: string,
    city: string,
    country?: string): Promise<Coordinates> {
    const address = `${street}, ${postalCode}, ${city}${country ? `, ${country}` : ''}`;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
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

// Calculates distance (in km) between two lat/lon points using Haversine formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Shelter Profile Screen Component
export default function ShelterProfileScreen() {
    // State management
    const [currentUser, setCurrentUser] = useState<UserDocument | null>(null);
    const [loading, setLoading] = useState(false);
    const [shelterImages, setShelterImages] = useState<UploadedFileInfo[]>([]);
    const [distance, setDistance] = useState<number | null>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [shelter, setShelter] = useState<ShelterDocument | null>(null);

    const colorScheme = useColorScheme();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const router = useRouter();

    // Fetch user and shelter data on mount
    useEffect(() => {
        async function fetchUser() {
            const user = await getCurrentUserFormCollection();
            setCurrentUser(user);
            if (user?.is_shelter) {
                try {
                    let shelterData = await getShelterByUserID(user.$id);
                    setShelter(shelterData);
                }catch (error) {
                    console.error("Error fetching shelter:", error);
                    setShelter(null);
                }
            }
        }
        fetchUser();
    }, []);

    // Request location permission and get current location on mount
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
    }, []);

    // When shelter and location are both available, calculate distance
    useEffect(() => {
        async function fetchDistance() {
            if (location && shelter) {
                try {
                    let petLocation: Coordinates = await getCoordinatesFromAddress(
                        shelter.street,
                        shelter.postalCode,
                        shelter.city,
                        shelter.country
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
    }, [location, shelter]);

    // Load shelter images when shelter data is available
    useEffect(() => {
        async function loadShelterImages() {
            if (shelter) {
                try {
                    let images = await getImageByShelerID(shelter.$id);
                    setShelterImages(
                        images.map((img, idx) => ({
                            fileId: img.fileId,
                            fileUrl: img.fileUrl,
                            storageId: img.storageId,
                            slotIndex: idx
                        }))
                    );
                } catch (error) {
                    console.error(`Error loading image for pet ${shelter.$id}:`, error);
                    setShelterImages([]);
                }
            }
        }
        loadShelterImages();
    }, [shelter]);

    // Edit handler - navigates to update shelter screen
    const handleEdit = () => {
        navigation.navigate('Modals', {
            screen: 'UpdateShelter',
            params: {
                shelter: shelter,
                images: shelterImages,
            },
        });
    }

    // Opens navigation drawer menu
    const onMenu = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    }

    // Loading fallback view
    if (loading) {
        return (
            <ThemedView className="flex align-center justify-center" >
                <ActivityIndicator size="large" />
            </ThemedView>
        );
    }

    // Shelter not found fallback view
    if (!shelter) {
        return (
            <ThemedView className="flex w-full h-screen align-center justify-center">
                <ThemedView>
                    <ThemedText type="descriptionTitle">Útulek nebyl nalezen</ThemedText>
                    <SubmitButton
                        title="Zpět"
                        className="mt-4"
                        buttonColorKey="secondary"
                        handlePress={() => {
                            router.push("/home");
                        }}
                    />
                </ThemedView>
            </ThemedView>
        );
    }

    // Main content
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
                    library: "FontAwesome6",
                    name: "edit",
                    onPress: handleEdit,
                    size: 24
                }}
            />
            <ScrollView>
                {shelterImages.length > 0 ? (
                    <CustomImageSlider images={shelterImages} />
                ) : (
                    <ThemedText>No images available</ThemedText>
                )}

                <ThemedView className=" p-4 ">
                    <ThemedText type="descriptionTitle" className="">{shelter.name}</ThemedText>
                </ThemedView>

                <ThemedView className="pb-16 flex flex-column space-y-4">
                    <ThemedView className="w-full flex flex-column p-3 rounded-xl" style={{backgroundColor: colorScheme === 'dark' ? Colors.dark.descriptionBg : Colors.light.descriptionBg}}>
                        <ThemedText className="text-sm font-semibold" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}}>O mně</ThemedText>
                        <ThemedText type="default">{shelter.bio}</ThemedText>
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
                                <FontAwesome6 name="house" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                <ThemedText className="ml-2">{shelter.city} {shelter.street}</ThemedText>
                            </ThemedView>
                            <ThemedView className="flex-row py-3">
                                <FontAwesome6 name="phone" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                <ThemedText className="ml-3">{formatPhoneNumber(shelter.phone)}</ThemedText>
                            </ThemedView>
                            <ThemedView className="flex-row py-3">
                                <MaterialIcons name="calendar-today" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                <ThemedText className="ml-2"> Založeno v roce {shelter.founded}</ThemedText>
                            </ThemedView>
                            {shelter.pet_count && (
                                <ThemedView className="flex-row py-3">
                                    <ThemedText>
                                        <MaterialIcons name="pets" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                    </ThemedText>
                                    <ThemedText className="ml-3">Aktuální počet {shelter.pet_count}</ThemedText>
                                </ThemedView>
                            )}
                            {shelter.num_pets_adopted && (
                                <ThemedView className="flex-row pt-3">
                                    <ThemedText>
                                        <FontAwesome5 name="hand-holding-heart" style={{color: colorScheme === 'dark' ? Colors.dark.descriptionText : Colors.dark.descriptionText}} size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                    </ThemedText>
                                    <ThemedText className="ml-3">Roční počet adopcí {shelter.num_pets_adopted}</ThemedText>
                                </ThemedView>
                            )}
                        </ThemedView>
                    </ThemedView>
                    <EditButton handlePress={handleEdit} />
                </ThemedView>
            </ScrollView>
        </ParallaxScrollView>
    );
}
