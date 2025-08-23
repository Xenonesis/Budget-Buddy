"use client";

import { useState } from "react";
import { FileUpload } from "./file-upload";
import { OCRProcessor, ExtractedTransactionData } from "@/lib/ocr-processor";
import { Button } from "./button";
import { Card } from "./card";
import { Badge } from "./badge";
import { 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  Calendar, 
  DollarSign, 
  Tag, 
  FileText,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface OCRUploadProps {
  onDataExtracted: (data: ExtractedTransactionData) => void;
  onClose: () => void;
}

export function OCRUpload({ onDataExtracted, onClose }: OCRUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedTransactionData | null>(null);
  const [ocrProcessor] = useState(() => new OCRProcessor());

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setExtractedData(null);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setExtractedData(null);
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      let data: ExtractedTransactionData;
      
      if (selectedFile.type === 'application/pdf') {
        data = await ocrProcessor.processPDF(selectedFile);
      } else {
        data = await ocrProcessor.processImage(selectedFile);
      }

      setExtractedData(data);
      
      if (data.confidence && data.confidence > 50) {
        toast.success(`Transaction data extracted with ${Math.round(data.confidence)}% confidence`);
      } else {
        toast.warning("Low confidence extraction. Please review the data carefully.");
      }
    } catch (error) {
      console.error('OCR processing failed:', error);
      toast.error('Failed to extract transaction data. Please try again or enter manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      onClose();
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "gray";
    if (confidence >= 80) return "green";
    if (confidence >= 60) return "yellow";
    return "red";
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return "Not detected";
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "Not detected";
    try {
      const parsedDate = new Date(date);
      return parsedDate.toLocaleDateString('en-IN');
    } catch {
      return date;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Smart Invoice Processing
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload your invoice, receipt, or payment screenshot to automatically extract transaction details
        </p>
      </div>

      <FileUpload
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
        selectedFile={selectedFile}
        isProcessing={isProcessing}
        accept="image/*,.pdf"
        maxSize={10}
      />

      {selectedFile && !extractedData && (
        <div className="text-center">
          <Button 
            onClick={processFile} 
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Extract Transaction Data
              </>
            )}
          </Button>
        </div>
      )}

      {extractedData && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Extracted Data
            </h4>
            {extractedData.confidence && (
              <Badge variant={getConfidenceColor(extractedData.confidence) as any}>
                {Math.round(extractedData.confidence)}% confidence
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatAmount(extractedData.amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatDate(extractedData.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {extractedData.category || "Not detected"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-orange-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {extractedData.description || "Not detected"}
                  </p>
                </div>
              </div>

              {extractedData.merchant && (
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Merchant</p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {extractedData.merchant}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className={`h-5 w-5 rounded-full ${
                  extractedData.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</p>
                  <p className="text-gray-900 dark:text-gray-100 capitalize">
                    {extractedData.type || 'expense'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {extractedData.confidence && extractedData.confidence < 60 && (
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Low Confidence Detection
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Please review and edit the extracted data before saving.
                </p>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button onClick={handleUseData} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Use This Data
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Manually
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}