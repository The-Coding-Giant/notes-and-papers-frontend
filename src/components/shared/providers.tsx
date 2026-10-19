"use client";

import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { makeQueryClient } from "@/lib/query-client";
import { PageViewTracker } from "./tracker";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
        <PageViewTracker />
        <Toaster
          closeButton
          position="top-center"
          theme="system"
          toastOptions={{
            classNames: {
              toast: "!bg-card !text-card-foreground !border !border-border !shadow-lg",
              success: "!border-l-4 !border-l-success",
              error: "!border-l-4 !border-l-destructive",
              description: "!text-muted-foreground",
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
