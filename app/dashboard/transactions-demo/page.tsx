"use client";

import React from "react";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

// This demo page now fetches real user data instead of using hardcoded samples
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Transaction {
    id: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
    description: string;
}

const [realTransactions, setRealTransactions] = useState<Transaction[]>([]);
const [loading, setLoading] = useState(true);

// Fetch real user transactions
useEffect(() => {
    const fetchRealTransactions = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) return;

            const { data: transactions, error } = await supabase
                .from('transactions')
                .select(`
                    id,
                    amount,
                    type,
                    description,
                    date,
                    categories!inner(name)
                `)
                .eq('user_id', userData.user.id)
                .order('date', { ascending: false })
                .limit(20);

            if (error) throw error;

            const formattedTransactions = transactions?.map(t => ({
                id: t.id,
                amount: t.amount,
                type: t.type as "income" | "expense",
                category: (t.categories as any)?.name || 'Uncategorized',
                date: t.date,
                description: t.description || ''
            })) || [];

            setRealTransactions(formattedTransactions);
        } catch (error) {
            console.error('Error fetching real transactions:', error);
            // Fallback to empty array instead of mock data
            setRealTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    fetchRealTransactions();
}, []);

export default function TransactionsDemoPage() {
    // Calculate summary stats from real data
    const totalAmount = realTransactions.reduce((sum, t) => sum + t.amount, 0);
    const categories = [...new Set(realTransactions.map(t => t.category))].length;

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="animate-pulse">
                    <div className="h-8 w-64 bg-muted rounded mb-4"></div>
                    <div className="h-4 w-96 bg-muted rounded mb-8"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-muted rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (realTransactions.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center py-12">
                    <h1 className="text-3xl font-bold mb-4">Recent Transactions Dashboard</h1>
                    <p className="text-muted-foreground mb-8">
                        No transactions found. Add some transactions to see the enhanced UI/UX features.
                    </p>
                    <a 
                        href="/dashboard/transactions/new" 
                        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Add Your First Transaction
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Recent Transactions Dashboard</h1>
                <p className="text-muted-foreground">
                    View and manage your recent financial transactions with enhanced UI/UX features.
                </p>
            </div>

            <div className="space-y-8">
                {/* Full Featured Version */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Full Featured (Default)</h2>

                    {/* Summary Section */}
                    <div className="mb-4 p-4 bg-card rounded-lg border">
                        <div className="grid grid-cols-2 gap-4 text-sm items-baseline">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground leading-none">Total Amount:</span>
                                <span className="font-semibold leading-none">${totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground leading-none">Categories:</span>
                                <span className="font-semibold leading-none">{categories}</span>
                            </div>
                        </div>
                    </div>

                    <RecentTransactions transactions={realTransactions} />
                </div>

                {/* Minimal Version */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Minimal Version</h2>
                    <RecentTransactions transactions={realTransactions.slice(0, 5)} />
                </div>

                {/* Search Only Version */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Search Only Version</h2>
                    <RecentTransactions transactions={realTransactions.slice(0, 6)} />
                </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-12 p-6 bg-muted/30 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">✨ Enhanced Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            <span>Real-time search functionality</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span>Advanced filtering with count badges</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            <span>Smooth animations and hover effects</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            <span>Category-specific emoji icons</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                            <span>Enhanced empty states</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                            <span>Net total calculation</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                            <span>Quick action buttons</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            <span>Mobile-responsive design</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}