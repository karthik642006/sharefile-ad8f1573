
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { shareQRCode } from '@/utils/shareUtils';
import { PaymentForm } from './PaymentForm'; 
import { useForm } from 'react-hook-form';
import { PaymentFormValues, usePaymentSubmission } from './usePaymentSubmission';

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
  const form = useForm<PaymentFormValues>({
    defaultValues: {
      transactionId: '',
    },
  });

  const { isProcessing, handleSubmit } = usePaymentSubmission({ 
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

  const handleShareQR = async () => {
    try {
      // Get the QR code image element
      const qrImage = document.querySelector('.payment-qr-image') as HTMLImageElement;
      
      if (!qrImage) {
        toast.error('QR Code not found');
        return;
      }
      
      // Create a canvas element to convert the image to a canvas
      const canvas = document.createElement('canvas');
      canvas.width = qrImage.naturalWidth || 500;
      canvas.height = qrImage.naturalHeight || 500;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error('Failed to create canvas context');
        return;
      }
      
      // Draw the image on the canvas
      ctx.drawImage(qrImage, 0, 0, canvas.width, canvas.height);
      
      // Share the QR code using the shareQRCode utility
      const result = await shareQRCode(canvas, 'Share Flow Hub Payment', `Pay ₹${planPrice} to ${upiId}`);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      toast.error('Failed to share QR Code');
    }
  };

  // Use the new 50 rs QR code for the monthly plan
  const qrCodeSrc = planPrice === 50 
    ? "/lovable-uploads/a0e9067c-ae32-4803-be46-85384a7b9cc2.png" 
    : "/lovable-uploads/5a257542-3444-442d-9615-2d39134d3474.png";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Scan to pay with any UPI app</DialogTitle>
          <DialogDescription className="text-center">
            Please scan the QR code below and enter the transaction ID
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 p-4 bg-gray-900 rounded-lg">
          <div className="bg-white p-2 rounded-lg">
            <img 
              src={qrCodeSrc} 
              alt="Payment QR Code"
              className="w-64 h-64 object-contain payment-qr-image"
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
        </div>

        {/* Transaction ID input form */}
        <div className="mt-4 bg-white rounded-lg p-4">
          <PaymentForm 
            form={form} 
            isProcessing={isProcessing}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="flex justify-center mt-4">
          <Button onClick={handleShareQR} variant="outline">Share QR Code</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodePaymentModal;
