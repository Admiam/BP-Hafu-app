import React, {useEffect, useState} from "react";
import {ThemedView} from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import {SubmitButton} from "@/components/buttons/SubmitButton";
import BackButton from "@/components/buttons/BackButton";
import Animated, {useAnimatedRef,} from 'react-native-reanimated';
import {getBreeds, getRegions, getSizeByType, getTypeByName, getTypes} from "@/lib/appwrite";
import {Alert} from "react-native";
import CustomDropDownMenu from "@/components/forms/CustomDropDownMenu";
import TwoOptionToggle from "@/components/forms/TwoOptionToggle";
import {ThemedText} from "@/components/ThemedText";
import CustomMultipleDropdownMenu from "@/components/forms/CustomMultipleDropDown";
import {NavigationProp, RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import {
    FilterCriteria,
    ModalStackParamList,
    RootStackParamList,
    TabStackParamList
} from "@/components/navigation/navigation";
import ThreeOptionToggle from "@/components/forms/ThreeOptionToggle";
import NumberCounter from "@/components/forms/NumberCounter";


const Filter: React.FC = () => {
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const route = useRoute<RouteProp<ModalStackParamList, 'Filter'>>();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const {pet, navigateTo} = route.params;
    const [gender, setGender] = useState("all");
    const [selectedBreed, setSelectedBreed] = useState<{ label: string; value: string }[]>([]);
    const [vaccination, setVaccination] = useState("true");
    const [deworming, setdeworming] = useState("true");
    const [chipping, setChipping] = useState("true");
    const [castration, setCastration] = useState("true");
    const [handicap, setHandicap] = useState("false");
    const [type, setType] = useState("all");
    const [crossbreed, setCrossbreed] = useState("false");
    const [sizeOptions, setSizeOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectedSize, setSelectedSize] = useState("");
    const [regionData, setRegionData] = useState<{ label: string; value: string;}[]>([]);
    const [ageNumber, setAgeNumber] = useState<number>(0);
    const [dateType, setDateType] = useState("month");
    const [breeds, setBreeds] = useState<{ label: string; value: string }[]>([]);
    const [petTypes, setPetTypes] = useState<{ label: string; value: string; dbId: string }[]>([]);



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
    }, []); // Fetch regions on mount
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
    }) // Fetch pet types on mount
    useEffect(() => {
        const found = petTypes.find((t) => t.dbId === type);
        if (!found) {
            setSizeOptions([]);
            setBreeds([])
            setSelectedBreed([]);
            return;
        }
        fetchSizes(found.dbId);
        fetchBreeds(found.dbId);
    }, [type]); // Sizes

    // Fetch sizes and breeds when type changes
    async function fetchSizes(typeDbId: string) {
        const sizes = await getSizeByType(typeDbId);
        const parsedSizes = sizes.documents.map((doc) => ({
            label: doc.size_type == "small" ? "Malý"+" "+doc.size : doc.size_type == "medium" ? "Střední"+" "+doc.size : doc.size_type == "large" ? "Velký"+" "+doc.size : "",
            value: doc.$id,
        }));

        setSizeOptions(parsedSizes);
        setSelectedSize("");
    }

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

    // Handle form submission
    const handleSubmit = async () => {
        try {
            const filter: FilterCriteria = {
                type,
                gender,
                ageNumber,
                isMonth: dateType === "month",
                size: selectedSize,
                selectedBreeds: selectedBreed.map(b => b.value),
                crossbreed: crossbreed === "true",
                vaccination: vaccination === "true",
                deworming: deworming === "true",
                chipping: chipping === "true",
                castration: castration === "true",
                handicap: handicap === "true",
            };

            function isValidTabScreen(screen: string): screen is keyof TabStackParamList {
                return ['home', 'explore', 'matches', 'account'].includes(screen);
            }

            const validNavigateTo = isValidTabScreen(navigateTo) ? navigateTo : 'home';

            if (navigateTo === "PetManagement"){
                navigation.navigate('(drawer)', {
                    screen: 'PetManagement',
                    params: { filter }
                });
            }else {
                navigation.navigate('(drawer)', {
                    screen: '(tabs)',
                    params: {
                        screen: validNavigateTo,
                        params: {filter}
                    }
                });
            }
        } catch (error) {
            console.error("Error submitting shelter registration:", error);
            Alert.alert("Chyba", "Nepodařilo se registrovat útulek.");
        }
    };


    return (

        <ParallaxScrollView
            className="bg-primary h-screen"
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#000" }}
            headerImage={<></>}
        >
            <BackButton/>
            <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
                <ThreeOptionToggle
                    label="Typ"
                    option1Label="Vše"
                    option1Value="all"
                    option2Label="Psi"
                    option2Value="dog"
                    option3Label="Kočky"
                    option3Value="cat"
                    selectedValue={type}
                    onChange={setType}
                    containerClassName="px-4 mt-10"
                    inputClassName="text-white mt-8 flex flex-row"
                />
                <ThreeOptionToggle
                    label="Pohlaví"
                    option1Label="Vše"
                    option1Value="all"
                    option2Label="Samec"
                    option2Value="1"
                    option3Label="Samice"
                    option3Value="0"
                    selectedValue={gender}
                    onChange={setGender}
                    containerClassName="px-4 mt-10"
                    inputClassName="text-white mt-8 flex flex-row"
                />

                <ThemedText type="title" className="pt-10 px-4">Stáří mazlíka</ThemedText>
                <ThemedView className="flex flex-row justify-between">
                    <NumberCounter
                        value={ageNumber}
                        onChange={setAgeNumber}
                        containerClassName="px-4 mt-10"
                        buttonClassName="text-white flex flex-row"
                        textClassName="text-white"
                        min={0}
                        max={20}
                    />
                    <TwoOptionToggle
                        option1Label="Měsíc"
                        option1Value="month"
                        option2Label="Rok"
                        option2Value="year"
                        selectedValue={dateType}
                        onChange={setDateType}
                        containerClassName="px-4 mt-10"
                        inputClassName="text-white flex flex-row"
                    />
                </ThemedView>

                {type && type === "dog" && (
                    <CustomDropDownMenu label="Velikost" value={selectedSize} onValueChange={setSelectedSize} data={sizeOptions} containerClassName="px-4 mt-10" inputClassName="text-white mt-8" />
                )}
                {type && (type === "dog" || type === "cat") && (
                    <CustomMultipleDropdownMenu
                        label="Plemeno"
                        data={breeds}
                        value={selectedBreed}
                        crossbreed={crossbreed}
                        onValueChange={(val) =>  {
                            setSelectedBreed(Array.isArray(val) ? val : val ? [val] : [])
                        }}
                        onCrossbreedChange={(val) => setCrossbreed(val.toString())}
                        containerClassName="pt-10 px-4" inputClassName="text-white mt-8"
                    />
                )}

                <TwoOptionToggle
                    label="Očkování"
                    option1Label="Ano"
                    option1Value="true"
                    option2Label="Ne"
                    option2Value="false"
                    selectedValue={vaccination}
                    onChange={setVaccination}
                    containerClassName="px-4 mt-10 flex-row justify-between items-center"
                    inputClassName="text-white flex flex-row"
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
                    inputClassName="text-white flex flex-row"
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
                    inputClassName="text-white flex flex-row"
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
                    inputClassName="text-white flex flex-row"
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
                    inputClassName="text-white flex flex-row"
                />

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

export default Filter;
