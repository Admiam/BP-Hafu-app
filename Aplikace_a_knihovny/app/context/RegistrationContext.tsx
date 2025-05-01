// src/context/RegistrationContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";

export interface RegistrationData {
    email: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    password: string;
    isShelter: boolean;
}

interface RegistrationContextProps extends RegistrationData {
    setEmail: (value: string) => void;
    setFirstName: (value: string) => void;
    setLastName: (value: string) => void;
    setBirthDate: (value: string) => void;
    setPassword: (value: string) => void;
    setIsShelter: (value: boolean) => void;
    resetRegistration: () => void;
}

const RegistrationContext = createContext<RegistrationContextProps | null>(null);

export const useRegistration = () => {
    const context = useContext(RegistrationContext);
    if (!context) {
        throw new Error("useRegistration must be used within RegistrationProvider");
    }
    return context;
};

interface RegistrationProviderProps {
    children: ReactNode;
}

export const RegistrationProvider: React.FC<RegistrationProviderProps> = ({ children }) => {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [password, setPassword] = useState("");
    const [isShelter, setIsShelter] = useState(false);

    const resetRegistration = () => {
        setEmail("");
        setFirstName("");
        setLastName("");
        setBirthDate("");
        setPassword("");
        setIsShelter(false);
    };

    const value: RegistrationContextProps = {
        email,
        firstName,
        lastName,
        birthDate,
        password,
        isShelter,
        setEmail,
        setFirstName,
        setLastName,
        setBirthDate,
        setPassword,
        resetRegistration,
        setIsShelter,
    };

    return (
        <RegistrationContext.Provider value={value}>
            {children}
        </RegistrationContext.Provider>
    );
};

// Helper function to validate and log registration data
export const validateRegistrationData = (data: {
    email: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    password: string
    isShelter: boolean;
}): string[] => {
    // console.log("Validating Registration Data:");
    // console.log("Email:", data.email);
    // console.log("First Name:", data.firstName);
    // console.log("Last Name:", data.lastName);
    // console.log("Birth Date:", data.birthDate);
    // console.log("Password:", data.password);
    // console.log("Is Shelter:", data.isShelter);

    const errors: string[] = [];

    if (!data.email) errors.push("Email is required.");
    if (!data.firstName) errors.push("First name is required.");
    if (!data.lastName) errors.push("Last name is required.");
    if (!data.birthDate) errors.push("Birth date is required.");
    if (!data.password) errors.push("Password is required.");
    // if (data.isShelter) errors.push("Shelter status is required.");


    return errors;
};

export default RegistrationProvider;