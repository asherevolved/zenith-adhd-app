
'use client';

import { Dashboard } from "@/components/Dashboard";
import { useAppContext } from "@/context/AppContext";

export default function Home() {
  const { isAuthenticated } = useAppContext();

  // Render dashboard only if authenticated. The layout handles redirection.
  if (!isAuthenticated) {
    return null; 
  }

  return <Dashboard />;
}
