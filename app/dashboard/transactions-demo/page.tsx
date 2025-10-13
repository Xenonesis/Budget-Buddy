"use client";

import React from "react";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

// Sample data that matches your image
const sampleTransactions = [
    {
        id: "1",
        amount: 51000.00,
        type: "expense" as const,
        category: "Dining Out",
        date: "2025-10-13",
        description: "Expensive restaurant dinner with clients"
    },
    {
        id: "2",
        amount: 2500.00,
        type: "income" as const,
        category: "Salary",
        date: "2025-10-12",
        description: "Monthly salary payment"
    },
    {
        id: "3",
        amount: 850.00,
        type: "expense" as const,
        category: "Transport",
        date: "2025-10-11",
        description: "Gas and car maintenance"
    },
    {
        id: "4",
        amount: 1200.00,
        type: "expense" as const,
        category: "Shopping",
        date: "2025-10-10",
        description: "Clothing and accessories"
    },
    {
        id: "5",
        amount: 500.00,
        type: "income" as const,
        category: "Freelance",
        date: "2025-10-09",
        description: "Web design project payment"
    },
    {
        id: "6",
        amount: 75.00,
        type: "expense" as const,
        category: "Entertainment",
        date: "2025-10-08",
        description: "Movie tickets and snacks"
    },
    {
        id: "7",
        amount: 300.00,
        type: "expense" as const,
        category: "Utilities",
        date: "2025-10-07",
        description: "Monthly electricity bill"
    },
    {
        id: "8",
        amount: 150.00,
        type: "expense" as const,
        category: "Healthcare",
        date: "2025-10-06",
        description: "Doctor visit and prescription"
    }
];

export default function TransactionsDemoPage() {
    // Calculate summary stats
    const totalAmount = sampleTransactions.reduce((sum, t) => sum + t.amount, 0);
    const categories = [...new Set(sampleTransactions.map(t => t.category))].length;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Enhanced Recent Transactions Demo</h1>
                <p className="text-muted-foreground">
                    Showcasing the improved UI/UX of the Recent Transactions component with real-world data.
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

                    <RecentTransactions transactions={sampleTransactions} />
                </div>

                {/* Minimal Version */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Minimal Version</h2>
                    <RecentTransactions transactions={sampleTransactions.slice(0, 5)} />
                </div>

                {/* Search Only Version */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Search Only Version</h2>
                    <RecentTransactions transactions={sampleTransactions.slice(0, 6)} />
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