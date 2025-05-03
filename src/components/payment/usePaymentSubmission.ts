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
  username?: string;
  email?: string;
  profilePassword?: string;
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
      let userEmail = user?.email;
      let username = values.username;
      
      // Extract amount from planPrice (remove ₹ symbol)
      const amount = parseInt(planPrice.replace(/[^\d]/g, ''));
      
      // If user is logged in, store subscription in subscriptions table
      if (userId && userEmail) {
        // Store subscription record with transaction ID
        const { error } = await supabase.from('subscriptions').insert({
          user_id: userId,
          plan_type: planId,
          amount: amount,
          expires_at: expiresAt.toISOString(),
          transaction_id: values.transactionId,
        });
        
        if (error) throw error;
      }
      
      // For both logged in and guest users, store in plan_purchases table
      if (values.email || userEmail) {
        const { error: purchaseError } = await supabase.from('plan_purchases').insert({
          username: username || (user?.user_metadata?.username as string) || 'guest',
          email: values.email || userEmail || '',
          profile_password: values.profilePassword || null,
          transaction_id: values.transactionId,
          plan_type: planId,
          expires_at: expiresAt.toISOString()
        });
        
        if (purchaseError) throw purchaseError;
      }
      
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
    // Determine which QR code to download based on the plan
    const amount = planPrice.replace('₹', '');
    let qrImagePath;
    
    if (amount === "10") {
      qrImagePath = "/lovable-uploads/6ac08848-8cdd-4288-9837-15346b20265a.png";
    } else if (amount === "50") {
      qrImagePath = "/lovable-uploads/a0e9067c-ae32-4803-be46-85384a7b9cc2.png";
    } else {
      qrImagePath = "/lovable-uploads/5a257542-3444-442d-9615-2d39134d3474.png";
    }
      
    const link = document.createElement('a');
    link.href = qrImagePath;
    link.download = `payment-qr-code-${planId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code Downloaded",
      description: "The QR code has been downloaded to your device.",
    });
  };
  
  const handleShare = async () => {
    try {
      const amount = planPrice.replace('₹', '');
      let qrImagePath;
      
      if (amount === "10") {
        qrImagePath = "/lovable-uploads/6ac08848-8cdd-4288-9837-15346b20265a.png";
      } else if (amount === "50") {
        qrImagePath = "/lovable-uploads/a0e9067c-ae32-4803-be46-85384a7b9cc2.png";
      } else {
        qrImagePath = "/lovable-uploads/5a257542-3444-442d-9615-2d39134d3474.png";
      }
        
      // Create a blob from the QR code image
      const response = await fetch(qrImagePath);
      const blob = await response.blob();
      
      // Create a file from the blob
      const file = new File([blob], `payment-qr-code-${planId}.png`, { type: blob.type });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Payment QR Code for ${planName}`,
          text: `Scan this QR code to pay ${planPrice} for ${planName} plan`,
          files: [file],
        });
        
        toast({
          title: "QR Code Shared",
          description: "The QR code has been shared successfully.",
        });
      } else if (navigator.share) {
        // Fallback to regular share if file sharing not supported
        await navigator.share({
          title: `Payment QR Code for ${planName}`,
          text: `Scan this QR code to pay ${planPrice} for ${planName} plan on sharefile.lovable.app`,
          url: window.location.href,
        });
        
        toast({
          title: "QR Code Link Shared",
          description: "The QR code link has been shared successfully.",
        });
      } else {
        handleDownload(); // Fallback to download if sharing not supported
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
