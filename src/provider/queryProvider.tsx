import { environmentManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

function makeQueryClint() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (environmentManager.isServer()) {
    return makeQueryClint();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClint();
    return browserQueryClient;
  }
}

export default function QueryProvider({children}: {children:ReactNode}) {

    const queryClient = getQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
