import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T>(method: string, url: string, data?: any): Promise<T> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    const text = await response.text(); // Read response as text
    let jsonData = null;

    if (text) {
      try {
        jsonData = JSON.parse(text); // Parse if text is not empty
      } catch (err) {
        console.error("❌ Error parsing response body", err);
        throw new Error("Failed to parse response.");
      }
    }

    if (!response.ok) {
      throw new Error(jsonData?.message || `HTTP error! Status: ${response.status}`);
    }

    return jsonData as T;
  } catch (error: any) {
    console.error("❌ API Request Error:", error);
    throw new Error(error.message || "Failed to connect to the server.");
  }
}

type UnauthorizedBehavior = "returnNull" | "throw" | "redirect";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null; // Return null if unauthorized behavior is set to returnNull
      }
      if (unauthorizedBehavior === "redirect") {
        // Optionally handle redirect to login page or any other logic
        window.location.href = "/login"; // Example redirect
        return null; // You can return null here, as the redirect is happening
      }
      throw new Error("Unauthorized request");
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }), // Define behavior for 401
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
