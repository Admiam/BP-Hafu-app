import React, {useEffect, useState} from "react";
import {ThemedView} from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import {SubmitButton} from "@/components/buttons/SubmitButton";
import BackButton from "@/components/buttons/BackButton";
import CustomTextInput from "@/components/forms/CustomTextInput";
import Animated, {useAnimatedRef,} from 'react-native-reanimated';
import CustomTextArea from "@/components/forms/CustomTextArea";
import {getBreeds, getCurrencies, getSizeByType, getTypeByName, getTypes, registerPet} from "@/lib/appwrite";
import {Alert} from "react-native";
import UploadImage from "@/components/forms/UploadImage";
import CustomDropDownMenu from "@/components/forms/CustomDropDownMenu";
import TwoOptionToggle from "@/components/forms/TwoOptionToggle";
import {ThemedText} from "@/components/ThemedText";
import CustomDateInput from "@/components/forms/CustomDateInput";
import CustomMultipleDropdownMenu from "@/components/forms/CustomMultipleDropDown";
import {format} from "date-fns";
import {router} from "expo-router";
import {getYearOptions} from "@/utils/dateUtils";
import {validatePetRegistration} from "@/utils/validation";


type UploadedFileInfo = { fileId: string; fileUrl: string; storageId: string, slotIndex: number };

const RegisterPet: React.FC = () => {
    const [petName, setPetName] = useState("");
    const [registrationId, setRegistrationId] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [gender, setGender] = useState("male");
    const [foundDay, setFoundDay] = useState("");
    const [foundMonth, setFoundMonth] = useState("");
    const [foundYear, setFoundYear] = useState("");
    const [selectedBreed, setSelectedBreed] = useState<{ label: string; value: string }[]>([]);
    const [vaccination, setVaccination] = useState("true");
    const [deworming, setdeworming] = useState("true");
    const [chipping, setChipping] = useState("true");
    const [castration, setCastration] = useState("true");
    const [handicap, setHandicap] = useState("false");
    const [handicapText, setHandicapText] = useState("");
    const [petText, setPetText] = useState("");
    const [weight, setWeight] = useState("");
    const [uploadedImages, setUploadedImages] = useState<UploadedFileInfo[]>([]);
    const [fee, setFee] = useState("");
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [petTypes, setPetTypes] = useState<{ label: string; value: string; dbId: string }[]>([]);
    const [currencies, setCurrencies] = useState<{ label: string; value: string;}[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState("");
    const [selectedTypeValue, setSelectedTypeValue] = useState("");
    const [selectedTypeDbId, setSelectedTypeDbId] = useState("");
    const [breeds, setBreeds] = useState<{ label: string; value: string }[]>([]);
    const [crossbreed, setCrossbreed] = useState("false");


    // 3) For the size dropdown, depends on type
    const [sizeOptions, setSizeOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectedSize, setSelectedSize] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const yearOptions = getYearOptions();
    const validateField = (field: string, value: any) => {
        const formValues = {
            petName,
            registrationId,
            month,
            year,
            gender,
            foundDay,
            foundMonth,
            foundYear,
            selectedBreed,
            vaccination,
            deworming,
            chipping,
            castration,
            handicap,
            handicapText,
            petText,
            weight,
            uploadedImages,
            fee,
            selectedCurrency,
            selectedTypeValue,
            selectedSize,
            crossbreed,
            // Include the new value
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

    function breedsToValue(selected: { label: string; value: string }[]): string[] {
        if (!selected || selected.length === 0) return [];
        return selected.map(b => b.value);
    }


    const handleSubmit = async () => {
        try {

            setIsSubmitting(true);

            // Validate all fields
            const formValues = {
                petName,
                registrationId,
                month,
                year,
                gender,
                foundDay,
                foundMonth,
                foundYear,
                selectedBreed,
                vaccination,
                deworming,
                chipping,
                castration,
                handicap,
                handicapText,
                petText,
                weight,
                uploadedImages,
                fee,
                selectedCurrency,
                selectedTypeValue,
                selectedSize,
                crossbreed,
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
            const feeValue = fee ? parseInt(fee) : null;

            const breedValue = breedsToValue(selectedBreed);


            await registerPet({
                selectedTypeValue,
                petName,
                registrationId,
                gender,
                finalYear,
                selectedSize,
                founded,
                selectedBreed: breedValue,
                vaccination,
                deworming,
                chipping,
                castration,
                handicap,
                handicapText,
                petText,
                uploadedImages,
                fee: feeValue,
                selectedCurrency,
                weight: weightValue,
                crossbreed,
            });


            Alert.alert("Success", "Mazlíček byl úspěšně registrován.", [
                {
                    text: "OK",
                    onPress: () => {
                        router.replace("/(drawer)/PetManagement");
                    }
                }
            ]);
        } catch (error) {
            console.error("Error submitting shelter registration:", error);
            Alert.alert("Chyba", "Nepodařilo se registrovat útulek.");
        } finally {
        setIsSubmitting(false);
        }
    };

    // Render error message for a specific field
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

    const MonthsData = [
        { label: "Leden", value: "1" },
        { label: "Únor", value: "2" },
        { label: "Březen", value: "3" },
        { label: "Duben", value: "4" },
        { label: "Květen", value: "5" },
        { label: "Červen", value: "6" },
        { label: "Červenec", value: "7" },
        { label: "Srpen", value: "8" },
        { label: "Září", value: "9 "},
        { label: "Říjen", value: "10" },
        { label: "Listopad", value: "11" },
        { label: "Prosinec", value: "12" },
    ];

    // Function to parse date and format it
    const dateParser = (day: string, month: string, year: string) => {
        const d = parseInt(day, 10) || 1;
        const m = parseInt(month, 10) - 1 || 1; // zero-based
        const y = parseInt(year, 10) || 2000;

        // Construct a real Date, then format
        const constructed = new Date(y, m, d);

        return format(constructed, "yyyy-MM-dd")
    }

    // Function to handle image upload success
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

    // Function to handle image delete success
    const handleImageDeleteSuccess = (info: { fileId: string; storageId: string; slotIndex: number }) => {
        setUploadedImages(prev => prev.filter(img => img.slotIndex !== info.slotIndex));
    };


    useEffect(() => {
        async function initPetTypes() {
            const types = await getTypes();
            const parsedTypes = types.documents.map((doc) => ({
                label: doc.type == "dog" ? "Pes" : doc.type == "cat" ? "Kočka" : "",
                value: doc.$id,
                dbId: doc.type,
            }));
            setPetTypes(parsedTypes);
        }
        initPetTypes();
    }, []); // Types
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
        const found = petTypes.find((t) => t.value === selectedTypeValue);
        if (!found) {
            setSelectedTypeDbId("");
            setSizeOptions([]);
            setBreeds([])
            setSelectedBreed([]);
            return;
        }
        setSelectedTypeDbId(found.dbId);
        fetchSizes(found.dbId);
        fetchBreeds(found.dbId);
    }, [selectedTypeValue]); // Sizes

    // Fetch sizes based on selected type
    async function fetchSizes(typeDbId: string) {
        const sizes = await getSizeByType(typeDbId);
        const parsedSizes = sizes.documents.map((doc) => ({
            label: doc.size_type == "small" ? "Malý"+" "+doc.size : doc.size_type == "medium" ? "Střední"+" "+doc.size : doc.size_type == "large" ? "Velký"+" "+doc.size : "",
            value: doc.$id,
        }));

        setSizeOptions(parsedSizes);
        setSelectedSize("");
    }

    // Fetch breeds based on selected type
    async function fetchBreeds(typeDbId: string) {
        const type = await getTypeByName(typeDbId);
        const breedsData = await getBreeds(type.documents[0].$id);
        const parsedBreeds = breedsData.documents.map((doc) => ({
            label: doc.breed,
            value: doc.$id,
        }));
         setBreeds(parsedBreeds);
        setSelectedBreed([]);
    }


    return (

        <ParallaxScrollView
            className="bg-primary h-screen"
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#000" }}
            headerImage={<></>}
        >
            <BackButton/>
            <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
                <CustomDropDownMenu label="Typ mazlíka" value={selectedTypeValue} onValueChange={setSelectedTypeValue} data={petTypes.map((t) => ({ label: t.label, value: t.value }))} containerClassName="px-4 mt-10" inputClassName="text-white mt-8" />

                {selectedTypeValue && (
                <>
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
                    <CustomTextInput label="Identifikační číslo mazlíka" value={registrationId} onChangeText={setRegistrationId} placeholder="identifikační číslo" containerClassName="pt-10 px-4" inputClassName="text-white mt-8" keyboardType="default" />

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

                    {selectedTypeValue == petTypes[0].value && (
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
                        onChangeText={(val) => {
                            validateField('weight', val);
                            setWeight(val);

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

                    <CustomMultipleDropdownMenu
                        label="Plemeno"
                        data={breeds}
                        value={selectedBreed}
                        onValueChange={(val) => {
                            setSelectedBreed(Array.isArray(val) ? val : val ? [val] : []);
                            validateField('breeds', val);
                        }}

                        onCrossbreedChange={(val) => setCrossbreed(val.toString())}
                        containerClassName="pt-10 px-4" inputClassName="text-white mt-8"
                    />
                    {renderError('breeds')}

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
                    />
                    {renderError('images')}

                    <ThemedText type="title" className="pt-10 px-4">Adopční poplatek</ThemedText>
                    <ThemedView className="flex flex-row justify-between">
                        <CustomTextInput value={fee}
                                         onChangeText={(val) => {
                                             setFee(val);
                                             validateField('fee', val);
                                         }} label=" " placeholder="Částka" containerClassName="w-1/2 px-4" inputClassName="text-white" keyboardType="numeric" />
                        <CustomDropDownMenu  value={selectedCurrency} onValueChange={setSelectedCurrency} data={currencies.map((t) => ({ label: t.label, value: t.value }))} containerClassName="w-1/2 px-4" inputClassName="text-white" />
                    </ThemedView>
                    {renderError('fee')}

                    <ThemedView className="w-full bg-primary pt-10 px-4">
                        <SubmitButton title="POTVRDIT"
                                      handlePress={handleSubmit}
                                      buttonColorKey="secondary"
                        />
                    </ThemedView>
                </>)}
            </Animated.ScrollView>
        </ParallaxScrollView>
    );
};

export default RegisterPet;
