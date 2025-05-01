import React, {useEffect, useState} from "react";
import {ThemedView} from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import {SubmitButton} from "@/components/buttons/SubmitButton";
import BackButton from "@/components/buttons/BackButton";
import CustomTextInput from "@/components/forms/CustomTextInput";
import Animated, {useAnimatedRef,} from 'react-native-reanimated';
import CustomTextArea from "@/components/forms/CustomTextArea";
import {
    getArrayImagesByPetID,
    getCurrencies,
    getSizeByType,
    updatePet
} from "@/lib/appwrite";
import {Alert} from "react-native";
import UploadImage from "@/components/forms/UploadImage";
import CustomDropDownMenu from "@/components/forms/CustomDropDownMenu";
import TwoOptionToggle from "@/components/forms/TwoOptionToggle";
import {ThemedText} from "@/components/ThemedText";
import CustomDateInput from "@/components/forms/CustomDateInput";
import {router} from "expo-router";
import {RouteProp, useRoute} from "@react-navigation/native";
import {ModalStackParamList} from "@/components/navigation/navigation";
import {dateParser, extractDateParts, getYearOptions} from "@/utils/dateUtils";
import {validatePetRegistration} from "@/utils/validation";

type UploadedFileInfo = { fileId: string; fileUrl: string; storageId: string; slotIndex: number };

interface PetType {
    type: string
    $id: string
}
interface PetSize {
    $id: string
}
interface Shelter {
    $id: string
}

const UpdatePet: React.FC = () => {

    const route = useRoute<RouteProp<ModalStackParamList, 'UpdatePet'>>();
    const {pet, image} = route.params;

    const [petName, setPetName] = useState(pet.name);
    const [registrationId, setRegistrationId] = useState(pet.pet_identificator);
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [gender, setGender] = useState(pet.gender === 1 ? "male" : "female");
    const [foundDay, setFoundDay] = useState("");
    const [foundMonth, setFoundMonth] = useState("");
    const [foundYear, setFoundYear] = useState("");
    const [selectedBreed, setSelectedBreed] = useState<string | string[]>("");
    const [vaccination, setVaccination] = useState(pet.vaccination ? "true" : "false");
    const [deworming, setdeworming] = useState(pet.deworming ? "true" : "false");
    const [chipping, setChipping] = useState(pet.chipping ? "true" : "false");
    const [castration, setCastration] = useState(pet.castration ? "true" : "false");
    const [handicap, setHandicap] = useState(pet.handicap ? "true" : "false");
    const [handicapText, setHandicapText] = useState(pet.handicap ? pet.handicap_description : "");
    const [petText, setPetText] = useState(pet.description);
    const [weight, setWeight] = useState(pet.weight?.toString() || '');
    const [uploadedImages, setUploadedImages] = useState<UploadedFileInfo[]>([]);
    const [fee, setFee] = useState<number | null>(pet.adoption_fee);

    const [type, setType] = useState<string | null>(null);
    const [typeId, setTypeId] = useState<string | null>(null);
    const [currencies, setCurrencies] = useState<{ label: string; value: string;}[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState("");
    const [crossbreed, setCrossbreed] = useState(pet.crossbreed ? "true" : "false");
    const [sizeOptions, setSizeOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectedSize, setSelectedSize] = useState("");
    const [shelterId, setShelterId] = useState("");
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const yearOptions = getYearOptions();

    useEffect(() => {
        async function fetchType() {
            if (pet && pet.type) {
                let typeData = pet.type as unknown as PetType;
                let sizeData = pet.size as unknown as PetSize;
                let shelterData = pet.shelter as unknown as Shelter;
                setType(typeData.type);
                setTypeId(typeData.$id);
                setShelterId(shelterData.$id);
                if (typeData.type) {
                    await fetchSizes(typeData.type);
                    setSelectedSize(sizeData.$id)
                }
            }
        }
        fetchType();
    }, []); // Type and Size data
    useEffect(() => {
        async function initCurrencies() {
            const types = await getCurrencies();
            const parsedCurrencies = types.documents.map((doc) => ({
                label: doc.currency,
                value: doc.$id,
            }));
            setCurrencies(parsedCurrencies);
            if (parsedCurrencies.length > 0) {
                setSelectedCurrency(parsedCurrencies[0].value);
            }
            //TODO EXTRA - match currency to user's country
        }
        initCurrencies();
    }, []); // Currencies
    useEffect(() => {
        if (pet.birth_date) {
            const { day, month, year } = extractDateParts(pet.birth_date)
            setMonth(month);
            setYear(year);
            if (pet.placement_date){
                const { day, month, year } = extractDateParts(pet.placement_date)
                setFoundDay(day);
                setFoundMonth(month);
                setFoundYear(year);
            }
        }
    }, []); // Extract dates
    useEffect(() => {
        async function loadUploadedImages() {
            let images = await getArrayImagesByPetID(pet.$id); // implement this
            setUploadedImages(
                images.map((img, idx) => ({
                    fileId: img.fileId,    // or actual file ID if available
                    fileUrl: img.image,
                    storageId: img.storageId,
                    slotIndex: idx            // <- this is what was missing
                }))
            );

        }

        loadUploadedImages();
    }, []); // Load images

    async function fetchSizes(typeDbId: string) {
        const sizes = await getSizeByType(typeDbId);
        const parsedSizes = sizes.documents.map((doc) => ({
            label: doc.size_type == "small" ? "Malý"+" "+doc.size : doc.size_type == "medium" ? "Střední"+" "+doc.size : doc.size_type == "large" ? "Velký"+" "+doc.size : "",
            value: doc.$id,
        }));
        setSizeOptions(parsedSizes);
        setSelectedSize("");
    }

    const validateField = (field: string, value: any) => {
        const formValues = {
            petName,
            month,
            year,
            foundDay,
            foundMonth,
            foundYear,
            handicap,
            handicapText,
            petText,
            weight,
            uploadedImages,
            selectedSize,
            crossbreed,
            [field]: value
        };
        const validationErrors = validatePetRegistration(formValues);

        // Update errors state, but only for this field
        setErrors((prev) => ({
            ...prev,
            [field]: validationErrors[field] || ''
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
                petName,
                month,
                year,
                foundDay,
                foundMonth,
                foundYear,
                handicap,
                handicapText,
                petText,
                weight,
                uploadedImages,
                selectedSize,
                crossbreed,
                type,
            };

            const validationErrors = validatePetRegistration(formValues);
            // If there are errors, update state and stop submission
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);

                Alert.alert("Chyba", "Formulář obsahuje chyby. Opravte je prosím a zkuste to znovu.");
                setIsSubmitting(false);
                return;
            }

            const finalYear = dateParser("1", month, year);
            const founded = dateParser(foundDay, foundMonth, foundYear);
            const weightValue = weight ? parseFloat(weight.replace(',', '.')) : null;

            if (!typeId){
                console.error("No type known")
                return
            }

             await updatePet({
                selectedTypeValue: typeId,
                petName,
                registrationId,
                gender,
                finalYear,
                selectedSize,
                founded,
                selectedBreed: selectedBreed ? selectedBreed : "",
                vaccination,
                deworming,
                chipping,
                castration,
                handicap,
                handicapText,
                petText,
                uploadedImages,
                fee,
                selectedCurrency,
                weight: weightValue,
                crossbreed,
                shelterId,
                petId: pet.$id
            });

            Alert.alert("Success", "Mazlíček byl úspěšně upraven.", [
                {
                    text: "OK",
                    onPress: () => {
                        router.replace("/(drawer)/PetManagement");
                    }
                }
            ]);
        } catch (error) {
            console.error("Error submitting pet update:", error);
            Alert.alert("Chyba", "Nepodařilo se upravit mazlíka.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const MonthsData = [
        {label: "Leden", value: "1"},
        {label: "Únor", value: "2"},
        {label: "Březen", value: "3"},
        {label: "Duben", value: "4"},
        {label: "Květen", value: "5"},
        {label: "Červen", value: "6"},
        {label: "Červenec", value: "7"},
        {label: "Srpen", value: "8"},
        {label: "Září", value: "9 "},
        {label: "Říjen", value: "10"},
        {label: "Listopad", value: "11"},
        {label: "Prosinec", value: "12"},
    ];

    const handleImageUploadSuccess = (info: UploadedFileInfo) => {
        // e.g. fileId, fileUrl, slotIndex
        // console.log("DEBUG: Image uploaded:", info);
        setUploadedImages((prev) => {
            // If the same slot index was used, replace it
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
                    label="Jméno mazlíka"
                    value={petName}
                    onChangeText={(value) => {
                        setPetName(value);
                        validateField('petName', value);
                    }}
                    placeholder="Jméno malzlíčka"
                    containerClassName="pt-10 px-4"
                    inputClassName={`text-white mt-8 ${errors.petName ? 'border-red-500' : ''}`}
                    keyboardType="default"
                />
                {renderError('petName')}

                <CustomTextInput label="Identifikační číslo mazlíka" value={registrationId} onChangeText={setRegistrationId} placeholder="identifikační číslo" containerClassName="pt-10 px-4" inputClassName="text-white mt-8" keyboardType="default" autoCapitalize="words" />

                <TwoOptionToggle
                    label="Pohlaví"
                    option1Label="Samec"
                    option1Value="male"
                    option2Label="Samice"
                    option2Value="female"
                    selectedValue={gender}
                    onChange={setGender}
                    containerClassName="px-4 mt-10"
                    inputClassName="text-white mt-8 flex flex-row"
                />

                <ThemedText type="title" className="pt-10 px-4">Datum narození</ThemedText>
                <ThemedView className="flex flex-row justify-between">
                    <CustomDropDownMenu
                        value={month}
                        onValueChange={(value) => {
                            setMonth(value);
                            validateField('birthDate', { month: value, year });
                        }}
                        data={MonthsData}
                        containerClassName="w-1/2 px-4"
                        inputClassName={`text-white ${errors.birthDate ? 'border-red-500' : ''}`}
                    />
                    <CustomDropDownMenu
                        value={year}
                        onValueChange={(value) => {
                            setYear(value);
                            validateField('birthDate', { month, year: value });
                        }}
                        data={yearOptions}
                        containerClassName="w-1/2 px-4"
                        inputClassName={`text-white ${errors.birthDate ? 'border-red-500' : ''}`}
                    />
                </ThemedView>
                {renderError('birthDate')}

                {type === "dog" && (
                    <>
                        <CustomDropDownMenu
                            label="Velikost"
                            value={selectedSize}
                            onValueChange={(value) => {
                                setSelectedSize(value);
                                validateField('selectedSize', value);
                            }}
                            data={sizeOptions}
                            containerClassName="px-4 mt-10"
                            inputClassName={`text-white mt-8 ${errors.selectedSize ? 'border-red-500' : ''}`}
                        />
                        {renderError('selectedSize')}
                    </>
                )}

                <CustomTextInput
                    label="Váha"
                    value={weight}
                    onChangeText={(text) => {
                        const normalized = text.replace(',', '.');
                        setWeight(normalized);
                        validateField('weight', normalized);
                    }}
                    placeholder="Váha v kg"
                    containerClassName="px-4 mt-10"
                    inputClassName={`text-white mt-8 ${errors.weight ? 'border-red-500' : ''}`}
                    keyboardType="numeric"
                />
                {renderError('weight')}

                <CustomDateInput
                    label="Datum nalezení"
                    platform="android"
                    day={foundDay}
                    setDay={(value) => {
                        setFoundDay(value)
                        validateField('foundDay', value)
                    }}
                    month={foundMonth}
                    setMonth={(value) => {
                        setFoundMonth(value)
                        validateField('foundMonth', value)
                    }}
                    year={foundYear}
                    setYear={(value) => {
                        setFoundYear(value)
                        validateField('foundYear', value)
                    }}
                    containerClassName="pt-10 px-4"
                    inputClassName="text-white mt-8"
                />
                {renderError('foundDate')}

                <TwoOptionToggle
                    label="Očkování"
                    option1Label="Ano"
                    option1Value="true"
                    option2Label="Ne"
                    option2Value="false"
                    selectedValue={vaccination}
                    onChange={setVaccination}
                    containerClassName="px-4 mt-10 flex-row justify-between items-center"
                    inputClassName="text-whiteflex flex-row"
                />
                <TwoOptionToggle
                    label="Odčervení"
                    option1Label="Ano"
                    option1Value="true"
                    option2Label="Ne"
                    option2Value="false"
                    selectedValue={deworming}
                    onChange={setdeworming}
                    containerClassName="px-4 mt-4 flex-row justify-between items-center"
                    inputClassName="text-whiteflex flex-row"
                />
                <TwoOptionToggle
                    label="čipování"
                    option1Label="Ano"
                    option1Value="true"
                    option2Label="Ne"
                    option2Value="false"
                    selectedValue={chipping}
                    onChange={setChipping}
                    containerClassName="px-4 mt-4 flex-row justify-between items-center"
                    inputClassName="text-whiteflex flex-row"
                />
                <TwoOptionToggle
                    label="Kastrování"
                    option1Label="Ano"
                    option1Value="true"
                    option2Label="Ne"
                    option2Value="false"
                    selectedValue={castration}
                    onChange={setCastration}
                    containerClassName="px-4 mt-4 flex-row justify-between items-center"
                    inputClassName="text-whiteflex flex-row"
                />
                <TwoOptionToggle
                    label="Handicap"
                    option1Label="Ano"
                    option1Value="true"
                    option2Label="Ne"
                    option2Value="false"
                    selectedValue={handicap}
                    onChange={setHandicap}
                    containerClassName="px-4 mt-4 flex-row justify-between items-center"
                    inputClassName="text-whiteflex flex-row"
                />
                {handicap === "true" && (
                    <>
                        <CustomTextArea
                            label="Popis handicapu"
                            value={handicapText}
                            onChangeText={(val) => {
                                setHandicapText(val)
                                validateField('handicapText', val);
                            }}
                            placeholder="Text pro popis handicapu . . ."
                            maxCharacters={500}
                            containerClassName="pt-10 px-4"
                            inputClassName="text-white mt-8"/>
                        {renderError('handicapText')}
                    </>
                )}

                <CustomTextArea
                    label="Popiš mě"
                    value={petText}
                    onChangeText={(val) => {
                        setPetText(val)
                        validateField('petText', val);
                    }}
                    placeholder="Napiš něco o mně . . ."
                    maxCharacters={500}
                    containerClassName="pt-10 px-4"
                    inputClassName="text-white mt-8"/>
                {renderError('petText')}

                <UploadImage
                    onUploadSuccess={(info) => {
                        handleImageUploadSuccess(info);
                        validateField('images', [...uploadedImages, info]);
                    }}
                    onDeleteSuccess={(info) => {
                        handleImageDeleteSuccess(info);
                        const updatedImages = uploadedImages.filter(img => img.slotIndex !== info.slotIndex);
                        validateField('images', updatedImages);
                    }}
                    containerClassName="pt-10 px-4"
                    inputClassName="text-white mt-8 gap-1"
                    isShelter={false}
                    initialImages={uploadedImages}

                />
                {renderError('images')}

                <ThemedText type="title" className="pt-10 px-4">Adopční poplatek</ThemedText>
                <ThemedView className="flex flex-row justify-between">
                    <CustomTextInput value={fee !== null ? fee.toString() : ""}
                                     onChangeText={(text) => {
                                         const numericValue = text ? parseFloat(text) : null;
                                         setFee(numericValue);
                                     }} placeholder="Částka"
                                     containerClassName="w-1/2 px-4"
                                     inputClassName="text-white"
                                     keyboardType="numeric"
                                     label=" "
                    />
                    <CustomDropDownMenu value={selectedCurrency} onValueChange={setSelectedCurrency} data={currencies.map((t) => ({ label: t.label, value: t.value }))} containerClassName="w-1/2 px-4" inputClassName="text-white" />
                </ThemedView>

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

export default UpdatePet;
