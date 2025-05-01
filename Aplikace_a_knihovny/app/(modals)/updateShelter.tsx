import React, {useEffect, useState} from "react";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import { router } from "expo-router";
import BackButton from "@/components/buttons/BackButton";
import CustomTextInput from "@/components/forms/CustomTextInput";
import Animated, {
    useAnimatedRef,
} from 'react-native-reanimated';
import CustomTextArea from "@/components/forms/CustomTextArea";
import {
    getImageByShelerID,
    getRegions,
    updateShelter
} from "@/lib/appwrite";
import {Alert} from "react-native";
import {PlaceDetails} from "@/components/forms/CustomGeoSearch";
import UploadImage from "@/components/forms/UploadImage";
import {RouteProp, useRoute} from "@react-navigation/native";
import {ModalStackParamList} from "@/components/navigation/navigation";
import CustomDropDownMenu from "@/components/forms/CustomDropDownMenu";
import {validateShelterRegistration} from "@/utils/validation";
import {ThemedText} from "@/components/ThemedText";

type UploadedFileInfo = { fileId: string; fileUrl: string; slotIndex: number, storageId: string };

const UpdateShelter: React.FC = () => {
    const route = useRoute<RouteProp<ModalStackParamList, 'UpdateShelter'>>();
    const {shelter, images} = route.params;
    const [shelterName, setShelterName] = useState(shelter?.name || "");
    const [registrationId, setRegistrationId] = useState(shelter?.registration_id || "");
    const [street, setStreet] = useState(shelter?.street || "");
    const [postalCode, setPostalCode] = useState(shelter?.postal_code || "");
    const [city, setCity] = useState(shelter?.city || "");
    const [region, setRegion] = useState(shelter?.region || "");
    const [country, setCountry] = useState(shelter?.country || "");
    const [founded, setFounded] = useState(shelter?.founded.toString() || "");
    const [petCount, setPetCount] = useState(shelter?.pet_count.toString() || "");
    const [numPetsAdopted, setNumPetsAdopted] = useState(shelter?.num_pets_adopted.toString() || "");
    const [phone, setPhone] = useState(shelter?.phone.toString() || "");
    const [bio, setBio] = useState(shelter?.bio || "");
    const [shelterId, setShelterId] = useState<string | null>(null);
    const [uploadedImages, setUploadedImages] = useState<UploadedFileInfo[]>([]);
    const [regionData, setRegionData] = useState<{ label: string; value: string;}[]>([]);
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchRegions() {
            let regions = await getRegions();
            let persedRegions = regions.documents.map((doc) => ({
                label: doc.name,
                value: doc.name,
            }));
            setRegionData(persedRegions);
            setRegion(shelter?.region || "")
            if (shelter) {
                let imagesData = await getImageByShelerID(shelter.$id); // implement this
                setUploadedImages(
                    imagesData.map((img, idx) => ({
                        fileId: img.fileId,
                        fileUrl: img.fileUrl,
                        storageId: img.storageId,
                        slotIndex: idx
                    })))
            }
        }
        fetchRegions()
    }, []); //fetch regions on mount

    const scrollRef = useAnimatedRef<Animated.ScrollView>();

    // Add field validation function
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

        const validationErrors = validateShelterRegistration(formValues);

        // Update errors state for just this field
        setErrors(prev => ({
            ...prev,
            [field]: validationErrors[field] || null
        }));

        return validationErrors[field] || null;
    };

    // Render error message helper
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

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);

                // Create a list of error fields for the alert
                const errorFields = Object.keys(validationErrors).map(field => {
                    // Map technical field names to user-friendly names
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

            if (!shelter || !shelter.$id){
                console.error("No shelterId known")
                return
            }



            const id = await updateShelter({
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
                shelterId: shelter.$id,
            });
            setShelterId(id);

            Alert.alert("Success", "Útulek byl úspěšně registrován.");
            router.push("/home");
        } catch (error) {
            console.error("Error submitting shelter registration:", error);
            Alert.alert("Chyba", "Nepodařilo se registrovat útulek.");
        }
    };

    const handleSelectLocation = async (details: PlaceDetails) => {
        setStreet(details.street);
        validateField('street', details.street);

        setPostalCode(details.postalCode);
        validateField('postalCode', details.postalCode);

        setCity(details.city);
        validateField('city', details.city);

        setRegion(details.region);
        validateField('region', details.region);

        setCountry(details.country);
        validateField('country', details.country);
    };

    const handleImageUploadSuccess = (info: UploadedFileInfo) => {
        setUploadedImages((prev) => {
            const existing = [...prev];
            const existingIndex = existing.findIndex((x) => x.slotIndex === info.slotIndex);
            if (existingIndex >= 0) {
                existing[existingIndex] = info;
            } else {
                existing.push(info);
            }
            return existing;
        });
    };

    const handleImageDeleteSuccess = (info: { fileId: string; storageId: string; slotIndex: number }) => {
        setUploadedImages((prev) => {
            return prev.filter((img) => img.fileId !== info.fileId);
        });
    };

    return (
        <ParallaxScrollView
            className="bg-primary h-screen"
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#000" }}
            headerImage={<></>}
        >
            <BackButton/>

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
                    keyboardType="numeric"
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
                    initialImages={uploadedImages}
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

export default UpdateShelter;
