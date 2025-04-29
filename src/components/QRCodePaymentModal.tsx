
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface QRCodePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  planPrice: string;
}

export const QRCodePaymentModal = ({ isOpen, onClose, planId, planName, planPrice }: QRCodePaymentModalProps) => {
  const [transactionId, setTransactionId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Payment QR Code for ${planName}`,
          text: `Scan this QR code to pay ₹${planPrice.replace('₹', '')} for ${planName} plan`,
          url: window.location.href,
        });
      } else {
        toast({
          title: "Share not supported",
          description: "Your browser doesn't support the Share API",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = "/lovable-uploads/ef215312-3e12-4d54-acd0-82e31bda3fd7.png";
    link.download = `payment-qr-code-${planId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const validateTransactionId = (id: string) => {
    return /^\d{12}$/.test(id); // Check if it's exactly 12 digits
  };
  
  const handleSubmitTransaction = async () => {
    if (!validateTransactionId(transactionId)) {
      toast({
        title: "Invalid Transaction ID",
        description: "Please enter a valid 12-digit transaction ID",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to login to subscribe to a plan",
        variant: "destructive"
      });
      onClose();
      navigate("/login");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Calculate expiration date based on plan
      const now = new Date();
      let expiresAt = new Date();
      
      switch (planId) {
        case "5day":
          expiresAt.setDate(now.getDate() + 5);
          break;
        case "monthly":
          expiresAt.setMonth(now.getMonth() + 1);
          break;
        case "yearly":
          expiresAt.setFullYear(now.getFullYear() + 1);
          break;
        default:
          expiresAt.setDate(now.getDate() + 30); // Default to 30 days
      }
      
      // Parse price to get amount
      const amount = parseInt(planPrice.replace('₹', ''));
      
      // Store subscription record with transaction ID
      const { error } = await supabase.from('subscriptions').insert({
        user_id: user.id,
        plan_type: planId,
        amount: amount,
        expires_at: expiresAt.toISOString(),
        transaction_id: transactionId
      });
      
      if (error) throw error;
      
      toast({
        title: "Plan Activated",
        description: `Your ${planName} has been activated successfully!`,
      });
      
      onClose();
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center mb-2">Pay with UPI for {planName} (₹{planPrice.replace('₹', '')})</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div className="border p-2 bg-white rounded-md w-full">
            <img 
              src="/lovable-uploads/ef215312-3e12-4d54-acd0-82e31bda3fd7.png" 
              alt="Payment QR Code" 
              className="w-full object-contain"
            />
          </div>
          <div className="text-center text-sm text-gray-500">
            <p>Scan to pay with any UPI app</p>
            <p>UPI ID: sharefile.lovable.app@okhdfcbank</p>
          </div>
          <div className="flex gap-3 justify-center w-full">
            <Button 
              variant="outline" 
              onClick={handleDownload}
              className="flex-1"
            >
              Download QR
            </Button>
            <Button 
              variant="outline" 
              onClick={handleShare}
              className="flex-1"
            >
              Share QR
            </Button>
          </div>
          <div className="w-full space-y-2">
            <label className="text-sm font-medium">Enter 12-digit Transaction ID:</label>
            <Input
              placeholder="123456789012"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              maxLength={12}
            />
            <p className="text-xs text-gray-500">Enter the transaction ID from your UPI app after payment</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmitTransaction}
            className="w-full bg-[#33C3F0] hover:bg-[#1493c7]"
            disabled={isProcessing || transactionId.length !== 12}
          >
            {isProcessing ? "Processing..." : "Verify & Activate Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
