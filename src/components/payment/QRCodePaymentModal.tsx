
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Copy, Download, Share } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentForm } from './PaymentForm'; 
import { useForm } from 'react-hook-form';
import { PaymentFormValues, usePaymentSubmission } from './usePaymentSubmission';
import { ScrollArea } from '@/components/ui/scroll-area';
import { shareQRCode } from '@/utils/shareUtils';

interface QRCodePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planPrice?: number;
  planId?: string;
  planName?: string;
  upiId?: string;
}

export const QRCodePaymentModal: React.FC<QRCodePaymentModalProps> = ({
  isOpen,
  onClose,
  planPrice = 500,
  planId = "yearly",
  planName = "Yearly Plan",
  upiId = 'sharefile.lovable.app@okicici',
}) => {
  // Create a reference to the QR code image
  const qrImageRef = useRef<HTMLImageElement | null>(null);
  
  const form = useForm<PaymentFormValues>({
    defaultValues: {
      transactionId: '',
    },
  });

  const { isProcessing, handleSubmit, handleDownload } = usePaymentSubmission({ 
    planId, 
    planName, 
    planPrice: `₹${planPrice}`,
    onClose,
    user: null
  });

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID copied to clipboard');
  };

  // Use the uploaded QR code for the 10rs plan and existing QR for others
  const qrCodeSrc = planPrice === 10 
    ? "/lovable-uploads/6ac08848-8cdd-4288-9837-15346b20265a.png" 
    : planPrice === 50
      ? "/lovable-uploads/a0e9067c-ae32-4803-be46-85384a7b9cc2.png"
      : "/lovable-uploads/5a257542-3444-442d-9615-2d39134d3474.png";
  
  // Enhanced QR code sharing function
  const handleShareQR = async () => {
    try {
      // Create a canvas element from the QR code image
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!qrImageRef.current || !context) {
        throw new Error('Could not create canvas context');
      }
      
      // Set canvas dimensions to match the QR code image
      canvas.width = qrImageRef.current.naturalWidth || 300;
      canvas.height = qrImageRef.current.naturalHeight || 300;
      
      // Draw the image onto the canvas
      context.drawImage(qrImageRef.current, 0, 0);
      
      // Share the QR code using our utility function
      const shareResult = await shareQRCode(canvas, 
        `Payment QR Code for ${planName}`,
        `Scan this QR code to pay ₹${planPrice} for ${planName} plan on sharefile.lovable.app`
      );
      
      if (shareResult.success) {
        toast.success(shareResult.message);
      } else {
        // If sharing fails, try to download instead
        handleDownload();
        toast.success('QR Code downloaded instead');
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error('Failed to share QR code');
      
      // Try fallback download on sharing error
      try {
        handleDownload();
        toast.success('QR Code downloaded instead');
      } catch (downloadError) {
        toast.error('Could not download QR code');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Scan to pay with any UPI app</DialogTitle>
          <DialogDescription className="text-center">
            Please scan the QR code below and enter the transaction ID
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="flex flex-col items-center space-y-4 p-4 bg-gray-900 rounded-lg">
            <div className="bg-white p-2 rounded-lg">
              <img 
                ref={qrImageRef}
                src={qrCodeSrc} 
                alt="Payment QR Code"
                className="w-64 h-64 object-contain payment-qr-image"
                crossOrigin="anonymous"
              />
            </div>
            <div className="flex items-center space-x-2 text-white">
              <img src="/lovable-uploads/9676781a-ff43-4b24-b512-340dd4f4ec58.png" alt="Bank Logo" className="h-8" />
              <span className="text-lg">Bank of India 1976</span>
            </div>
            <div className="flex items-center justify-between w-full text-white">
              <div className="flex-1">
                <p>UPI ID: {upiId}</p>
                <p className="font-bold">| ₹{planPrice}</p>
              </div>
              <Button variant="outline" size="icon" onClick={handleCopyUPI}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex justify-center w-full gap-3">
              <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download QR
              </Button>
              <Button onClick={handleShareQR} variant="outline" className="flex items-center gap-2">
                <Share className="h-4 w-4" />
                Share QR Code
              </Button>
            </div>
          </div>

          {/* Transaction ID input form */}
          <div className="mt-4 bg-white rounded-lg p-4">
            <PaymentForm 
              form={form} 
              isProcessing={isProcessing}
              onSubmit={handleSubmit}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodePaymentModal;
