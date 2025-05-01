
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { QrCodeDisplay } from "@/components/payment/QrCodeDisplay";
import { PaymentForm } from "@/components/payment/PaymentForm";
import { usePaymentSubmission, PaymentFormValues } from "@/components/payment/usePaymentSubmission";
import { useAuth } from "@/contexts/AuthContext";

interface QRCodePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  planPrice: string;
}

export const QRCodePaymentModal = ({ 
  isOpen, 
  onClose, 
  planId, 
  planName, 
  planPrice 
}: QRCodePaymentModalProps) => {
  const { user } = useAuth();
  
  const form = useForm<PaymentFormValues>({
    defaultValues: {
      transactionId: "",
    }
  });
  
  const { 
    isProcessing, 
    handleSubmit, 
    handleDownload, 
    handleShare 
  } = usePaymentSubmission({ 
    planId, 
    planName, 
    planPrice,
    onClose, 
    user 
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center mb-2">Pay with UPI for {planName} (₹{planPrice.replace('₹', '')})</DialogTitle>
          <DialogDescription className="sr-only">Scan QR code to pay with UPI</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          <QrCodeDisplay 
            handleDownload={handleDownload} 
            handleShare={handleShare} 
          />
          
          <PaymentForm 
            form={form} 
            isProcessing={isProcessing} 
            onSubmit={handleSubmit} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
