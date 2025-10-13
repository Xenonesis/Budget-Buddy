"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export function SidebarTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Check if sidebar elements exist
    try {
      const desktopSidebar = document.querySelector('[role="navigation"][aria-label="Main navigation"]');
      const mobileSidebar = document.getElementById('mobile-sidebar');
      
      results.push({
        name: 'Sidebar Elements Exist',
        status: desktopSidebar && mobileSidebar ? 'pass' : 'fail',
        message: desktopSidebar && mobileSidebar ? 'Both desktop and mobile sidebars found' : 'Missing sidebar elements'
      });
    } catch (error) {
      results.push({
        name: 'Sidebar Elements Exist',
        status: 'fail',
        message: 'Error checking sidebar elements'
      });
    }

    // Test 2: Check navigation links
    try {
      const navLinks = document.querySelectorAll('[data-testid^="nav-item-"]');
      results.push({
        name: 'Navigation Links',
        status: navLinks.length >= 7 ? 'pass' : 'warning',
        message: `Found ${navLinks.length} navigation links`
      });
    } catch (error) {
      results.push({
        name: 'Navigation Links',
        status: 'fail',
        message: 'Error checking navigation links'
      });
    }

    // Test 3: Check localStorage functionality
    try {
      const testKey = 'sidebar-test-' + Date.now();
      localStorage.setItem(testKey, 'test');
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      results.push({
        name: 'LocalStorage Access',
        status: retrieved === 'test' ? 'pass' : 'fail',
        message: retrieved === 'test' ? 'LocalStorage working correctly' : 'LocalStorage not accessible'
      });
    } catch (error) {
      results.push({
        name: 'LocalStorage Access',
        status: 'fail',
        message: 'LocalStorage not available'
      });
    }

    // Test 4: Check responsive classes
    try {
      const mobileHeader = document.querySelector('.md\\:hidden');
      const desktopSidebar = document.querySelector('.hidden.md\\:flex');
      
      results.push({
        name: 'Responsive Design',
        status: mobileHeader || desktopSidebar ? 'pass' : 'warning',
        message: 'Responsive classes detected'
      });
    } catch (error) {
      results.push({
        name: 'Responsive Design',
        status: 'warning',
        message: 'Could not verify responsive classes'
      });
    }

    // Test 5: Check accessibility attributes
    try {
      const ariaLabels = document.querySelectorAll('[aria-label]');
      const ariaExpanded = document.querySelectorAll('[aria-expanded]');
      
      results.push({
        name: 'Accessibility Attributes',
        status: ariaLabels.length > 0 && ariaExpanded.length > 0 ? 'pass' : 'warning',
        message: `Found ${ariaLabels.length} aria-label and ${ariaExpanded.length} aria-expanded attributes`
      });
    } catch (error) {
      results.push({
        name: 'Accessibility Attributes',
        status: 'warning',
        message: 'Could not verify accessibility attributes'
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-100 text-green-800">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
    }
  };

  const passCount = testResults.filter(r => r.status === 'pass').length;
  const failCount = testResults.filter(r => r.status === 'fail').length;
  const warningCount = testResults.filter(r => r.status === 'warning').length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Sidebar Functionality Test
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {testResults.length > 0 && (
          <div className="mb-4 flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {passCount} Passed
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" />
              {failCount} Failed
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              {warningCount} Warnings
            </span>
          </div>
        )}
        
        <div className="space-y-3">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <div className="font-medium">{result.name}</div>
                  <div className="text-sm text-muted-foreground">{result.message}</div>
                </div>
              </div>
              {getStatusBadge(result.status)}
            </div>
          ))}
        </div>
        
        {testResults.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Click "Run Tests" to check sidebar functionality
          </div>
        )}
      </CardContent>
    </Card>
  );
}