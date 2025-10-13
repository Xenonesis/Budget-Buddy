"use client";

import React from "react";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

// Real transaction data for demonstration
const realTransactions = [
    {
        id: "1",
        amount: 4500.00,
        type: "income" as const,
        category: "Salary",
        date: "2025-01-15",
        description: "Software Engineer Monthly Salary"
    },
    {
        id: "2",
        amount: 1200.00,
        type: "expense" as const,
        category: "Housing",
        date: "2025-01-14",
        description: "Apartment Rent Payment"
    },
    {
        id: "3",
        amount: 320.00,
        type: "expense" as const,
        category: "Groceries",
        date: "2025-01-13",
        description: "Weekly grocery shopping at Whole Foods"
    },
    {
        id: "4",
        amount: 85.00,
        type: "expense" as const,
        category: "Transportation",
        date: "2025-01-12",
        description: "Gas station fill-up"
    },
    {
        id: "5",
        amount: 1500.00,
        type: "income" as const,
        category: "Freelance",
        date: "2025-01-11",
        description: "Mobile app development project"
    },
    {
        id: "6",
        amount: 45.00,
        type: "expense" as const,
        category: "Entertainment",
        date: "2025-01-10",
        description: "Netflix and Spotify subscriptions"
    },
    {
        id: "7",
        amount: 180.00,
        type: "expense" as const,
        category: "Utilities",
        date: "2025-01-09",
        description: "Electricity and internet bills"
    },
    {
        id: "8",
        amount: 95.00,
        type: "expense" as const,
        category: "Healthcare",
        date: "2025-01-08",
        description: "Pharmacy prescription refill"
    }
];

export default function TransactionsDemoPage() {
    // Calculate summary stats
    const totalAmount = realTransactions.reduce((sum, t) => sum + t.amount, 0);
    const categories = [...new Set(realTransactions.map(t => t.category))].length;

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