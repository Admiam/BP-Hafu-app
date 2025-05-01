import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import {useRouter} from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {ThemedText} from '@/components/ThemedText';
import {ThemedView} from '@/components/ThemedView';
import {useColorScheme} from "@/hooks/useColorScheme";
import {
    getImageByShelerID,
    getShelterByPetID,
    ShelterDocument, UploadedFileInfo
} from "@/lib/appwrite";
import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import {ModalStackParamList, RootStackParamList} from "@/components/navigation/navigation";
import Entypo from '@expo/vector-icons/Entypo';
import * as Location from 'expo-location';
import {
    formatPhoneNumber,
} from "@/utils/dataModifications";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import {Colors} from "@/constants/Colors";
import {StatusBar} from "expo-status-bar";
import {SubmitButton} from "@/components/buttons/SubmitButton";
import {ReportButton} from "@/components/buttons/ReportButton";
import {FontAwesome5} from "@expo/vector-icons";
import {ContactButton} from "@/components/buttons/ContactButton";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import CustomImageSlider from "@/components/CustomImageSlider";
// import {GOOGLE_MAPS_API_KEY} from "@env";


interface Coordinates {
    lat: number;
    lng: number;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

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

// Function to calculate distance between two coordinates
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

//TODO different icon sizes. make custom size of view around icons


export default function ShelterDetail() {
    const [loading, setLoading] = useState(false);
    const [shelterImages, setShelterImages] = useState<UploadedFileInfo[]>([]);
    const [distance, setDistance] = useState<number | null>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [shelter, setShelter] = useState<ShelterDocument | null>(null);

    const colorScheme = useColorScheme();
    const route = useRoute<RouteProp<ModalStackParamList, 'ShelterDetail'>>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const router = useRouter();
    const {shelterId, pet, image} = route.params;

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
        async function fetchShelter() {
            if (shelterId) {
                try {
                    let shelterData = await getShelterByPetID(shelterId);
                    setShelter(shelterData);
                }catch (error) {
                    console.error("Error fetching shelter:", error);
                    setShelter(null);
                }
            }
        }
        fetchShelter();
    }, []); // Fetch pet shelter name on mount
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
    }, [location, shelter]); // Fetch distance when location or shelter changes
    useEffect(() => {
        async function loadShelterImages() {
            if (shelter) {
                try {
                    let imagesData = await getImageByShelerID(shelter.$id);
                    setShelterImages(
                        imagesData.map((img, idx) => ({
                            fileId: img.fileId,    // or actual file ID if available
                            fileUrl: img.fileUrl,
                            storageId: img.storageId,
                            slotIndex: idx            // <- this is what was missing
                        }))
                    );
                } catch (error) {
                    console.error(`Error loading image for pet ${shelter.$id}:`, error);
                    setShelterImages([]);
                }
            }
        }
        loadShelterImages();
    }, [shelter]); // Load shelter images when shelter changes

    const handleReport = () => {
        console.log("report")
    }

    const navigateToContact = () => {
        navigation.navigate('Modals', {
            screen: 'ContactShelter',
            params: {
                pet: pet,
            },
        });
    };

    if (loading) {
        return (
            <ThemedView className="flex align-center justify-center" >
                <ActivityIndicator size="large" />
            </ThemedView>
        );
    }

    if (!shelter) {
        return (
            <ThemedView className="flex align-center justify-center">
                <ThemedView>
                    <ThemedText type="title">Útulek nebyl nalezen</ThemedText>
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

    return (
        <ThemedView className="flex-1">
            <StatusBar translucent backgroundColor="transparent" animated={true}/>
            <ScrollView contentContainerStyle={{flexGrow:1}}>
                {shelterImages.length > 0 ? (
                    <CustomImageSlider images={shelterImages} />
                    ) : (
                    <ThemedText>No images available</ThemedText>
                )}

                <ThemedView className="flex-row items-center p-4 ">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={28} color={colorScheme === 'dark' ? 'white' : 'black'} />
                    </TouchableOpacity>
                    <ThemedText type="descriptionTitle" className="ml-4">{shelter.name}</ThemedText>
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
                    <ContactButton handlePress={navigateToContact} />
                    <ReportButton handlePress={handleReport} />
                </ThemedView>

            </ScrollView>
        </ThemedView>
    );
}
