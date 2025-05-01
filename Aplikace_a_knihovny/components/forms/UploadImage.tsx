import React, {useEffect, useRef, useState} from "react";
import {
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ThemedText } from "@/components/ThemedText";
import { deleteFile, uploadShelterFile, uploadPetFile } from "@/lib/appwrite";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import Entypo from "@expo/vector-icons/Entypo";
import * as ImageManipulator from "expo-image-manipulator";

/** Generate a unique ID for each slot so we can use it as the React key. */
function generateId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return "slot-" + Math.random().toString(16).slice(2);
}

interface ImageSlot {
    /** A stable unique ID so React can correctly reorder the slots */
    id: string;
    previewUrl?: string;
    fileId?: string;
    storageId?: string;
}

interface UploadImageProps {
    maxSlots?: number;
    onUploadSuccess?: (info: {
        fileId: string;
        fileUrl: string;
        storageId: string;
        slotIndex: number;
    }) => void;
    onDeleteSuccess?: (info: {
        fileId: string;
        storageId: string;
        slotIndex: number;
    }) => void;
    inputClassName: string;
    containerClassName: string;
    isShelter: boolean;
    initialImages?: { fileId: string; fileUrl: string; storageId: string }[];
}

export default function UploadImage({
                                        maxSlots = 6,
                                        onUploadSuccess,
                                        onDeleteSuccess,
                                        inputClassName,
                                        containerClassName,
                                        isShelter,
                                        initialImages,
                                    }: UploadImageProps) {
    const theme = useColorScheme() ?? "light";

    // Initialize state with maxSlots empty slots, each with a unique id.
    const [slots, setSlots] = useState<ImageSlot[]>(
        Array.from({ length: maxSlots }, () => ({
            id: generateId(),
        }))
    );


    // Use a ref to ensure the initial state is loaded only once.
    const initialLoadRef = useRef(false);

    useEffect(() => {
            if (!initialLoadRef.current){
                if (initialImages && initialImages.length > 0) {
                    const filledSlots = initialImages.map((img) => ({
                        id: generateId(),
                        previewUrl: img.fileUrl,
                        fileId: img.fileId,
                        storageId: img.storageId,
                    }));
                    const emptySlots = Array.from({ length: maxSlots - filledSlots.length }, () => ({
                        id: generateId(),
                    }));
                    setSlots([...filledSlots, ...emptySlots]);
                } else {
                    setSlots(
                        Array.from({ length: maxSlots }, () => ({
                            id: generateId(),
                        }))
                    );
                }
            }
            return;
    }, [initialImages, maxSlots]);

    const firstEmptyIndex = slots.findIndex((slot) => !slot.previewUrl);

    const handleAddImage = async (index: number) => {
        initialLoadRef.current = true;
        Alert.alert("Upload Image", "Choose an option", [
            { text: "Cancel", style: "cancel" },
            { text: "Camera", onPress: () => pickImage(index, true) },
            { text: "Gallery", onPress: () => pickImage(index, false) },
        ]);
    };

    const handleDeleteImage = async (index: number) => {
        const slot = slots[index];
        if (!slot || !slot.storageId) {
            console.error("DEBUG: No file found for slot", index);
            return;
        }
        try {
            await deleteFile(slot.storageId, slot.fileId, isShelter);
            // Remove the slot from the array and append a new empty slot.
            setSlots((prev) => {
                const newSlots = [...prev];
                newSlots.splice(index, 1);
                newSlots.push({ id: generateId() });
                return newSlots;
            });
            if (onDeleteSuccess) {
                onDeleteSuccess({
                    fileId: slot.fileId ?? "",
                    storageId: slot.storageId ?? "",
                    slotIndex: index,
                });
            }
        } catch (error: any) {
            console.error("DEBUG: Error deleting file:", error?.message);
            Alert.alert("Error", "Could not delete file");
        }
    };

    const updateSlotPreview = (
        index: number,
        previewUrl: string,
        fileId: string,
        storageId: string
    ) => {
        setSlots((prev) => {
            const newSlots = [...prev];
            newSlots[index] = {
                ...newSlots[index],
                previewUrl,
                fileId,
                storageId,
            };
            return newSlots;
        });
    };

    const pickImage = async (index: number, fromCamera: boolean) => {
        try {
            if (Platform.OS !== "web") {
                if (fromCamera) {
                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== "granted") {
                        Alert.alert("Permission Denied", "We need camera permission.");
                        return;
                    }
                } else {
                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== "granted") {
                        Alert.alert("Permission Denied", "We need gallery permission.");
                        return;
                    }
                }
            }

            let result: ImagePicker.ImagePickerResult;
            if (fromCamera) {
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: "images",
                    allowsEditing: true,
                    aspect: [3, 5],
                    quality: 1,
                });
            } else {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: "images",
                    allowsEditing: false,
                    aspect: [3, 5],
                    quality: 1,
                });
            }

            if (!result.canceled && result.assets && result.assets.length > 0) {

                const picked = result.assets[0];
                //TODO deprecated
                const manipulated = await ImageManipulator.manipulateAsync(
                    picked.uri,
                    [], // No transformations, or add actions here if needed
                    { format: ImageManipulator.SaveFormat.JPEG, compress: 1 }
                );

                const fileName = `uploaded-image.jpg`;
                const fileObj = {
                    uri: manipulated.uri,
                    mimeType: 'image/jpeg',
                    fileName,
                    fileSize: picked.fileSize || 0,
                    type: 'image/jpeg',
                };

                const url = isShelter
                    ? await uploadShelterFile(fileObj, "image")
                    : await uploadPetFile(fileObj, "image");

                if (url.fileUrl && url.storageId) {
                    const fileUrlStr = url.fileUrl.toString();
                    updateSlotPreview(index, fileUrlStr, url.fileId, url.storageId);
                    if (onUploadSuccess) {
                        onUploadSuccess({
                            fileId: url.fileId,
                            fileUrl: fileUrlStr,
                            storageId: url.storageId,
                            slotIndex: index,
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error picking image:", error);
        }
    };

    return (
        <ThemedView className={containerClassName}>
            <ThemedText type="title" style={styles.title}>
                Upload Your Images
            </ThemedText>
            <ThemedView style={styles.grid} className={inputClassName}>
                {slots.map((slot, idx) => (
                    <ThemedView
                        key={slot.id}
                        className="w-3/12 rounded-2xl relative mb-5 h-36 z-0"
                        style={{
                            backgroundColor:
                                theme === "light"
                                    ? Colors.light.buttonSecondary
                                    : Colors.dark.buttonSecondary,
                        }}
                    >
                        {slot.previewUrl ? (
                            <>
                                {/* Composite key to force re-render if index changes */}
                                <Image
                                    key={`${slot.id}-${idx}`}
                                    source={{ uri: slot.previewUrl }}
                                    style={styles.image}
                                />
                                {/* Show the delete button only for the first non-empty slot */}
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor:
                                                theme === "light"
                                                    ? Colors.light.buttonThird
                                                    : Colors.dark.buttonThird,
                                        }}
                                        className="w-8 h-8 rounded-full flex items-center justify-center z-40 absolute -bottom-3 -right-3 size-14"
                                        onPress={() => handleDeleteImage(idx)}
                                    >
                                        <Entypo
                                            name="cross"
                                            size={24}
                                            color={
                                                theme === "light"
                                                    ? Colors.light.buttonPrimary
                                                    : Colors.dark.buttonPrimary
                                            }
                                        />
                                    </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                {/* Show the plus button only for the first empty slot */}
                                {idx === firstEmptyIndex && (
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor:
                                                theme === "light"
                                                    ? Colors.light.buttonPrimary
                                                    : Colors.dark.buttonPrimary,
                                        }}
                                        className="w-8 h-8 rounded-full flex items-center justify-center z-40 absolute -bottom-3 -right-3 size-14"
                                        onPress={() => handleAddImage(idx)}
                                    >
                                        <Entypo
                                            name="plus"
                                            size={24}
                                            color={
                                                theme === "light"
                                                    ? Colors.light.buttonSecondary
                                                    : Colors.dark.buttonSecondary
                                            }
                                        />
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </ThemedView>
                ))}
            </ThemedView>
        </ThemedView>
    );
}


const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
    },
    title: {
        marginBottom: 16,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: 16,
        zIndex: 1,
    },
});
