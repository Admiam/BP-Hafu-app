import { useEffect, useState } from "react";

function useAppwrite<T>(fn: () => Promise<T>): { data: T | null; loading: boolean; refetch: () => void } {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fn();
            setData(res);
        } catch (error: any) {
            console.error("Error", error.message || "An error occurred")
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const refetch = () => fetchData();

    return { data, loading, refetch };
}

export default useAppwrite;
