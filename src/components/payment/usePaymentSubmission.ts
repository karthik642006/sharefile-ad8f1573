
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";

interface PaymentSubmissionOptions {
  planId: string;
  planName: string;
  planPrice: string;
  onClose: () => void;
  user: User | null;
}

export interface PaymentFormValues {
  transactionId: string;
}

export const usePaymentSubmission = ({ planId, planName, planPrice, onClose, user }: PaymentSubmissionOptions) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const validateTransactionId = (id: string) => {
    return /^\d{12}$/.test(id); // Check if it's exactly 12 digits
  };

  const handleSubmit = async (values: PaymentFormValues) => {
    if (!validateTransactionId(values.transactionId)) {
      toast({
        title: "Invalid Transaction ID",
        description: "Please enter a valid 12-digit transaction ID",
        variant: "destructive"
      });
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
      
      let userId = user?.id;
      
      // If user is not logged in, show login prompt
      if (!userId) {
        toast({
          title: "Login Required",
          description: "Please login or sign up to activate your plan",
        });
        
        onClose();
        navigate("/login");
        return;
      }
      
      // Extract amount from planPrice (remove ₹ symbol)
      const amount = parseInt(planPrice.replace(/[^\d]/g, ''));
      
      // Store subscription record with transaction ID
      const { error } = await supabase.from('subscriptions').insert({
        user_id: userId,
        plan_type: planId,
        amount: amount,
        expires_at: expiresAt.toISOString(),
        transaction_id: values.transactionId,
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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = "/lovable-uploads/cc644bac-3541-42c2-8ae3-16be39e21429.png";
    link.download = `payment-qr-code-${planId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleShare = async () => {
    try {
      // Create a blob from the QR code image
      const response = await fetch("/lovable-uploads/cc644bac-3541-42c2-8ae3-16be39e21429.png");
      const blob = await response.blob();
      
      // Create a file from the blob
      const file = new File([blob], `payment-qr-code-${planId}.png`, { type: blob.type });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Payment QR Code for ${planName}`,
          text: `Scan this QR code to pay ₹${planPrice.replace('₹', '')} for ${planName} plan`,
          files: [file],
        });
      } else if (navigator.share) {
        // Fallback to regular share if file sharing not supported
        await navigator.share({
          title: `Payment QR Code for ${planName}`,
          text: `Scan this QR code to pay ₹${planPrice.replace('₹', '')} for ${planName} plan on sharefile.lovable.app`,
          url: window.location.href,
        });
      } else {
        toast({
          title: "Share not supported",
          description: "Your browser doesn't support the Web Share API",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Error sharing QR code",
        description: "An error occurred while trying to share the QR code",
        variant: "destructive"
      });
    }
  };

  return {
    isProcessing,
    handleSubmit,
    handleDownload,
    handleShare
  };
};
