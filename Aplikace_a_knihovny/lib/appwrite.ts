import {Account, Client, Databases, ID, Query, Storage} from "react-native-appwrite";
import {Models} from "node-appwrite";



export const config = {
    endpoint: process.env.APPWRITE_ENDPOINT, // Use the API endpoint
    project: process.env.APPWRITE_PROJECT_ID,
    platform: process.env.APPWRITE_PLATFORM_ID,
    database: process.env.APPWRITE_DATABASE_ID,
    userCollectionId: process.env.APPWRITE_USER_COLLECTION_ID,
    shelterCollectionId: process.env.APPWRITE_SHELTER_COLLECTION_ID,
    shelterImagesCollectionId: process.env.APPWRITE_SHELTER_IMAGES_COLLECTION_ID,
    shelterImagesStorageId: process.env.APPWRITE_SHELTER_STORAGE_ID,
    regionCollectionId: process.env.APPWRITE_REGION_COLLECTION_ID,
    districtCollectionId: process.env.APPWRITE_DISTRICT_COLLECTION_ID,
    sizeCollectionId: process.env.APPWRITE_SIZE_COLLECTION_ID,
    typeCollectionId: process.env.APPWRITE_TYPE_COLLECTION_ID,
    breedCollectionId: process.env.APPWRITE_BREED_COLLECTION_ID,
    petCollectionId: process.env.APPWRITE_PET_COLLECTION_ID,
    petImageCollectionId: process.env.APPWRITE_PET_IMAGE_COLLECTION_ID,
    currenciesCollectionId: process.env.APPWRITE_CURRENCIES_COLLECTION_ID,
    shelterStorage: process.env.APPWRITE_SHELTER_STORAGE_ID,
    petStorage: process.env.APPWRITE_PET_STORAGE_ID,
    userPetActionsCollectionId: process.env.APPWRITE_USER_PET_ACTIONS_COLLECTION_ID,

};

const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.project)
    .setPlatform(config.platform);

const account = new Account(client);
const storage = new Storage(client);
const databases = new Databases(client);

export interface UserDocument extends Models.Document {
    email: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    is_shelter: boolean;
}
export interface UserInterface {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    birthDate: string,
    isShelter: boolean,
    userId?:string,
}
export interface ShelterDocument extends Models.Document {
    registration_id: string,
    name: string,
    street: string,
    postal_code: string,
    city: string,
    region: string,
    country: string,
    founded: number,
    pet_count: number,
    num_pets_adopted: number,
    phone: number,
    bio: string,
    owner: string,
    shelterId?: string
}
export interface ShelterDocumentNavigation extends Models.Document {
    registration_id: string,
    name: string,
    street: string,
    postal_code: string,
    city: string,
    region: string,
    country: string,
    founded: number,
    pet_count: number,
    num_pets_adopted: number,
    phone: number,
    bio: string,
    owner: UserDocument,
    shelterId?: string
}
export interface PetsDocument extends Models.Document {
    type: string,
    name: string,
    pet_identificator: string,
    gender: number,
    birth_date: string,
    size: string,
    placement_date: string,
    vaccination: boolean,
    deworming: boolean,
    chipping: boolean,
    castration: boolean,
    handicap: boolean,
    handicap_description: string,
    description: string,
    adoption_fee: number,
    currency: string,
    shelter: string,
    weight: number,
    crossbreed: boolean,
    is_visible: boolean,
}
export interface PetsDocumentNavigation extends Models.Document {
    type: { type: string },
    name: string,
    pet_identificator: string,
    gender: number,
    birth_date: string,
    size?: { size?: string, size_type?: string, $id?: string },
    placement_date: string,
    vaccination: boolean,
    deworming: boolean,
    chipping: boolean,
    castration: boolean,
    handicap: boolean,
    handicap_description: string,
    description: string,
    adoption_fee: number,
    currency: string,
    shelter: ShelterDocumentNavigation,
    weight: number,
    crossbreed: boolean,
    is_visible: boolean,
}
export interface UserPetActionsInput extends Models.Document {
    action: boolean,
    created_at: string,
    user: UserDocument,
    pet: PetsDocument,
}
interface FileStructre {
    uri: string;
    mimeType: "image" | "video" | "livePhoto" | "pairedVideo" | string;
    fileName: string;
    fileSize: number;
    type: string;
}
export interface UploadedFileInfo {
    fileId: string;
    fileUrl: string;
    storageId: string;
    slotIndex: number;
}
export interface PetTypesDocument extends Models.Document{
    type: string,
}
export interface BreedDocument extends Models.Document{
    id: string;
    breed: string;
    type: PetTypesDocument;
}
interface RegisterShelterInput {
    shelterName: string,
    registrationId: string,
    street: string,
    postalCode: string,
    city: string,
    region: string,
    country: string,
    founded: string,
    petCount: string,
    numPetsAdopted: string,
    phone: string,
    bio: string,
    uploadedImages: UploadedFileInfo[],
    shelterId?: string,
}
interface RegisterPetInput {
    selectedTypeValue: string;
    petName: string;
    registrationId: string;
    gender: string;
    finalYear: string; // Format: YYYY-MM-DD
    selectedSize: string;
    founded: string; // Format: YYYY-MM-DD
    selectedBreed: string | string[];
    vaccination: string;
    deworming: string;
    chipping: string;
    castration: string;
    handicap: string;
    handicapText?: string;
    petText?: string;
    uploadedImages: UploadedFileInfo[];
    fee: number | null;
    selectedCurrency: string;
    weight: number | null;
    crossbreed: string;
    shelterId?: string;
    petId?: string;
    isVisible?: boolean;
}
interface CreateUserPetActionsInput {
    action: boolean,
    created_at: string,
    user: string,
    pet: string,
}

export async function registerUser(input: UserInterface) {
    try {
        const fullName = `${input.firstName} ${input.lastName}`;
        const userResponse = await account.create(ID.unique(), input.email, input.password, fullName);

        await signIn(input.email, input.password);

        const documentResponse = await databases.createDocument(
            config.database,
            config.userCollectionId,
            ID.unique(),
            {
                email: input.email,
                first_name: input.firstName,
                last_name: input.lastName,
                birth_date: input.birthDate,
                is_shelter: input.isShelter,
            }
        );
        return { userResponse, documentResponse };
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
}

export async function getCurrentUser() {
    try {
        const userData = await account.get(); // account.get() throws if no user session
        return userData;
    } catch (error) {
        console.error("No user logged in or error fetching user:", error);
        return null;
    }
}

export async function getAccount() {
    try {
        const currentAccount = await account.get();

        return currentAccount;
    } catch (error) {
        console.error("No user logged in or error fetching user:", error);
        return null;
    }
}

export const updateUserPassword = async (newPassword: string, currentPassword: string): Promise<void> => {
    try {
        await account.updatePassword(newPassword, currentPassword);
    } catch (error) {
        console.error("Error updating password:", error);
        throw error;
    }
};

export const updateUserEmail = async (email: string, password: string, userId: string): Promise<void> => {
    try {
        await account.updateEmail(email, password);

        await databases.updateDocument(
            config.database,
            config.userCollectionId,
            userId,
            {
                email: email,
            }
        );

    } catch (error) {
        console.error("Error updating email:", error);
        throw error;
    }
};

export const updateUserName = async (firstName: string, lastName: string, userId: string): Promise<void> => {
    try {
        // Update name in Appwrite account
        await account.updateName(`${firstName} ${lastName}`);

        await databases.updateDocument(
            config.database,
            config.userCollectionId,
            userId,
            {
                first_name: firstName,
                last_name: lastName,
            }
        );

    } catch (error) {
        console.error("Error updating user name:", error);
        throw error;
    }
};

export async function getCurrentUserFormCollection(): Promise<UserDocument | null> {
    try {
        const currentAccount = await getAccount();
        if (!currentAccount) throw new Error("No account found");

        // Query using email as unique identifier
        const userDocuments = await databases.listDocuments<UserDocument>(
            config.database,
            config.userCollectionId,
            [Query.equal("email", currentAccount.email)]
        );

        if (!userDocuments || !userDocuments.documents || userDocuments.documents.length === 0) {
            throw new Error("No user document found for email: " + currentAccount.email);
        }
        const userDoc = userDocuments.documents[0] as UserDocument;
        return userDoc;
    } catch (error) {
        console.error("Error in getCurrentUser:", error);
        return null;
    }
}

export async function signIn(email: string, password: string) {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        console.error("Error signing in:", error);
        return null;
    }
}

export async function logOut() {
    try {
        const session = await account.deleteSession("current");
        return session;
    } catch (error) {
        console.error("No user logged in or error fetching user:", error);
        return null;
    }
}

export async function deleteAccount() {
    try {
        // 1) Get the current user
        const currentUser = await account.get();
        if (!currentUser.$id) {
            throw new Error("No user is logged in.");
        }

        // 2) Try to list identities. If user has an OAuth identity, we can delete it.
        //    If user uses email/password, this array will likely be empty.
        const { identities } = await account.listIdentities();
        if (!identities || identities.length === 0) {
            // Probably an email/password user or no identities found

            await account.deleteSession("current");

            return;
        }


        // 4) Find the identity that matches the current user's $id
        const identity = identities.find((idObj) => idObj.userId === currentUser.$id);
        if (!identity) {
            // Remove session or doc as fallback
            await account.deleteSession("current");
            return;
        }

        // 5) We found an OAuth identity. We can delete that identity
        await account.deleteIdentity(identity.$id);

        // (Optional) remove user doc
        // e.g., await databases.deleteDocument(config.database, config.userCollectionId, docId);

        // (Optional) remove session
        await account.deleteSession("current");

    } catch (error) {
        console.error("Error removing user identity or cleaning up account:", error);
        throw error;
    }
}

export async function emailExists(email: string): Promise<boolean> {
    try {
        // Query the userCollectionId for documents where field "email" equals the provided email
        const response = await databases.listDocuments(
            config.database,
            config.userCollectionId,
            [Query.equal("email", email)]
        );

        // If at least 1 document is returned, it means the email exists
        return response.documents.length > 0;
    } catch (error) {
        console.error("Error checking if email exists:", error);
        throw error;
    }
}

export async function getCurrentUserBirthDate(): Promise<string | null> {
    try {
        // 1. Get the current user's account information
        const currentUser = await account.get();
        if (!currentUser) {
            throw new Error("No user is currently logged in");
        }

        // 2. Query the database for the user's document using their email
        const userDocuments = await databases.listDocuments(
            config.database,
            config.userCollectionId,
            [Query.equal("email", currentUser.email)]
        );

        // 3. Check if we found the user's document
        if (userDocuments.documents.length === 0) {
            return null;
        }

        // 4. Get the first matching document (should be only one per email)
        const userDocument = userDocuments.documents[0];
        const birthDate = userDocument.birth_date;

        if (!birthDate) {
            return null;
        }

        return birthDate;
    } catch (error) {
        console.error("Error fetching user's birth date:", error);
        throw new Error(`Failed to fetch birth date: ${String(error)}`);
    }
}

export async function getCurrentUserName(): Promise<string | null> {
    try {
        // 1. Get the current user's account information
        const currentUser = await account.get();
        if (!currentUser) {
            throw new Error("No user is currently logged in");
        }

        // 2. Query the database for the user's document using their email
        const userDocuments = await databases.listDocuments(
            config.database,
            config.userCollectionId,
            [Query.equal("email", currentUser.email)]
        );

        // 3. Check if we found the user's document
        if (userDocuments.documents.length === 0) {
            return null;
        }

        // 4. Get the first matching document (should be only one per email)
        const userDocument = userDocuments.documents[0];
        const firstName = userDocument.first_name;
        const lastName = userDocument.last_name;

        if (!firstName || !lastName) {
            return null;
        }

        return `${firstName} ${lastName}`;
    } catch (error) {
        console.error("Error fetching user's name:", error);
        throw new Error(`Failed to fetch user's name: ${String(error)}`);
    }
}

export async function getCurrentUserEmail(): Promise<string | null> {
    try {
        // 1. Get the current user's account information
        const currentUser = await account.get();
        if (!currentUser) {
            throw new Error("No user is currently logged in");
        }

        return currentUser.email;
    } catch (error) {
        console.error("Error fetching user's email:", error);
        throw new Error(`Failed to fetch user's email: ${String(error)}`);
    }
}

export async function isRegisteredInShelter(): Promise<boolean> {
    try {
        let user = await getCurrentUserFormCollection();
        if (!user) {
            throw new Error("No user ID provided");
        }
        const response = await databases.listDocuments(
            config.database,
            config.shelterCollectionId,
            [Query.equal("owner", user.$id)]
        );
        return response.documents.length > 0;
    } catch (error) {
        console.error("Error checking if shelter exists:", error);
        throw error;
    }
}

export async function  registerShelter(input: RegisterShelterInput) {
    try {
        const currentUser = await getCurrentUserFormCollection();
        if (!currentUser) {
             throw new Error("No user is currently logged in");
        }

        const response = await databases.createDocument(
            config.database,
            config.shelterCollectionId,
            ID.unique(),
            {
                registration_id: input.registrationId,
                name: input.shelterName,
                street: input.street,
                postal_code: input.postalCode,
                city: input.city,
                region: input.region,
                country: input.country,
                founded: parseInt(input.founded, 10),
                pet_count: parseInt(input.petCount, 10),
                num_pets_adopted: parseInt(input.numPetsAdopted, 10),
                phone: parseInt(input.phone, 10),
                bio: input.bio,
                owner: currentUser.$id,
            }
        );
        for (const fileData of input.uploadedImages) {

            await createShelterImage(response.$id, fileData.fileUrl, fileData.storageId);
        }
        return response.$id;
    } catch (error) {
        console.error("Error registering shelter:", error);
        throw error;
    }
}

export async function  updateShelter(input: RegisterShelterInput) {
    try {
        const currentUser = await getCurrentUserFormCollection();
        if (!currentUser || !input.shelterId) {
             throw new Error("No user or shelter ID is provided");
        }

        const response = await databases.updateDocument(
            config.database,
            config.shelterCollectionId,
            input.shelterId,
            {
                registration_id: input.registrationId,
                name: input.shelterName,
                street: input.street,
                postal_code: input.postalCode,
                city: input.city,
                region: input.region,
                country: input.country,
                founded: parseInt(input.founded, 10),
                pet_count: parseInt(input.petCount, 10),
                num_pets_adopted: parseInt(input.numPetsAdopted, 10),
                phone: parseInt(input.phone, 10),
                bio: input.bio,
                owner: currentUser.$id,
            }
        );

        await deleteShelterImageByShelterId(input.shelterId);

        for (const fileData of input.uploadedImages) {
            await createShelterImage(response.$id, fileData.fileUrl, fileData.storageId);
        }
        return response.$id;
    } catch (error) {
        console.error("Error updating shelter:", error);
        throw error;
    }
}

export async function uploadShelterFile(file: FileStructre, type: "image" | "video"): Promise<{ fileUrl: URL; fileId: string; storageId: string }> {
    if (!file) {
        throw new Error("No file provided");
    }

    const { mimeType, fileName, fileSize, uri } = file;
    const asset = { name: fileName, type: mimeType, size: fileSize, uri };

    try {
        const uploadedFile = await storage.createFile(config.shelterStorage, ID.unique(), asset);
        const fileUrl = await getFilePreview(uploadedFile.$id, type, true);
        return {fileUrl: fileUrl, fileId: "", storageId: uploadedFile.$id};
    } catch (error: any) {
        throw new Error(error?.message || "Error uploading file");
    }
}

export async function uploadPetFile(file: FileStructre, type: "image" | "video"): Promise<{ fileUrl: URL; fileId: string, storageId: string }> {
    if (!file) {
        console.error("DEBUG: No file provided.");
        throw new Error("No file provided");
    }

    const { mimeType, fileName, fileSize, uri } = file;
    const asset = { name: fileName, type: mimeType, size: fileSize, uri };
    try {
        const uploadedFile = await storage.createFile(config.petStorage, ID.unique(), asset);
        const fileUrl = await getFilePreview(uploadedFile.$id, type, false);
        return {fileUrl: fileUrl, fileId: "", storageId: uploadedFile.$id};
    } catch (error: any) {
        throw new Error(error?.message || "Error uploading file");
    }
}

export async function deleteFile(storageId: string, fileId: string | undefined, isShelter: boolean) {
    try {
        storageId && await storage.deleteFile(isShelter ? config.shelterStorage : config.petStorage, storageId);
        if (fileId !== undefined && fileId !== "" && fileId != null) {
            await databases.deleteDocument(config.database, isShelter ? config.shelterImagesCollectionId : config.petImageCollectionId, fileId);
        }
    } catch (error: any) {
        throw new Error(error?.message || "Error deleting file");
    }
}

export async function getFilePreview(fileId: string, type: "image" | "video", isShelter: boolean): Promise<URL> {
    let fileUrl:URL;

    try {
        if (type === "video") {
            fileUrl = storage.getFileView(isShelter ? config.shelterStorage : config.petStorage, fileId);
        } else if (type === "image") {
            fileUrl = storage.getFilePreview(
                isShelter ? config.shelterStorage : config.petStorage,
                fileId,
                450,      // use your card width
                800,     // use your card height
                // @ts-ignore
                "center", // gravity (optional)
                100, // quality (optional)

            )
        } else {
            throw new Error("Invalid file type");
        }

        if (!fileUrl) {
            throw new Error("No file URL returned");
        }

        return fileUrl;
    } catch (error: any) {
        console.error("DEBUG: Error generating preview:", error?.message);
        throw new Error(error?.message || "Error generating file preview");
    }
}

export async function createShelterImage(
    shelterId: string,
    fileUrl: string,
    storageId: string
): Promise<string> {
    try {
        const response = await databases.createDocument(
            config.database,              // e.g., your DB ID
            config.shelterImagesCollectionId, // e.g., a "ShelterImages" collection
            ID.unique(),
            {
                shelter: shelterId,
                image: fileUrl,
                storage_id: storageId
            }
        );
        return response.$id;
    } catch (error: any) {
        console.error("Error creating shelter image document:", error?.message);
        throw new Error(error?.message || "Failed to create shelter image document");
    }
}

export async function getSizeByType(type: string): Promise<Models.DocumentList<Models.Document>> {
    try {
        const response = await databases.listDocuments(
            config.database,
            config.sizeCollectionId,
            [Query.equal("pet_type", type)]
        );
        return response
    } catch (error) {
        console.error("Error checking if email exists:", error);
        throw error;
    }
}

export async function getTypes(): Promise<Models.DocumentList<Models.Document>> {
    try {
        const response = await databases.listDocuments(
            config.database,
            config.typeCollectionId,
        );
        return response
    } catch (error) {
        console.error("Error getting types:", error);
        throw error;
    }
}

export async function getBreeds(type: string): Promise<Models.DocumentList<BreedDocument>> {
    try {
        return await databases.listDocuments<BreedDocument>(
            config.database,
            config.breedCollectionId,
            [Query.equal("type", type),
                Query.limit(400)

            ]
        )
    } catch (error) {
        console.error("Error getting breeds:", error);
        throw error;
    }
}

export async function getTypeByName(type: string): Promise<Models.DocumentList<Models.Document>> {
    try {
        if (!type){
            throw new Error("No pet is currently logged in");
        }
        const response = await databases.listDocuments(
            config.database,
            config.typeCollectionId,
            [Query.equal("type", type)]
        );
        return response
    } catch (error) {
        console.error("Error getting type by name", error);
        throw error;
    }
}

export async function getCurrencies(): Promise<Models.DocumentList<Models.Document>> {
    try {
        const response = await databases.listDocuments(
            config.database,
            config.currenciesCollectionId,
        );
        return response
    } catch (error) {
        console.error("Error checking if email exists:", error);
        throw error;
    }
}

export async function getRegions(): Promise<Models.DocumentList<Models.Document>> {
    try {
        const response = await databases.listDocuments(
            config.database,
            config.regionCollectionId,
        );
        return response
    } catch (error) {
        console.error("Error checking if email exists:", error);
        throw error;
    }
}

export async function registerPet(input: RegisterPetInput): Promise<string> {
    try {
        const shelter = await getCurrentShelter();
        if (!shelter) {
            throw new Error("No shelter is currently logged in");
        }
        const response = await databases.createDocument(
            config.database,
            config.petCollectionId,
            ID.unique(),
            {
                type: input.selectedTypeValue,
                name: input.petName,
                pet_identificator: input.registrationId,
                gender: input.gender == "male" ? 1 : 0,
                birth_date: input.finalYear,
                size: input.selectedSize,
                placement_date: input.founded,
                vaccination: input.vaccination == "true",
                deworming: input.deworming == "true",
                chipping: input.chipping == "true",
                castration: input.castration == "true",
                handicap: input.handicap == "true",
                handicap_description: input.handicapText || "",
                description: input.petText || "",
                adoption_fee: input.fee,
                currency: input.selectedCurrency,
                shelter: shelter.$id,
                weight: input.weight,
                crossbreed: input.crossbreed == "true",
                breed: input.selectedBreed,
            }
        );

        for (const fileData of input.uploadedImages) {

            await createPetImage(response.$id, fileData.fileUrl, fileData.storageId);
        }

        return response.$id;
    } catch (error: any) {
        console.error("Error registering pet:", error);
        throw new Error(error.message || "Failed to register pet");
    }
}

export async function updatePet(input: RegisterPetInput): Promise<string> {
    try {
        // const shelter = await getCurrentShelter();
        if (!input.petId) {
            throw new Error("No shelter is currently logged in");
        }
        const response = await databases.updateDocument(
            config.database,
            config.petCollectionId,
            input.petId,
            {
                type: input.selectedTypeValue,
                name: input.petName,
                pet_identificator: input.registrationId,
                gender: input.gender == "male" ? 1 : 0,
                birth_date: input.finalYear,
                size: input.selectedSize,
                placement_date: input.founded,
                vaccination: input.vaccination == "true",
                deworming: input.deworming == "true",
                chipping: input.chipping == "true",
                castration: input.castration == "true",
                handicap: input.handicap == "true",
                handicap_description: input.handicapText || "",
                description: input.petText || "",
                adoption_fee: input.fee,
                currency: input.selectedCurrency,
                shelter: input.shelterId,
                weight: input.weight,
                crossbreed: input.crossbreed == "true",
            }
        );

        await deletePetImageByPetId(input.petId);

        for (const fileData of input.uploadedImages) {
            await createPetImage(response.$id, fileData.fileUrl, fileData.storageId);
        }

        return response.$id;
    } catch (error: any) {
        console.error("Error registering pet:", error);
        throw new Error(error.message || "Failed to register pet");
    }
}

export async function invisiblePet(petId: string): Promise<void> {
    try {
        if (!petId) {
            throw new Error("No petId is in invisiblePet function");
        }
        await databases.updateDocument(
            config.database,
            config.petCollectionId,
            petId,
            {
                is_visible: false
            }
        );
    } catch (error: any) {
        console.error("Error invisibeling pet:", error);
        throw new Error(error.message || "Failed to invisible pet");
    }
}

export async function visiblePet(petId: string): Promise<void> {
    try {
        if (!petId) {
            throw new Error("No petId is in visiblePet function");
        }

        await databases.updateDocument(
            config.database,
            config.petCollectionId,
            petId,
            {
                is_visible: true
            }
        );
    } catch (error: any) {
        console.error("Error visibeling pet:", error);
        throw new Error(error.message || "Failed to nvisible pet");
    }
}

export async function deletePet(petId: string): Promise<void> {
    try {
        if (!petId) {
            throw new Error("No petId is in deletePet function");
        }

        await databases.deleteDocument(
            config.database,
            config.petCollectionId,
            petId,
        );

        const images = await getArrayImagesByPetID(petId);
        if (images){
            for (const image of images) {
                deleteFile(image.storageId, image.fileId, false)

            }
        }


    } catch (error: any) {
        console.error("Error deleting pet:", error);
        throw new Error(error.message || "Failed to deleting pet");
    }
}

async function createPetImage(petId: string, fileUrl: string, storageId: string) {
    try {
        let imageResponse = await databases.createDocument(
            config.database,
            config.petImageCollectionId,
            ID.unique(),
            {
                pet: petId,
                image: fileUrl,
                storage_id: storageId
            }
        );
    } catch (error: any) {
        console.error("Error saving pet image:", error);
    }
}

async function deletePetImageByPetId(petId: string) {
    try {
        const images = await databases.listDocuments(
            config.database,
            config.petImageCollectionId,
            [Query.equal("pet", petId)]
        );

        for (const image of images.documents) {
            await databases.deleteDocument(
                config.database,
                config.petImageCollectionId,
                image.$id
            );
        }
    } catch (error: any) {
        console.error("Error deleting pet images:", error.message);
    }
}

async function deleteShelterImageByShelterId(shelterId: string) {
    try {
        const images = await databases.listDocuments(
            config.database,
            config.shelterImagesCollectionId,
            [Query.equal("shelter", shelterId)]
        );

        for (const image of images.documents) {
            await databases.deleteDocument(
                config.database,
                config.shelterImagesCollectionId,
                image.$id
            );
        }
    } catch (error: any) {
        console.error("Error deleting shelter images:", error.message);
    }
}

export async function getCurrentShelter() : Promise<ShelterDocument | null>  {
    try {
        const user = await getCurrentUserFormCollection();
        if (!user) {
            throw new Error("No user is currently logged in");
        }
        const response = await databases.listDocuments<ShelterDocument>(
            config.database,
            config.shelterCollectionId,
            [Query.equal("owner", user.$id)]
        );
        return response.documents[0];
    } catch (error) {
        console.error("Error checking if email exists:", error);
        throw error;
    }
}

export async function getPetsByShelterID(): Promise<PetsDocument[] | null>  {
    try {
        const shelter = await getCurrentShelter();
        if (!shelter) {
            throw new Error("No shelter is currently logged in");
        }
        const response = await databases.listDocuments<PetsDocument>(
            config.database,
            config.petCollectionId,
            [Query.equal("shelter", shelter.$id)]
        );
        return response.documents;
    } catch (error) {
        console.error("Error checking if email exists:", error);
        throw error;
    }
}

export async function getShelterByPetID(shelterId: string): Promise<ShelterDocument | null>  {
    try {
        if (!shelterId) {
            throw new Error("No shelter is currently logged in");
        }
        const response = await databases.listDocuments<ShelterDocument>(
            config.database,
            config.shelterCollectionId,
            [Query.equal("$id", shelterId)]
        );

        return response.documents[0];
    } catch (error) {
        console.error("Error no shleter ", error);
        throw error;
    }
}

export async function getShelterByUserID(user: string): Promise<ShelterDocument | null>  {
    try {
        if (!user) {
            throw new Error("No shelter is currently logged in");
        }
        const response = await databases.listDocuments<ShelterDocument>(
            config.database,
            config.shelterCollectionId,
            [Query.equal("owner", user)]
        );
        return response.documents[0];
    } catch (error) {
        console.error("Error no shleter ", error);
        throw error;
    }
}

export async function getPets(): Promise<PetsDocument[] | null>  {
    try {
        const response = await databases.listDocuments<PetsDocument>(
            config.database,
            config.petCollectionId,
        );
        return response.documents;
    } catch (error) {
        console.error("Error checking if email exists:", error);
        throw error;
    }
}

export async function getPetByID(petId: string ): Promise<PetsDocument | null>  {
    try {
        if (!petId){
            throw new Error("No pet is currently logged in");
        }
        const response = await databases.listDocuments<PetsDocument>(
            config.database,
            config.petCollectionId,
            [Query.equal("$id", petId)]
        );
        return response.documents[0];
    } catch (error) {
        console.error("No pet found", error);
        throw error;
    }
}

export async function getPetDetailByID(petId: string ): Promise<PetsDocumentNavigation | null>  {
    try {
        if (!petId){
            throw new Error("No pet is currently logged in");
        }
        const response = await databases.listDocuments<PetsDocumentNavigation>(
            config.database,
            config.petCollectionId,
            [Query.equal("$id", petId)]
        );
        return response.documents[0];
    } catch (error) {
        console.error("No pet found", error);
        throw error;
    }
}

export async function getImageByPetID(petId: string): Promise<{ fileId: string; fileUrl: string, storageId: string }[]> {
    try {
        const response = await databases.listDocuments(
            config.database,
            config.petImageCollectionId,
            [Query.equal("pet", petId)]
        );
        return response.documents.map((doc) => ({
            fileId: doc.$id,
            fileUrl: doc.image,
            storageId: doc.storage_id
        }));
    } catch (error) {
        console.error("Error checking if email exists:", error);
        throw error;
    }
}

export async function getArrayImagesByPetID(petId: string): Promise<{ fileId: string; image: string, storageId: string }[]> {
    try {
        const response = await databases.listDocuments(
            config.database,
            config.petImageCollectionId,
            [Query.equal("pet", petId)]
        );


        return response.documents.map((doc) => ({
            fileId: doc.$id,
            image: doc.image,
            storageId: doc.storage_id
        }));
    } catch (error) {
        console.error("Error fetching pet images:", error);
        return [];
    }
}

export async function getImageByShelerID(shelterId: string): Promise<{ fileId: string; fileUrl: string, storageId: string }[]> {
    try {
        const response = await databases.listDocuments(
            config.database,
            config.shelterImagesCollectionId,
            [Query.equal("shelter", shelterId)]
        );
        return response.documents.map((doc) => ({
            fileId: doc.$id,
            fileUrl: doc.image,
            storageId: doc.storage_id
        }));
    } catch (error) {
        console.error("Error checking if email exists:", error);
        throw error;
    }
}

export async function createPetAction(input: CreateUserPetActionsInput) {
    try {

        const response = await databases.createDocument(
            config.database,
            config.userPetActionsCollectionId,
            ID.unique(),
            {
                action: input.action,
                created_at: input.created_at,
                user: input.user,
                pet: input.pet,
            }
        );
    } catch (error: any) {
        throw new Error(error.message || "Failed to pet action");
    }
}

export async function getLikedPets(user: string): Promise<UserPetActionsInput[]> {
    try {

        const response = await databases.listDocuments<UserPetActionsInput>(
            config.database,
            config.userPetActionsCollectionId,
            [Query.equal("user", user),
            Query.equal("action", true)]
        );
        return response.documents;
    } catch (error: any) {
        throw new Error(error.message || "Failed to pet action");
    }
}

export async function getPetAction(user: string, petId: string): Promise<UserPetActionsInput> {
    try {

        const response = await databases.listDocuments<UserPetActionsInput>(
            config.database,
            config.userPetActionsCollectionId,
            [Query.equal("user", user),
            Query.equal("pet", petId)]
        );
        return response.documents[0];
    } catch (error: any) {
        throw new Error(error.message || "Failed to pet action");
    }
}

export async function deletePetAction(user: string, petId: string): Promise<void> {
    try {
        let action = await getPetAction(user, petId)

        const response = await databases.deleteDocument(
            config.database,
            config.userPetActionsCollectionId,
            action.$id
        );
    } catch (error: any) {
        throw new Error(error.message || "Failed to pet action");
    }
}
