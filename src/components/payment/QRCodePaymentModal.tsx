
import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { usePaymentSubmission, PaymentFormValues } from "./usePaymentSubmission";
import { PaymentForm } from "./PaymentForm";

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
  const form = useForm<PaymentFormValues>({
    defaultValues: {
      transactionId: "",
    }
  });

  const { isProcessing, handleSubmit, handleDownload, handleShare } = usePaymentSubmission({
    planId,
    planName,
    planPrice,
    onClose,
    user: null, // This will be populated from AuthContext
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay ₹{planPrice.replace('₹', '')} for {planName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          <div className="bg-black p-4 rounded-lg">
            <div className="flex flex-col items-center text-white mb-2">
              <div className="flex items-center">
                <div className="bg-[#FF6B00] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                  <span className="text-xl font-bold">S</span>
                </div>
                <span className="text-lg">Sharefile.lovable.app</span>
              </div>
            </div>
            <QRCodeSVG 
              value="upi://pay?pa=sharefile.lovable.app@okicici&pn=Sharefile+Payment&am=10.00&cu=INR&tn=Payment+for+Sharefile+Plan" 
              size={200}
              imageSettings={{
                src: "/lovable-uploads/cc644bac-3541-42c2-8ae3-16be39e21429.png",
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
            <div className="text-center text-white mt-2">
              <p>Scan to pay with any UPI app</p>
              <div className="flex items-center justify-center mt-2">
                <img 
                  src="/lovable-uploads/9676781a-ff43-4b24-b512-340dd4f4ec58.png" 
                  alt="Bank logo" 
                  className="h-8 w-8 mr-2"
                />
                <span>Bank of India 1976</span>
              </div>
              <p className="mt-2">UPI ID: sharefile.lovable.app@okicici</p>
            </div>
          </div>
          
          <div className="flex space-x-2 w-full">
            <Button 
              onClick={handleDownload} 
              className="flex-1 bg-[#33C3F0] hover:bg-[#1493c7]"
            >
              Download QR
            </Button>
            <Button 
              onClick={handleShare} 
              className="flex-1 bg-[#33C3F0] hover:bg-[#1493c7]"
            >
              Share QR
            </Button>
          </div>
          
          <div className="w-full border-t pt-4">
            <PaymentForm 
              form={form} 
              isProcessing={isProcessing}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
