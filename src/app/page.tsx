
'use client';

import { Dashboard } from "@/components/Dashboard";
import { useAppContext } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { isAuthenticated } = useAppContext();

  // Render a loading state while checking for authentication.
  // This prevents the page from returning null and causing a 404 on Vercel.
  if (isAuthenticated === undefined) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  // The redirection logic in AppLayout will handle unauthenticated users.
  // We only render the Dashboard if the user is authenticated.
  if (!isAuthenticated) {
    // It's important to still return a placeholder during the client-side redirect phase.
    return (
       <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  return <Dashboard />;
}
