import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseSupabaseQueryOptions {
  maxRetries?: number;
  retryDelay?: number;
  successMessage?: string;
  errorMessage?: string;
}

interface UseSupabaseQueryReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (queryFn: () => Promise<{ data: T | null; error: any }>) => Promise<T | null>;
  retry: () => void;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useSupabaseQuery<T>(options: UseSupabaseQueryOptions = {}): UseSupabaseQueryReturn<T> {
  const { maxRetries = 2, retryDelay = 1000, errorMessage = "Gagal memuat data" } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQueryFn, setLastQueryFn] = useState<(() => Promise<{ data: T | null; error: any }>) | null>(null);
  const { toast } = useToast();

  const execute = useCallback(async (queryFn: () => Promise<{ data: T | null; error: any }>) => {
    setLoading(true);
    setError(null);
    setLastQueryFn(() => queryFn);

    let lastError: any = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const { data: result, error: queryError } = await queryFn();
        if (queryError) {
          lastError = queryError;
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
            continue;
          }
        } else {
          setData(result);
          setLoading(false);
          return result;
        }
      } catch (err: any) {
        lastError = err;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }
      }
    }

    const message = lastError?.message || errorMessage;
    setError(message);
    setLoading(false);
    toast({ title: errorMessage, description: message, variant: "destructive" });
    return null;
  }, [maxRetries, retryDelay, errorMessage, toast]);

  const retry = useCallback(() => {
    if (lastQueryFn) {
      execute(lastQueryFn);
    }
  }, [lastQueryFn, execute]);

  return { data, loading, error, execute, retry, setData };
}

export default useSupabaseQuery;
