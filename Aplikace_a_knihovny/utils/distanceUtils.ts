import {PetsDocument} from "@/lib/appwrite";
import {LocationObject} from "expo-location";
import {useEffect, useState} from "react";

interface Coordinates {
    lat: number;
    lng: number;
}

interface ShelterAddress {
    street: string;
    postalCode: string;
    city: string;
    country?: string;
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

export async function fetchDistance(pet: PetsDocument, location: LocationObject | null) : Promise<string> {
    if (location && pet) {
        try {
            let shelter = pet.shelter as unknown as ShelterAddress;
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
            return d.toFixed(1)+" km";
        } catch (error) {
            console.error("Error calculating distance:", error);
            return ""
        }
    }
    return "";
}

interface DistanceDisplayProps {
    pet: PetsDocument;
    location: LocationObject | null;
}

export function distanceDisplay(pet: PetsDocument, location: LocationObject | null) : string {
    const [distance, setDistance] = useState<string>('0');

    useEffect(() => {
        if (pet && location) {
            fetchDistance(pet, location)
                .then((d) => setDistance(d))
                .catch((err) => {
                    console.error("Error calculating distance:", err);
                    setDistance('0');
                });
        }
    }, [pet, location]);

    return {distance} + "km daleko";
};

