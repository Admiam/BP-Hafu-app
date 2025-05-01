import {PetsDocument, PetsDocumentNavigation, ShelterDocument, UploadedFileInfo, UserDocument} from "@/lib/appwrite";

export type ModalStackParamList = {
    PetDetail: { pet: PetsDocumentNavigation, image: string };
    Filter: { pet: PetsDocument[], navigateTo: string };
    ShelterDetail: { shelterId: string, pet: PetsDocumentNavigation, image: string};
    ShelterPetDetail: { pet: PetsDocumentNavigation, image: string };
    UpdatePet: { pet: PetsDocument, image: string };
    UpdateShelter: { shelter: ShelterDocument | null, images: UploadedFileInfo[] };
    UpdateAccount: { user: UserDocument};
    ContactShelter: { pet: PetsDocumentNavigation};
    RegisterPet?: undefined;
};

export type RootStackParamList = {
    '(drawer)': {
        screen?: keyof DrawerParamList | '(tabs)';
        params?: {
            screen?: keyof TabStackParamList;
            filter?: FilterCriteria;
            params?: {
                filter?: FilterCriteria;
            };
        };
    };
    Modals: {
        screen: keyof ModalStackParamList;
        params?: ModalStackParamList[keyof ModalStackParamList];
    };
    '(auth)': {
        screen: keyof ModalStackAuthList;
    };
    NotFound?: undefined;
    Welcome?: undefined;
};

export type TabStackParamList = {
    home: { filter?: FilterCriteria };
    explore: { filter?: FilterCriteria };
    matches: { filter?: FilterCriteria };
    account: undefined;
};

export type ModalStackAuthList = {
    register_shelter: { filter?: FilterCriteria };
};

export type DrawerParamList = {
    PetManagement: { filter?: FilterCriteria };
};

export interface FilterCriteria {
    type: string;
    gender?: string;
    ageNumber?: number;
    isMonth?: boolean;
    size?: string;
    selectedBreeds?: string[];
    crossbreed?: boolean;
    vaccination?: boolean;
    deworming?: boolean;
    chipping?: boolean;
    castration?: boolean;
    handicap?: boolean;
}
