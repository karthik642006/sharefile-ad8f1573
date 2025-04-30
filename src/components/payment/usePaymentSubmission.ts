
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";

interface PaymentSubmissionOptions {
  planId: string;
  planName: string;
  onClose: () => void;
  user: User | null;
}

interface PaymentFormValues {
  transactionId: string;
  email: string;
}

export const usePaymentSubmission = ({ planId, planName, onClose, user }: PaymentSubmissionOptions) => {
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
      
      // If user is not logged in but provided an email, create an account or get existing
      if (!userId && values.email) {
        const { data: existingUser, error: lookupError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', values.email)
          .single();
        
        if (lookupError && !existingUser) {
          // Create a new user record
          const { data: newUserData, error: createError } = await supabase.auth.signUp({
            email: values.email,
            password: Math.random().toString(36).slice(-8), // Generate a random password
          });
          
          if (createError) throw createError;
          userId = newUserData.user?.id;
        } else if (existingUser) {
          userId = existingUser.id;
        }
      }
      
      if (!userId) {
        throw new Error("Unable to identify user. Please login or provide a valid email.");
      }
      
      // Store subscription record with transaction ID
      const { error } = await supabase.from('subscriptions').insert({
        user_id: userId,
        plan_type: planId,
        amount: parseInt(planName.match(/\d+/)?.[0] || "0"),
        expires_at: expiresAt.toISOString(),
        transaction_id: values.transactionId,
        email: values.email
      });
      
      if (error) throw error;
      
      toast({
        title: "Plan Activated",
        description: `Your ${planName} has been activated successfully!`,
      });
      
      onClose();
      
      // If user is not logged in, redirect to login page
      if (!user) {
        navigate("/login");
      } else {
        navigate("/dashboard");
      }
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
    link.href = "/lovable-uploads/d598ee44-4fce-4163-9046-3541296b752c.png";
    link.download = `payment-qr-code-${planId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Payment QR Code for ${planName}`,
          text: `Scan this QR code to pay for ${planName} plan`,
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

  return {
    isProcessing,
    handleSubmit,
    handleDownload,
    handleShare
  };
};
