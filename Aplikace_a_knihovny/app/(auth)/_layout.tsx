import { StatusBar } from "expo-status-bar";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import SignWithEmailForm from "@/app/(auth)/sign-with-email";
import SignWithNameForm from "@/app/(auth)/sign-with-name";
import SignWithBirthDateForm from "@/app/(auth)/sign-with-birth-date";
import SignWithPasswordForm from "@/app/(auth)/sign-with-password";
import LoginForm from "@/app/(auth)/login";
import RegisterShelter from "@/app/(auth)/register-shelter";

// Layout for Authentication-related screens using React Navigation Stack
const AuthLayout = () => {
    const Stack = createNativeStackNavigator(); // Create a native stack navigator

    return (
        <>
            {/* Stack navigator for authentication flow */}
            <Stack.Navigator>
                {/* Step 1: Email input screen */}
                <Stack.Screen
                    name="sign-with-email"
                    options={{ headerShown: false }}
                    component={SignWithEmailForm}
                />

                {/* Step 2: Name input screen */}
                <Stack.Screen
                    name="sign-with-name"
                    options={{ headerShown: false }}
                    component={SignWithNameForm}
                />

                {/* Step 3: Birth date input screen */}
                <Stack.Screen
                    name="sign-with-birth-date"
                    options={{ headerShown: false }}
                    component={SignWithBirthDateForm}
                />

                {/* Step 4: Password input screen */}
                <Stack.Screen
                    name="sign-with-password"
                    options={{ headerShown: false }}
                    component={SignWithPasswordForm}
                />

                {/* Login screen */}
                <Stack.Screen
                    name="login"
                    options={{ headerShown: false }}
                    component={LoginForm}
                />

                {/* Shelter registration screen */}
                <Stack.Screen
                    name="register-shelter"
                    options={{
                        headerShown: false,
                        gestureEnabled: false, // Prevent swiping back from this screen
                    }}
                    component={RegisterShelter}
                />
            </Stack.Navigator>

            {/* Light status bar on dark background */}
            <StatusBar backgroundColor="#161622" style="light" />
        </>
    );
};

export default AuthLayout;
