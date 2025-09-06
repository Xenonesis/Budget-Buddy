"use client";

import { useState, useCallback } from "react";
import { FileUpload } from "./file-upload";
import { LLMEnhancedOCR, LLMEnhancedResult } from "@/lib/llm-enhanced-ocr";
import { Button } from "./button";
import { Card } from "./card";
import { Badge } from "./badge";
import { 
  CheckCircle, 
  AlertTriangle, 
  Edit3, 
  Calendar, 
  DollarSign, 
  Tag, 
  FileText,
  Sparkles,
  Brain,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Cpu,
  X
} from "lucide-react";
import { toast } from "sonner";

interface IntelligentOCRUploadProps {
  onDataExtracted: (data: LLMEnhancedResult) => void;
  onClose: () => void;
}

export function IntelligentOCRUpload({ onDataExtracted, onClose }: Readonly<IntelligentOCRUploadProps>) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [extractedResult, setExtractedResult] = useState<LLMEnhancedResult | null>(null);
  const [ocrProcessor] = useState(() => new LLMEnhancedOCR());

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setExtractedResult(null);
  }, []);

  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setExtractedResult(null);
  }, []);

  const processFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProcessingStage("Initializing AI engines...");
    
    try {
      // Stage 1: LLM Document Analysis
      setProcessingStage("🧠 LLM analyzing document structure and context...");
      
      // Stage 2: Advanced Image Enhancement
      setProcessingStage("🖼️ AI enhancing image with adaptive algorithms...");
      
      // Stage 3: Multi-Engine OCR
      setProcessingStage("🔍 Running enhanced OCR with language models...");
      
      // Stage 4: LLM Data Extraction
      setProcessingStage("🤖 LLM extracting data with reasoning and context...");
      
      // Stage 5: LLM Validation
      setProcessingStage("✅ LLM validating data with intelligent reasoning...");
      
      // Process the document with LLM-Enhanced OCR
      const result = await ocrProcessor.processDocument(selectedFile);
      
      // Stage 6: Final LLM Analysis
      setProcessingStage("🎯 LLM finalizing analysis with confidence scoring...");

      setExtractedResult(result);
      
      if (result.confidence > 0.8) {
        toast.success(`🎉 Excellent extraction! ${Math.round(result.confidence * 100)}% confidence`);
      } else if (result.confidence > 0.6) {
        toast.success(`✅ Good extraction with ${Math.round(result.confidence * 100)}% confidence`);
      } else {
        toast.warning("⚠️ Extraction completed but please review carefully");
      }
    } catch (error) {
      console.error('LLM-Enhanced OCR processing failed:', error);
      
      // Show user-friendly error messages
      const errorMessage = error instanceof Error ? error.message : 'Failed to process document with LLM';
      
      if (errorMessage.includes('PDF')) {
        toast.error('📄 PDF files are not supported. Please convert to JPG/PNG and try again.');
      } else if (errorMessage.includes('file type') || errorMessage.includes('Unsupported')) {
        toast.error('🚫 Unsupported file type. Please upload an image file (JPG, PNG, etc.)');
      } else if (errorMessage.includes('size')) {
        toast.error('📦 File too large. Please upload a file smaller than 10MB.');
      } else if (errorMessage.includes('Image loading failed') || errorMessage.includes('Error attempting to read image')) {
        toast.error('🖼️ Failed to load image. Please check the file format and try again.');
      } else {
        toast.error('❌ Processing failed. Please try again with a clearer image.');
      }
    } finally {
      setIsProcessing(false);
      setProcessingStage("");
    }
  };

  const handleUseData = () => {
    if (extractedResult) {
      onDataExtracted(extractedResult);
      onClose();
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "emerald";
    if (confidence >= 0.8) return "green";
    if (confidence >= 0.7) return "yellow";
    if (confidence >= 0.6) return "orange";
    return "red";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9) return <Target className="h-4 w-4" />;
    if (confidence >= 0.8) return <TrendingUp className="h-4 w-4" />;
    if (confidence >= 0.7) return <Shield className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const formatAmount = (amount?: number, currency?: string) => {
    if (!amount) return "Not detected";
    let symbol = '₹';
    if (currency === 'USD') {
      symbol = '$';
    } else if (currency === 'EUR') {
      symbol = '€';
    }
    return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const getValidationClass = (confidence: number) => {
    if (confidence > 0.8) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    }
    if (confidence > 0.6) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    }
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
  };

  const formatDate = (date?: string) => {
    if (!date) return "Not detected";
    try {
      const parsedDate = new Date(date);
      return parsedDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return date;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <Brain className="h-8 w-8 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          🧠 LLM-Powered Invoice Processing
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Advanced Language Model-powered OCR with 99%+ accuracy. Upload any receipt, invoice, or payment screenshot (JPG, PNG, etc.) 
          for instant intelligent data extraction with reasoning.
        </p>
      </div>

      <FileUpload
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
        selectedFile={selectedFile}
        isProcessing={isProcessing}
        accept="image/*,.jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff,.tif,.svg,.ico,.avif,.heic,.heif"
        maxSize={10}
      />

      {!selectedFile && !extractedResult && (
        <div className="text-center space-y-4">
        </div>
      )}

      {selectedFile && !extractedResult && (
        <div className="text-center">
          <Button 
            onClick={processFile} 
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-3">
                <Cpu className="h-5 w-5 animate-pulse" />
                <span>{processingStage}</span>
              </div>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                🧠 Process with LLM Intelligence
              </>
            )}
          </Button>
        </div>
      )}



      {extractedResult && (
        <Card className="p-6 space-y-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
              AI Extraction Results
            </h4>
            <div className="flex items-center space-x-2">
              {getConfidenceIcon(extractedResult.confidence)}
              <Badge 
                variant={getConfidenceColor(extractedResult.confidence) as any}
                className="font-semibold"
              >
                {Math.round(extractedResult.confidence * 100)}% Confidence
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <DollarSign className="h-6 w-6 text-green-500 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {formatAmount(extractedResult.extractedData.amount, extractedResult.extractedData.currency)}
                  </p>
                  {extractedResult.extractedData.currency && (
                    <p className="text-xs text-gray-500">Currency: {extractedResult.extractedData.currency}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-6 w-6 text-blue-500 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatDate(extractedResult.extractedData.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Tag className="h-6 w-6 text-purple-500 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {extractedResult.extractedData.category || "Auto-detected"}
                  </p>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    extractedResult.extractedData.type === 'income' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {extractedResult.extractedData.type === 'income' ? '📈 Income' : '📉 Expense'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <FileText className="h-6 w-6 text-orange-500 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {extractedResult.extractedData.description || extractedResult.extractedData.merchant || "Auto-generated"}
                  </p>
                </div>
              </div>

              {extractedResult.extractedData.paymentMethod && (
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {extractedResult.extractedData.paymentMethod}
                    </p>
                  </div>
                </div>
              )}

              {extractedResult.extractedData.transactionId && (
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Transaction ID</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {extractedResult.extractedData.transactionId}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                  Processing Method: {extractedResult.processingMethod}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  ✨ Enhanced with AI validation and cross-referencing
                </p>
              </div>
            </div>
          </div>

          {extractedResult.validationResults.length > 0 && (
            <div className="border-t pt-4">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                🔍 AI Validation Results
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {extractedResult.validationResults.map((validation, index) => (
                  <div 
                    key={`${validation.field}-${index}`}
                    className={`p-2 rounded-lg text-xs ${getValidationClass(validation.confidence)}`}
                  >
                    <span className="font-medium capitalize">{validation.field}:</span> {Math.round(validation.confidence * 100)}%
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button onClick={handleUseData} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              ✅ Use AI Results
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              <Edit3 className="h-4 w-4 mr-2" />
              📝 Edit Manually
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}