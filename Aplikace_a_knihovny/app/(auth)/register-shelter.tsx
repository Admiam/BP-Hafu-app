import React, {useEffect, useState} from "react";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import { router } from "expo-router";
import CustomTextInput from "@/components/forms/CustomTextInput";
import Animated, {
    useAnimatedRef,
} from 'react-native-reanimated';
import CustomTextArea from "@/components/forms/CustomTextArea";
import {getRegions, registerShelter} from "@/lib/appwrite";
import {Alert} from "react-native";
import {PlaceDetails} from "@/components/forms/CustomGeoSearch";
import UploadImage from "@/components/forms/UploadImage";
import {validateShelterRegistration} from "@/utils/validation";
import {ThemedText} from "@/components/ThemedText";
import CustomDropDownMenu from "@/components/forms/CustomDropDownMenu";

// Define the type for uploaded image information
type UploadedFileInfo = { fileId: string; fileUrl: string; slotIndex: number, storageId: string };

const RegisterShelter: React.FC = () => {
    // State variables for shelter registration form fields
    const [shelterName, setShelterName] = useState("");
    const [registrationId, setRegistrationId] = useState("");
    const [street, setStreet] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [city, setCity] = useState("");
    const [region, setRegion] = useState("");
    const [country, setCountry] = useState("");
    const [founded, setFounded] = useState("");
    const [petCount, setPetCount] = useState("");
    const [numPetsAdopted, setNumPetsAdopted] = useState("");
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");
    const [shelterId, setShelterId] = useState<string | null>(null);
    const [uploadedImages, setUploadedImages] = useState<UploadedFileInfo[]>([]);
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [regionData, setRegionData] = useState<{ label: string; value: string;}[]>([]);

    // Fetch list of regions for the dropdown on component mount
    useEffect(() => {
        async function fetchRegions() {
            let regions = await getRegions();
            let persedRegions = regions.documents.map((doc) => ({
                label: doc.name,
                value: doc.name,
            }));
            setRegionData(persedRegions);
        }
        fetchRegions()
    }, []);

    // Reference to scroll view for animation purposes
    const scrollRef = useAnimatedRef<Animated.ScrollView>();

    // Field-specific validation on change
    const validateField = (field: string, value: any) => {
        const formValues = {
            shelterName,
            registrationId,
            street,
            postalCode,
            city,
            region,
            country,
            founded,
            petCount,
            numPetsAdopted,
            phone,
            bio,
            uploadedImages,
            // Include the new value
            [field]: value
        };

        // Update only the error of the validated field
        const validationErrors = validateShelterRegistration(formValues);

        // Update errors state for just this field
        setErrors(prev => ({
            ...prev,
            [field]: validationErrors[field] || null
        }));

        return validationErrors[field] || null;
    };

    // Helper function to display validation errors below inputs
    const renderError = (field: string) => {
        if (errors[field]) {
            return (
                <ThemedText className="text-red-500 px-4 text-sm">
                    {errors[field]}
                </ThemedText>
            );
        }
        return null;
    };

    // Submit form data to backend after validating all fields
    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            // Validate all fields
            const formValues = {
                shelterName,
                registrationId,
                street,
                postalCode,
                city,
                region,
                country,
                founded,
                petCount,
                numPetsAdopted,
                phone,
                bio,
                uploadedImages,
            };

            const validationErrors = validateShelterRegistration(formValues);

            // If validation fails, display alert and stop submission
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);

                // Create a list of error fields for the alert
                const errorFields = Object.keys(validationErrors).map(field => {
                    // Map field names to user-friendly labels
                    const fieldMap: Record<string, string> = {
                        shelterName: 'Název útulku',
                        registrationId: 'Registrační číslo',
                        street: 'Ulice',
                        postalCode: 'PSČ',
                        city: 'Město',
                        region: 'Kraj',
                        country: 'Země',
                        founded: 'Rok vzniku',
                        petCount: 'Počet mazlíků',
                        numPetsAdopted: 'Počet adopcí',
                        phone: 'Telefonní číslo',
                        bio: 'Popis útulku',
                        images: 'Fotografie'
                    };
                    return fieldMap[field] || field;
                }).join(', ');
                Alert.alert(
                    "Chyba",
                    `Formulář obsahuje chyby v následujících polích: ${errorFields}. Opravte je prosím a zkuste to znovu.`
                );

                setIsSubmitting(false);
                return;
            }

            // Register shelter using API
            const id = await registerShelter({
                shelterName,
                registrationId,
                street,
                postalCode,
                city,
                region,
                country,
                founded,
                petCount,
                numPetsAdopted,
                phone,
                bio,
                uploadedImages,
            });
            setShelterId(id);
            Alert.alert("Success", "Útulek byl úspěšně registrován.");
            router.push("/home");
        } catch (error) {
            console.error("Error submitting shelter registration:", error);
            Alert.alert("Chyba", "Nepodařilo se registrovat útulek.");
        }
    };

    // Callback when address is selected from geolocation search
    const handleSelectLocation = async (details: PlaceDetails) => {
        setStreet(details.street);
        setPostalCode(details.postalCode);
        setCity(details.city);
        setRegion(details.region);
        setCountry(details.country);
    };

    // Handle successful image upload
    const handleImageUploadSuccess = (info: UploadedFileInfo) => {
        setUploadedImages((prev) => {
            // If the same slot index was used, replace it
            const existing = [...prev];
            const existingIndex = existing.findIndex((x) => x.slotIndex === info.slotIndex);
            if (existingIndex >= 0) {
                existing[existingIndex] = info
            } else {
                existing.push(info);
            }
            return existing;
        });
    };

    // Handle successful image deletion
    const handleImageDeleteSuccess = (info: { fileId: string; storageId: string; slotIndex: number }) => {
        setUploadedImages(prev => prev.filter(img => img.slotIndex !== info.slotIndex));
    };

    // Render UI: form inputs, image upload, and submit button
    return (
        <ParallaxScrollView
            className="bg-primary h-screen"
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#000" }}
            headerImage={<></>}
        >
            <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>

                <CustomTextInput
                    label="Název útulku"
                    value={shelterName}
                    onChangeText={(value) => {
                        setShelterName(value);
                        validateField('shelterName', value);
                    }}
                    placeholder="Název útulku"
                    containerClassName="pt-10 px-4"
                    inputClassName={`text-white mt-8 ${errors.shelterName ? 'border-red-500' : ''}`}
                    keyboardType="default"
                    autoCapitalize="words"
                />
                {renderError('shelterName')}

                <CustomTextInput label="Registrační číslo Státní Veterinární Správy" value={registrationId} onChangeText={setRegistrationId} placeholder="CZXXXXXXXX" containerClassName="pt-10 px-4" inputClassName="text-white mt-8" keyboardType="default" autoCapitalize="words" />

                {/*<LocationSearch*/}
                {/*    label="Vyhledat adresu"*/}
                {/*    apiKey=""*/}
                {/*    onSelectLocation={handleSelectLocation}*/}
                {/*    containerClassName="pt-10 px-4"*/}
                {/*    inputClassName="text-white mt-8"*/}
                {/*    placeholder="Zadejte adresu, město..."*/}
                {/*    minCharsBeforeSearch={3}*/}
                {/*    countryCode="cz"*/}
                {/*    // TODO locate registered user*/}
                {/*/>*/}
                <CustomTextInput
                    label="Ulice a číslo popisné"
                    value={street}
                    onChangeText={(value) => {
                        setStreet(value);
                        validateField('street', value);
                    }}
                    placeholder="Ulice a číslo popisné"
                    containerClassName="pt-10 px-4"
                    inputClassName="text-white mt-8"
                    keyboardType="default"
                    autoCapitalize="words"
                />
                {renderError('street')}


                <CustomTextInput
                    label="Poštovní směrovací číslo"
                    value={postalCode}
                    onChangeText={(value) => {
                        setPostalCode(value);
                        validateField('postalCode', value);
                    }}
                    placeholder="poštovní směrovací číslo"
                    containerClassName="pt-10 px-4"
                    inputClassName="text-white mt-8"
                    keyboardType="number-pad"
                    autoCapitalize="words"
                />
                {renderError('postalCode')}

                <CustomTextInput
                    label="Město"
                    value={city}
                    onChangeText={(value) => {
                        setCity(value);
                        validateField('city', value);
                    }}
                    placeholder="Město"
                    containerClassName="pt-10 px-4"
                    inputClassName="text-white mt-8"
                    keyboardType="default"
                    autoCapitalize="words"
                />
                {renderError('city')}

                <CustomDropDownMenu
                    label="Kraj"
                    value={region}
                    onValueChange={(value) => {
                        setRegion(value);
                        validateField('region', value);
                    }}
                    data={regionData}
                    containerClassName="pt-10 px-4"
                    inputClassName="text-white mt-8"
                />
                {renderError('region')}

                <CustomTextInput
                    label="Telefoní číslo"
                    value={phone}
                    onChangeText={(value) => {
                        setPhone(value);
                        validateField('phone', value);
                    }}
                    placeholder="telefoní číslo"
                    containerClassName="pt-10 px-4"
                    inputClassName={`text-white mt-8 ${errors.phone ? 'border-red-500' : ''}`}
                    keyboardType="phone-pad"
                />
                {renderError('phone')}

                <CustomTextInput
                    label="Rok vzniku"
                    value={founded}
                    onChangeText={(value) => {
                        setFounded(value);
                        validateField('founded', value);
                    }}
                    placeholder="rok vzniku"
                    containerClassName="pt-10 px-4"
                    inputClassName={`text-white mt-8 ${errors.founded ? 'border-red-500' : ''}`}
                    keyboardType="numeric"
                />
                {renderError('founded')}

                <CustomTextInput
                    label="Aktuální počet mazlíků"
                    value={petCount}
                    onChangeText={(value) => {
                        setPetCount(value);
                        validateField('petCount', value);
                    }}
                    placeholder="aktuální počet zvířat"
                    containerClassName="pt-10 px-4"
                    inputClassName={`text-white mt-8 ${errors.petCount ? 'border-red-500' : ''}`}
                    keyboardType="numeric"
                />
                {renderError('petCount')}

                <CustomTextInput
                    label="Počet adopcí za rok"
                    value={numPetsAdopted}
                    onChangeText={(value) => {
                        setNumPetsAdopted(value);
                        validateField('numPetsAdopted', value);
                    }}
                    placeholder="počet adopcí za rok"
                    containerClassName="pt-10 px-4"
                    inputClassName={`text-white mt-8 ${errors.numPetsAdopted ? 'border-red-500' : ''}`}
                    keyboardType="numeric"
                />
                {renderError('numPetsAdopted')}

                <CustomTextArea
                    label="Popis útulku"
                    value={bio}
                    onChangeText={(value) => {
                        setBio(value);
                        validateField('bio', value);
                    }}
                    placeholder="Zadej popis útulku..."
                    maxCharacters={500}
                    containerClassName="pt-10 px-4"
                    inputClassName={`text-white mt-8 ${errors.bio ? 'border-red-500' : ''}`}
                />
                {renderError('bio')}

                <UploadImage
                    onUploadSuccess={handleImageUploadSuccess}
                    onDeleteSuccess={handleImageDeleteSuccess}
                    containerClassName="pt-10 px-4"
                    inputClassName="text-white mt-8 gap-1"
                    isShelter={true}
                />
                {renderError('images')}

                <ThemedView className="w-full bg-primary pt-10 px-4">
                    <SubmitButton title="POTVRDIT"
                                  handlePress={handleSubmit}
                                  buttonColorKey="secondary"
                    />
                </ThemedView>
            </Animated.ScrollView>
        </ParallaxScrollView>
    );
};

export default RegisterShelter;
