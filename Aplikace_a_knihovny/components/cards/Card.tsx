import {Text, StyleSheet, Image, Dimensions, TouchableOpacity} from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
// @ts-ignore
import Like from '@/assets/images/like.png';
// @ts-ignore
import Nope from '@/assets/images/nope.png';
import Animated, {
    SharedValue,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import {ThemedView} from "@/components/ThemedView";
import {ThemedText} from "@/components/ThemedText";
import {PetsDocument} from "@/lib/appwrite";
import {getDateString} from "@/utils/dateUtils";
import DistanceDisplay from "@/components/DistanceDisplay";
import * as Location from "expo-location";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {useColorScheme} from "@/hooks/useColorScheme";
import {FontAwesome5} from "@expo/vector-icons";

const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;

export const cardWidth = screenWidth * 0.95;
export const cardHeight = screenHeight - (210);

type CardType = {
    pet: PetsDocument;
    images: string;
    numOfCards: number;
    index: number;
    activeIndex: SharedValue<number>;
    onResponse: (liked: boolean, pet: PetsDocument) => void;
    navigateToDetail: (pet: PetsDocument, images: string) => void;
    location: Location.LocationObject | null;
};

const SWIPE_THRESHOLD = -100;


const Card = ({
                        pet,
                        numOfCards,
                        index,
                        activeIndex,
                        onResponse,
                        navigateToDetail,
                        images,
                        location,
                    }: CardType) => {

    const translationX = useSharedValue(0);
    const colorScheme = useColorScheme();

    const animatedCard = useAnimatedStyle(() => ({
        opacity: interpolate(
            activeIndex.value,
            [index - 1, index, index + 1],
            [1 - 1 / 5, 1, 1]
        ),
        transform: [
            {
                scale: interpolate(
                    activeIndex.value,
                    [index - 1, index, index + 1],
                    [0.94, 1, 1]
                ),
            },
            {
                translateY: interpolate(
                    activeIndex.value,
                    [index - 1, index, index + 1],
                    [-30, 0, 0]
                ),
            },
            {
                translateX: translationX.value,
            },
            {
                rotateZ: `${interpolate(
                    translationX.value,
                    [-screenWidth / 2, 0, screenWidth / 2],
                    [-15, 0, 15]
                )}deg`,
            },
        ],
    }));

    const likeStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            translationX.value,
            [(-index -1) * 100, -275, 0, 275, (index + 1) * 100], // Define dead zone around 0 (-275 to 275)
            [0, 0, 0, 1, 1]  // Opacity 1 outside the dead zone, 0 in the middle
        ),
    }));

    const nopeStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            translationX.value,
            [(-index -1) * 100, -275, 0, 275, (index + 1) * 100],  // Same dead zone logic
            [1, 1, 0, 0, 0]  // Opposite effect for nope label
        ),
    }));


    const gesture = Gesture.Pan()
        .onChange((event) => {
            translationX.value = event.translationX;

            activeIndex.value = interpolate(
                Math.abs(translationX.value),
                [0, 600],
                [index, index + 0.8]
            );
        })
        .onEnd((event) => {
            if (Math.abs(event.velocityX) > 500) {
                translationX.value = withSpring(Math.sign(event.velocityX) * 600, {
                    velocity: event.velocityX,
                });
                activeIndex.value = withSpring(index + 1);

                runOnJS(onResponse)(event.velocityX > 0, pet);
            } else if (event.translationY < SWIPE_THRESHOLD) {
                runOnJS(navigateToDetail)(pet, images);

            } else {
                translationX.value = withSpring(0);
            }
        });

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View
                style={[
                    styles.card,
                    animatedCard,
                    {
                        zIndex: numOfCards - index,
                    },
                ]}
            >
                <Animated.Image
                    source={Like}
                    style={[styles.like, {left: 10}, likeStyle]}
                    resizeMode="contain"
                />
                <Animated.Image
                    source={Nope}
                    style={[styles.like, {right: 10}, nopeStyle]}
                    resizeMode="contain"
                />
                <Image
                    style={[StyleSheet.absoluteFillObject, styles.image]}
                    source={{ uri: images }}
                />

                <LinearGradient
                    // Background Linear Gradient
                    colors={['transparent', 'rgba(0,0,0,0.88)']}
                    style={[StyleSheet.absoluteFillObject, styles.overlay]}
                />
                <TouchableOpacity onPress={ () => runOnJS(navigateToDetail)(pet, images)}>
                    <ThemedView className="m-4 flex-col ">
                    <ThemedView className="flex-row justify-between">
                        <ThemedText className="" type="title">{pet.name}</ThemedText>
                        <Text>
                            <FontAwesome5 name="arrow-circle-down" size={24} color="white" />
                        </Text>
                    </ThemedView>
                    <ThemedView className=" ">
                        <ThemedView className="flex-row my-1">
                            <MaterialCommunityIcons name="clock-outline" size={20} color={colorScheme === 'dark' ? 'white' : 'white'} />
                            <ThemedText className="ml-1">{getDateString(pet.birth_date)}</ThemedText>
                        </ThemedView>
                        {location && (
                            <DistanceDisplay pet={pet} location={location}/>
                        )}
                    </ThemedView>

                </ThemedView>
                </TouchableOpacity>
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    card: {
        width: cardWidth,
        height: cardHeight,
        // aspectRatio: 1 / 1.67,
        borderRadius: 15,
        justifyContent: 'flex-end',
        position: 'absolute',

        // shadow
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        elevation: 3,
    },
    image: {
        borderRadius: 15,
    },
    overlay: {
        top: '65%',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    name: {
        fontSize: 24,
        color: 'white',
        fontFamily: 'InterBold',
    },
    like: {
        width: 150,
        height: 150,
        position: 'absolute',
        top: 10,
        zIndex: 1,
        elevation: 1,
    },
});

export default Card;