import React, { useState, useEffect } from "react";
import {
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Keyboard,
    Platform, Alert,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";

export interface PlaceAutocompleteResult {
    place_id: string;
    description: string;
}

export interface PlaceDetails {
    street: string;       // e.g. "123 Main St"
    postalCode: string;   // e.g. "10001"
    city: string;         // e.g. "New York"
    region: string;       // e.g. "NY" or "State/Province"
    country: string;      // e.g. "United States"
    latitude: number;
    longitude: number;
    formattedAddress: string;
}

export interface RNGoogleSearchBoxProps {
    label?: string;
    apiKey: string;               // Your Google Places API key
    onSelectLocation: (details: PlaceDetails) => void;
    containerClassName?: string;  // For tailwind or dynamic className
    inputClassName?: string;
    placeholder?: string;
    minCharsBeforeSearch: number;
    searchRadius?: number;
    countryCode?: string; // e.g. "cz" for Czech Republic

}

const CustomGeoSearch: React.FC<RNGoogleSearchBoxProps> = ({
                                                               label,
                                                               apiKey,
                                                               onSelectLocation,
                                                               containerClassName,
                                                               inputClassName,
                                                               placeholder,
                                                               minCharsBeforeSearch,
                                                               searchRadius,
                                                               countryCode,
                                                           }) => {
    const theme = useColorScheme() ?? "light";

    // The user-typed query
    const [query, setQuery] = useState("");
    // Suggestions from the Places Autocomplete API
    const [suggestions, setSuggestions] = useState<PlaceAutocompleteResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Store current location if available
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Get current location on mount (if permissions are granted)
    useEffect(() => {
        if (Platform.OS !== "web" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("DEBUG: Error getting current position:", error);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } else {
            console.warn("DEBUG: Geolocation is not available");
        }
    }, []);

    // Called whenever user types in the text input
    useEffect(() => {
        if (query.length < minCharsBeforeSearch) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }
        fetchAutocomplete(query);
    }, [query]);

    // 1) Fetch Autocomplete Suggestions
    const fetchAutocomplete = async (inputValue: string) => {
        setLoading(true);
        setShowDropdown(true);
        try {
            // Build the URL, optionally add location bias if available
            let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}&input=${encodeURIComponent(
                inputValue
            )}&language=cz`;
            if (countryCode) {
                url += `&components=country:${countryCode}`;
                // console.log("DEBUG: Using country code restriction:", countryCode);
            }

            // console.log("DEBUG: Autocomplete request URL =", url);
            const response = await fetch(url);
            const json = await response.json();
            // console.log("DEBUG: Autocomplete response JSON =", json);

            if (json.status === "OK") {
                const results: PlaceAutocompleteResult[] = json.predictions.map(
                    (item: any) => ({
                        place_id: item.place_id,
                        description: item.description,
                    })
                );
                setSuggestions(results);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Error fetching places autocomplete:", error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    // 2) When user selects a suggestion, fetch the place details
    const handleSelectSuggestion = async (place_id: string, description: string) => {
        Keyboard.dismiss();
        setQuery(description);
        setShowDropdown(false);
        setSuggestions([]);

        try {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?key=${apiKey}&place_id=${place_id}`;
            const detailsResponse = await fetch(detailsUrl);
            const detailsJson = await detailsResponse.json();

            if (detailsJson.status === "OK") {
                const result = detailsJson.result;
                const { lat, lng } = result.geometry.location;

                // Parse address components
                const details = parseAddressComponents(result.address_components);

                if (!details.street || !details.postalCode) {
                    Alert.alert(
                        "Incomplete Address",
                        "The selected address is missing a street and/or postal code. Please ensure you include both the street name and building number."
                    );
                    return;
                }
                const placeDetails: PlaceDetails = {
                    street: details.street,
                    postalCode: details.postalCode,
                    city: details.city,
                    region: details.region,
                    country: details.country,
                    formattedAddress: description,
                    latitude: lat,
                    longitude: lng,
                };
                // Pass these details to the parent
                onSelectLocation(placeDetails);
            } else {
                console.error("Failed fetching place details:", detailsJson.status);
            }
        } catch (error) {
            console.error("Error fetching place details:", error);
        }
    };

    // Helper to parse address components
    const parseAddressComponents = (components: any[]): any => {
        const result: any = {
            street: "",
            postalCode: "",
            city: "",
            region: "",
            country: "",
        };


        components.forEach((comp) => {
            if (comp.types.includes("street_number")) {
                result.street += comp.long_name + " ";
            }
            if (comp.types.includes("route")) {
                result.street += comp.long_name;
            }
            if (comp.types.includes("postal_code")) {
                result.postalCode = comp.long_name;
            }
            if (comp.types.includes("administrative_area_level_1")) {
                result.region = comp.long_name;
            }
            if ((comp.types.includes("locality") && comp.long_name.length > 0) || (comp.types.includes("sublocality_level_1") && comp.long_name.length > 0)) {
                result.city = comp.long_name;
            }
            if (comp.types.includes("country")) {
                result.country = comp.long_name;
            }
        });

        return result;
    };

    // Renders the suggestions dropdown
    const renderDropdown = () => {
        if (!showDropdown || suggestions.length === 0) {
            return null;
        }

        return (
            <ThemedView
                style={[
                    styles.optionsContainer,
                    {
                        backgroundColor:
                            theme === "light"
                                ? Colors.light.buttonSecondary
                                : Colors.dark.buttonSecondary,
                    },
                ]}
            >
                {loading && <ActivityIndicator size="small" color="#fff" />}
                {!loading &&
                    suggestions.map((item) => (
                        <TouchableOpacity
                            key={item.place_id}
                            onPress={() => handleSelectSuggestion(item.place_id, item.description)}
                            style={[
                                styles.option,
                                {
                                    borderBottomColor:
                                        theme === "light"
                                            ? Colors.light.buttonTextSecondary
                                            : Colors.dark.buttonTextSecondary,
                                },
                            ]}
                        >
                            <ThemedText>{item.description}</ThemedText>
                        </TouchableOpacity>
                    ))}
            </ThemedView>
        );
    };

    return (
        <ThemedView className={containerClassName}>
            {label && <ThemedText type="title">{label}</ThemedText>}
            <ThemedView style={styles.inputContainer} className={inputClassName} >
                <TextInput
                    style={[
                        {
                            color:
                                theme === "light" ? Colors.light.buttonSecondary : Colors.dark.icon,
                        },
                    ]}
                    placeholder={placeholder}
                    value={query}
                    onChangeText={(text) => setQuery(text)}
                    onFocus={() => {
                        if (query.length >= minCharsBeforeSearch) setShowDropdown(true);
                    }}
                />
                <MaterialIcons
                    name="location-on"
                    size={24}
                    color={
                        theme === "light"
                            ? Colors.light.buttonSecondary
                            : Colors.dark.icon
                    }
                />
            </ThemedView>
            {renderDropdown()}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 40,
        borderBottomWidth: 2,
        borderBottomColor: "#828693",
    },
    optionsContainer: {
        marginTop: 4,
        marginBottom: 10,
    },
    option: {
        padding: 10,
        borderBottomWidth: 1,
    },
});

export default CustomGeoSearch;
