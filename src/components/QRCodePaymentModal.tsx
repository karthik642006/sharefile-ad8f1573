
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { QrCodeDisplay } from "@/components/payment/QrCodeDisplay";
import { PaymentForm } from "@/components/payment/PaymentForm";
import { usePaymentSubmission } from "@/components/payment/usePaymentSubmission";
import { useAuth } from "@/contexts/AuthContext";

interface QRCodePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  planPrice: string;
}

interface FormValues {
  transactionId: string;
  email: string;
}

export const QRCodePaymentModal = ({ 
  isOpen, 
  onClose, 
  planId, 
  planName, 
  planPrice 
}: QRCodePaymentModalProps) => {
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    defaultValues: {
      transactionId: "",
      email: user?.email || "",
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
    onClose, 
    user 
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center mb-2">Pay with UPI for {planName} (₹{planPrice.replace('₹', '')})</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          <QrCodeDisplay 
            handleDownload={handleDownload} 
            handleShare={handleShare} 
          />
          
          <PaymentForm 
            form={form} 
            isProcessing={isProcessing} 
            onSubmit={(values) => handleSubmit(values)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
