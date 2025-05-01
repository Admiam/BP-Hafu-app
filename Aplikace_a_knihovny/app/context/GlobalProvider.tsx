import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
} from "react";
import {getCurrentUser} from "@/lib/appwrite";

/**
 * Define the shape of your user object here.
 * Adjust it to match the data returned by getCurrentUser().
 */
export interface User {
    $id: string;
    email: string;
    name?: string;
    // Add any other fields from your user object
}

/**
 * The shape of the values we provide via the GlobalContext
 */
interface GlobalContextValue {
    isLogged: boolean;
    setIsLogged: Dispatch<SetStateAction<boolean>>;
    user: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    loading: boolean;
}

/**
 * We create a context with the above shape or null (for initialization).
 */
const GlobalContext = createContext<GlobalContextValue | null>(null);

/**
 * A simple hook for accessing the global context.
 */
export const useGlobalContext = (): GlobalContextValue => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    }
    return context;
};

/**
 * Props for the GlobalProvider component.
 * We only expect children in this scenario.
 */
interface GlobalProviderProps {
    children: ReactNode;
}

/**
 * The provider component which fetches the current user and
 * provides isLogged, user, loading, etc. to the rest of the app.
 */
const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
    const [isLogged, setIsLogged] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        getCurrentUser()
            .then((res) => {
                if (res) {
                    setIsLogged(true);
                    setUser(res);
                } else {
                    setIsLogged(false);
                    setUser(null);
                }
            })
            .catch((error) => {
                // console.log(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                isLogged,
                setIsLogged,
                user,
                setUser,
                loading,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export default GlobalProvider;
