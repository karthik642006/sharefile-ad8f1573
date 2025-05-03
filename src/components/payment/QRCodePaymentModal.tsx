
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Copy, Download, Share, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentForm } from './PaymentForm'; 
import { useForm } from 'react-hook-form';
import { PaymentFormValues, usePaymentSubmission } from './usePaymentSubmission';
import { ScrollArea } from '@/components/ui/scroll-area';
import { shareQRCode } from '@/utils/shareUtils';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  
  const form = useForm<PaymentFormValues>({
    defaultValues: {
      transactionId: '',
      username: '',
      email: '',
      profilePassword: '',
    },
  });

  const { isProcessing, handleSubmit, handleDownload } = usePaymentSubmission({ 
    planId, 
    planName, 
    planPrice: `₹${planPrice}`,
    onClose,
    user
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
  
  // Enhanced QR code sharing function specifically for payment apps
  const handleShareQR = async () => {
    try {
      // First try sharing the URL with custom text for payment context
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Pay ₹${planPrice} for ${planName}`,
            text: `Scan this QR code with GPay, PhonePe or your preferred UPI app to pay ₹${planPrice} for ${planName} on sharefile.lovable.app`,
            url: window.location.href
          });
          toast.success("Payment link shared successfully");
          return;
        } catch (err) {
          console.error("Error sharing URL:", err);
          // Continue to fallback methods if URL sharing fails
        }
      }
      
      // If direct URL sharing fails or isn't supported, try sharing the QR image
      if (qrImageRef.current) {
        try {
          // Create a canvas from the QR code image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) throw new Error("Could not get canvas context");
          
          // Match canvas dimensions to image
          canvas.width = qrImageRef.current.naturalWidth || 300;
          canvas.height = qrImageRef.current.naturalHeight || 300;
          
          // Draw the image onto the canvas
          ctx.drawImage(qrImageRef.current, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to blob
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => {
              if (b) resolve(b);
              else reject(new Error("Failed to create blob"));
            }, 'image/png');
          });
          
          // Create file from blob
          const file = new File([blob], `payment-qr-code-${planId}.png`, { type: 'image/png' });
          
          // Try to share file if supported
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Payment QR Code for ${planName}`,
              text: `Scan this QR code to pay ₹${planPrice} for ${planName}`
            });
            toast.success("QR code shared successfully");
            return;
          }
        } catch (err) {
          console.error("Error sharing QR image:", err);
        }
      }
      
      // Final fallback - download the image
      handleDownload();
      toast.success("QR Code downloaded instead");
      
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Could not share QR code");
      
      // Ultimate fallback
      try {
        handleDownload();
        toast.success("QR Code downloaded instead");
      } catch (downloadError) {
        toast.error("Could not download QR code");
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
