
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Copy, Download, Share } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PaymentForm } from './PaymentForm'; 
import { useForm } from 'react-hook-form';
import { PaymentFormValues, usePaymentSubmission } from './usePaymentSubmission';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    toast({
      title: "Copied",
      description: "UPI ID copied to clipboard",
    });
  };

  // Use the appropriate QR code based on the plan price
  const qrCodeSrc = planPrice === 10 
    ? "/lovable-uploads/6ac08848-8cdd-4288-9837-15346b20265a.png" 
    : planPrice === 50
      ? "/lovable-uploads/a0e9067c-ae32-4803-be46-85384a7b9cc2.png"
      : "/lovable-uploads/5a257542-3444-442d-9615-2d39134d3474.png";
  
  // Enhanced QR code sharing function specifically for payment apps
  const handleShareQR = async () => {
    try {
      // Payment-specific text for better context when sharing
      const shareText = `Pay ₹${planPrice} for ${planName} plan on sharefile.lovable.app. Scan the QR code with your UPI app (GPay, PhonePe, etc).`;
      const shareTitle = `Payment QR: ₹${planPrice} for ${planName}`;
      
      // First try sharing as a text link (most widely supported)
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: window.location.href
          });
          toast({
            title: "Shared",
            description: "Payment link shared successfully",
          });
          return;
        } catch (err) {
          console.error("Error sharing URL:", err);
          // Continue to file sharing if URL sharing fails
        }
      }
      
      // If URL sharing isn't supported or fails, try sharing the QR image file
      if (qrImageRef.current && navigator.canShare) {
        try {
          // Create a canvas from the QR code image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) throw new Error("Could not get canvas context");
          
          // Set canvas dimensions to match the image
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
          
          // Check if file sharing is supported
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: shareTitle,
              text: shareText
            });
            toast({
              title: "Shared",
              description: "QR code shared successfully",
            });
            return;
          }
        } catch (err) {
          console.error("Error sharing QR image:", err);
        }
      }
      
      // Fall back to download if sharing isn't supported
      handleDownload();
      toast({
        title: "Downloaded",
        description: "QR code downloaded (sharing not supported on your device)",
      });
      
    } catch (error) {
      console.error("Error sharing:", error);
      // Ultimate fallback
      handleDownload();
      toast({
        title: "Downloaded",
        description: "QR code downloaded instead of shared due to an error",
      });
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
