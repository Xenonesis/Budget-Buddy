"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface QuotaStatusCardProps {
  quotaError: string | null;
  quotaStatus: any;
  onRefreshStatus: () => void;
}

export function QuotaStatusCard({ quotaError, quotaStatus, onRefreshStatus }: QuotaStatusCardProps) {
  if (!quotaError) return null;

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader className="pb-3">
        <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          API Quota Limit Reached
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-orange-700 dark:text-orange-300 mb-3">{quotaError}</p>
        {quotaStatus && (
          <div className="text-sm text-orange-600 dark:text-orange-400">
            <p>Current usage: {quotaStatus.status?.usage}</p>
            <p>Quota resets in: {quotaStatus.status?.timeUntilReset}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefreshStatus}
          className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900"
        >
          Refresh Status
        </Button>
      </CardFooter>
    </Card>
  );
}