"use client";

/**
 * Advanced OCR Upload Component - Integrates all new OCR features
 * Supports batch processing, voice input, smart learning, and real-time insights
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Mic, 
  MicOff, 
  FileText, 
  Sparkles, 
  Brain, 
  Globe,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Zap,
  Camera,
  Files,
  Download,
  Eye,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

// Import our new OCR engines
import { SmartLearningEngine } from '@/lib/smart-learning-engine';
import { BatchOCRProcessor } from '@/lib/batch-ocr-processor';
import { VoiceOCRProcessor } from '@/lib/voice-ocr-processor';
import { GlobalOCREngine } from '@/lib/global-ocr-engine';
import { ContextualAIAssistant } from '@/lib/contextual-ai-assistant';
import { ExpenseReportGenerator } from '@/lib/expense-report-generator';

// Define missing types
interface ExtractedTransactionData {
  id?: string;
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
  merchant?: string;
  type?: 'income' | 'expense';
  confidence?: number;
  voiceConfidence?: number;
  languageDetected?: string;
}

interface CoachingInsight {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'suggestion' | 'achievement' | 'prediction';
  impact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'immediate' | 'soon' | 'whenever';
  actionable: boolean;
  confidence: number;
  actions?: Array<{
    title: string;
    description: string;
    estimatedSavings?: number;
  }>;
}

interface ExpenseReport {
  reportId: string;
  transactionCount: number;
  totalAmount: number;
  categories: Record<string, number>;
  generatedAt: Date;
  title?: string;
  summary?: string;
  period?: string;
}

interface AdvancedOCRUploadProps {
  onDataExtracted: (data: ExtractedTransactionData | ExtractedTransactionData[]) => void;
  onInsightGenerated?: (insights: CoachingInsight[]) => void;
  onReportGenerated?: (report: ExpenseReport) => void;
  userId: string;
  currentBudgets?: Map<string, number>;
  recentTransactions?: ExtractedTransactionData[];
  enabledFeatures?: {
    batchProcessing?: boolean;
    voiceInput?: boolean;
    smartLearning?: boolean;
    globalOCR?: boolean;
    aiCoaching?: boolean;
    reportGeneration?: boolean;
  };
}

interface ProcessingState {
  stage: string;
  progress: number;
  currentFile?: string;
  message: string;
  isActive: boolean;
}

interface VoiceState {
  isListening: boolean;
  transcript: string;
  confidence: number;
  language: string;
}

interface BatchState {
  files: File[];
  processing: boolean;
  completed: number;
  failed: number;
  results: ExtractedTransactionData[];
  duplicates: any[];
}

export function AdvancedOCRUpload({
  onDataExtracted,
  onInsightGenerated,
  onReportGenerated,
  userId,
  currentBudgets,
  recentTransactions = [],
  enabledFeatures = {
    batchProcessing: true,
    voiceInput: true,
    smartLearning: true,
    globalOCR: true,
    aiCoaching: true,
    reportGeneration: true
  }
}: AdvancedOCRUploadProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'voice' | 'global'>('single');
  const [processingState, setProcessingState] = useState<ProcessingState>({
    stage: 'ready',
    progress: 0,
    message: 'Ready to process',
    isActive: false
  });
  
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    transcript: '',
    confidence: 0,
    language: 'en-IN'
  });
  
  const [batchState, setBatchState] = useState<BatchState>({
    files: [],
    processing: false,
    completed: 0,
    failed: 0,
    results: [],
    duplicates: []
  });
  
  const [insights, setInsights] = useState<CoachingInsight[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  
  // Refs for OCR engines
  const smartLearningEngine = useRef<SmartLearningEngine | null>(null);
  const batchProcessor = useRef<BatchOCRProcessor | null>(null);
  const voiceProcessor = useRef<VoiceOCRProcessor | null>(null);
  const globalEngine = useRef<GlobalOCREngine | null>(null);
  const aiAssistant = useRef<ContextualAIAssistant | null>(null);
  const reportGenerator = useRef<ExpenseReportGenerator | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const batchInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize OCR engines
  useEffect(() => {
    if (enabledFeatures.smartLearning) {
      smartLearningEngine.current = new SmartLearningEngine();
    }
    if (enabledFeatures.batchProcessing) {
      batchProcessor.current = new BatchOCRProcessor();
    }
    if (enabledFeatures.voiceInput) {
      voiceProcessor.current = new VoiceOCRProcessor();
    }
    if (enabledFeatures.globalOCR) {
      globalEngine.current = new GlobalOCREngine();
    }
    if (enabledFeatures.aiCoaching) {
      aiAssistant.current = new ContextualAIAssistant();
    }
    if (enabledFeatures.reportGeneration) {
      reportGenerator.current = new ExpenseReportGenerator();
    }
  }, [enabledFeatures]);

  /**
   * Handle single file upload with smart learning
   */
  const handleSingleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;
    
    const file = files[0];
    setProcessingState({
      stage: 'processing',
      progress: 0,
      currentFile: file.name,
      message: 'Initializing smart OCR...',
      isActive: true
    });
    
    try {
      // Use global OCR engine for international receipts
      let extractedData: ExtractedTransactionData;
      
      if (globalEngine.current && isInternationalReceipt(file)) {
        setProcessingState(prev => ({ ...prev, progress: 20, message: 'Detecting language and currency...' }));
        const globalResult = await globalEngine.current.processInternationalReceipt(file);
        // Convert GlobalReceiptData to our local ExtractedTransactionData format
        // Using type assertion since the properties exist but may have different names
        extractedData = {
          amount: (globalResult as any).convertedAmount || (globalResult as any).amount || 0,
          description: (globalResult as any).description || 'International Receipt',
          category: (globalResult as any).category || 'Travel',
          date: (globalResult as any).date || new Date().toISOString(),
          merchant: (globalResult as any).merchant,
          confidence: globalResult.confidence || 0.8
        };
      } else {
        // Use enhanced LLM OCR for regular processing
        setProcessingState(prev => ({ ...prev, progress: 20, message: 'Performing advanced OCR...' }));
        const { LLMEnhancedOCR } = await import('@/lib/llm-enhanced-ocr');
        const ocrEngine = new LLMEnhancedOCR();
        extractedData = await ocrEngine.processDocument(file);
      }
      
      setProcessingState(prev => ({ ...prev, progress: 60, message: 'Applying smart learning...' }));
      
      // Apply smart learning if available
      if (smartLearningEngine.current) {
        const enhancedData = await smartLearningEngine.current.applyPersonalizedLearning(
          userId, 
          extractedData, 
          ''
        );
        // Convert enhanced data back to our format
        extractedData = {
          ...extractedData,
          ...(enhancedData as any),
          confidence: (enhancedData as any).confidence || extractedData.confidence
        };
      }
      
      setProcessingState(prev => ({ ...prev, progress: 80, message: 'Generating AI insights...' }));
      
      // Generate AI coaching insights
      if (aiAssistant.current) {
        const analysis = await aiAssistant.current.analyzeSpendingBehavior(
          userId,
          extractedData,
          {
            recentTransactions,
            budgets: currentBudgets || new Map(),
            goals: []
          }
        );
        
        setInsights(analysis.insights);
        if (onInsightGenerated) {
          onInsightGenerated(analysis.insights);
        }
        
        // Show alerts if any
        if (analysis.alerts && analysis.alerts.length > 0) {
          analysis.alerts.forEach((alert: any) => {
            toast.warning(alert.title || alert.description, {
              description: alert.description || alert.suggestedAction
            });
          });
        }
      }
      
      setProcessingState(prev => ({ ...prev, progress: 100, message: 'Processing complete!' }));
      
      // Call the callback with extracted data
      onDataExtracted(extractedData);
      
      toast.success('Receipt processed successfully!', {
        description: `Extracted: ₹${extractedData.amount} from ${extractedData.merchant || 'Unknown merchant'}`
      });
      
    } catch (error) {
      console.error('OCR processing failed:', error);
      toast.error('Processing failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setProcessingState({
        stage: 'ready',
        progress: 0,
        message: 'Ready to process',
        isActive: false
      });
    }
  }, [userId, onDataExtracted, onInsightGenerated, currentBudgets, recentTransactions]);

  /**
   * Handle batch file processing
   */
  const handleBatchUpload = useCallback(async (files: FileList) => {
    if (!files.length || !batchProcessor.current) return;
    
    const fileArray = Array.from(files);
    setBatchState(prev => ({ ...prev, files: fileArray, processing: true }));
    
    const batchId = `batch_${Date.now()}`;
    
    try {
      const result = await batchProcessor.current.processBatch(
        fileArray,
        {
          maxFiles: 50,
          enableDuplicateDetection: true,
          enableCrossDocumentValidation: true,
          generateExpenseReport: true,
          processingMode: 'parallel',
          batchId
        },
        (progress) => {
          setBatchState(prev => ({
            ...prev,
            completed: progress.completed,
            failed: progress.total - progress.completed
          }));
        }
      );
      
      setBatchState(prev => ({
        ...prev,
        processing: false,
        results: result.extractedTransactions,
        duplicates: result.duplicatesFound
      }));
      
      // Generate expense report if available
      if (reportGenerator.current && onReportGenerated) {
        const report = await reportGenerator.current.generateReport(
          result.extractedTransactions,
          { title: `Batch Upload Report - ${new Date().toLocaleDateString()}` }
        );
        // Ensure the report has all required properties
        const formattedReport: ExpenseReport = {
          reportId: (report as any).reportId || `report_${Date.now()}`,
          transactionCount: (report as any).transactionCount || result.extractedTransactions.length,
          totalAmount: (report as any).totalAmount || 0,
          categories: (report as any).categories || {},
          generatedAt: (report as any).generatedAt || new Date(),
          title: (report as any).title,
          summary: (report as any).summary,
          period: (report as any).period
        };
        onReportGenerated(formattedReport);
      }
      
      onDataExtracted(result.extractedTransactions);
      
      toast.success(`Batch processing complete!`, {
        description: `Processed ${result.successfulFiles}/${result.totalFiles} files. Found ${result.duplicatesFound.length} duplicates.`
      });
      
    } catch (error) {
      console.error('Batch processing failed:', error);
      toast.error('Batch processing failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      setBatchState(prev => ({ ...prev, processing: false }));
    }
  }, [onDataExtracted, onReportGenerated]);

  /**
   * Handle voice input
   */
  const handleVoiceInput = useCallback(async () => {
    if (!voiceProcessor.current) return;
    
    if (voiceState.isListening) {
      voiceProcessor.current.stopListening();
      setVoiceState(prev => ({ ...prev, isListening: false }));
      return;
    }
    
    try {
      setVoiceState(prev => ({ ...prev, isListening: true, transcript: '' }));
      
      const result = await voiceProcessor.current.processVoiceInput(
        undefined,
        (partialData) => {
          setVoiceState(prev => ({
            ...prev,
            transcript: (partialData as any).description || (partialData as any).transcript || '',
            confidence: (partialData as any).confidence || 0
          }));
        }
      );
      
      setVoiceState(prev => ({
        ...prev,
        isListening: false,
        transcript: (result as any).description || (result as any).transcript || '',
        confidence: (result as any).voiceConfidence || (result as any).confidence || 0,
        language: (result as any).languageDetected || 'en-IN'
      }));
      
      onDataExtracted(result);
      
      toast.success('Voice input processed!', {
        description: `Detected: ₹${(result as any).amount || 0} expense`
      });
      
    } catch (error) {
      console.error('Voice processing failed:', error);
      toast.error('Voice processing failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      setVoiceState(prev => ({ ...prev, isListening: false }));
    }
  }, [voiceState.isListening, onDataExtracted]);

  /**
   * Check if receipt appears to be international
   */
  const isInternationalReceipt = (file: File): boolean => {
    // Simple heuristic - in production, could analyze filename or do quick OCR scan
    const name = file.name.toLowerCase();
    return name.includes('usd') || name.includes('eur') || name.includes('gbp') || 
           name.includes('international') || name.includes('travel');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <CardTitle>Advanced OCR Processing</CardTitle>
            <Badge variant="outline" className="text-xs">
              AI-Powered
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Processing Status */}
        {processingState.isActive && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{processingState.message}</span>
              <span className="font-medium">{processingState.progress}%</span>
            </div>
            <Progress value={processingState.progress} className="h-2" />
            {processingState.currentFile && (
              <p className="text-sm text-muted-foreground">
                Processing: {processingState.currentFile}
              </p>
            )}
          </div>
        )}

        {/* AI Insights */}
        {insights.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </h4>
            <div className="space-y-2">
              {insights.slice(0, 3).map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                  <div className="flex-shrink-0">
                    {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    {insight.type === 'suggestion' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                    {insight.type === 'achievement' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{insight.title}</p>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge variant={insight.impact === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {insight.impact} impact
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Upload Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="single" className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Single</span>
            </TabsTrigger>
            {enabledFeatures.batchProcessing && (
              <TabsTrigger value="batch" className="flex items-center space-x-2">
                <Files className="h-4 w-4" />
                <span>Batch</span>
              </TabsTrigger>
            )}
            {enabledFeatures.voiceInput && (
              <TabsTrigger value="voice" className="flex items-center space-x-2">
                <Mic className="h-4 w-4" />
                <span>Voice</span>
              </TabsTrigger>
            )}
            {enabledFeatures.globalOCR && (
              <TabsTrigger value="global" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Global</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Single File Upload */}
          <TabsContent value="single" className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files) handleSingleFileUpload(files);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload Receipt or Invoice</h3>
              <p className="text-sm text-gray-500 mb-4">
                Drop your file here or click to browse. Supports JPG, PNG, PDF
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">Smart Learning</Badge>
                <Badge variant="outline">AI Enhancement</Badge>
                <Badge variant="outline">Multi-language</Badge>
                <Badge variant="outline">Real-time Insights</Badge>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleSingleFileUpload(e.target.files);
                }}
              />
            </div>
          </TabsContent>

          {/* Batch Upload */}
          {enabledFeatures.batchProcessing && (
            <TabsContent value="batch" className="space-y-4">
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => batchInputRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = e.dataTransfer.files;
                    if (files) handleBatchUpload(files);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <Files className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Batch Upload (Up to 50 files)</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload multiple receipts at once for instant expense reports
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline">Duplicate Detection</Badge>
                    <Badge variant="outline">Auto Reports</Badge>
                    <Badge variant="outline">Cross Validation</Badge>
                  </div>
                  <input
                    ref={batchInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleBatchUpload(e.target.files);
                    }}
                  />
                </div>

                {/* Batch Progress */}
                {batchState.processing && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Processing {batchState.files.length} files...</span>
                      <span>{batchState.completed}/{batchState.files.length}</span>
                    </div>
                    <Progress value={(batchState.completed / batchState.files.length) * 100} />
                  </div>
                )}

                {/* Batch Results */}
                {batchState.results.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Batch Results</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{batchState.completed}</div>
                        <div className="text-sm text-green-700">Processed</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{batchState.failed}</div>
                        <div className="text-sm text-red-700">Failed</div>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">{batchState.duplicates.length}</div>
                        <div className="text-sm text-amber-700">Duplicates</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Voice Input */}
          {enabledFeatures.voiceInput && (
            <TabsContent value="voice" className="space-y-4">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Voice Expense Entry</h3>
                  <p className="text-sm text-gray-500">
                    Speak your expense naturally: "I spent 250 rupees at Starbucks yesterday for coffee"
                  </p>
                </div>

                <div className="flex justify-center">
                  <Button
                    size="lg"
                    variant={voiceState.isListening ? "destructive" : "default"}
                    onClick={handleVoiceInput}
                    className="w-32 h-32 rounded-full"
                    disabled={!voiceProcessor.current?.isVoiceSupported()}
                  >
                    {voiceState.isListening ? (
                      <MicOff className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </Button>
                </div>

                {voiceState.isListening && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-red-600">Listening...</span>
                    </div>
                  </div>
                )}

                {voiceState.transcript && (
                  <div className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">Transcript:</p>
                      <p className="text-sm">{voiceState.transcript}</p>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <Badge variant="outline">
                        Language: {voiceState.language}
                      </Badge>
                      <Badge variant="outline">
                        Confidence: {Math.round(voiceState.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <h4 className="font-medium mb-2">Supported Languages:</h4>
                    <ul className="space-y-1">
                      <li>• English</li>
                      <li>• हिंदी (Hindi)</li>
                      <li>• தமிழ் (Tamil)</li>
                      <li>• বাংলা (Bengali)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Example Phrases:</h4>
                    <ul className="space-y-1">
                      <li>• "I spent 500 rupees at McDonald's"</li>
                      <li>• "Paid 1200 for Uber ride yesterday"</li>
                      <li>• "Bought groceries for 2500 from BigBasket"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Global OCR */}
          {enabledFeatures.globalOCR && (
            <TabsContent value="global" className="space-y-4">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Global Receipt Processing</h3>
                  <p className="text-sm text-gray-500">
                    Process receipts from any country - auto-detects language and converts currency
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl mb-2">🇺🇸</div>
                    <div className="text-sm font-medium">United States</div>
                    <div className="text-xs text-muted-foreground">USD → INR</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl mb-2">🇪🇺</div>
                    <div className="text-sm font-medium">Europe</div>
                    <div className="text-xs text-muted-foreground">EUR → INR</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl mb-2">🇯🇵</div>
                    <div className="text-sm font-medium">Japan</div>
                    <div className="text-xs text-muted-foreground">JPY → INR</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl mb-2">🇨🇳</div>
                    <div className="text-sm font-medium">China</div>
                    <div className="text-xs text-muted-foreground">CNY → INR</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Supported Features:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>25+ Languages</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>20+ Currencies</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Real-time Conversion</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Regional Patterns</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Action Buttons */}
        {!processingState.isActive && (
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>Powered by AI • Smart Learning • Real-time Insights</span>
            </div>
            
            <div className="flex space-x-2">
              {batchState.results.length > 0 && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              )}
              {insights.length > 0 && (
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Insights
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}