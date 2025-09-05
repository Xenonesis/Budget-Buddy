"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewTransactionRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to transactions page immediately
    router.replace('/dashboard/transactions');
  }, [router]);

  // Return null or a loading indicator while redirecting
  return null;
}