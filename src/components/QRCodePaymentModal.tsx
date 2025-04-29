
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

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

export const QRCodePaymentModal = ({ isOpen, onClose, planId, planName, planPrice }: QRCodePaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    defaultValues: {
      transactionId: "",
      email: user?.email || "",
    }
  });
  
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
    link.href = "/lovable-uploads/5ff00fa8-2352-4ed4-a053-759205327dd0.png";
    link.download = `payment-qr-code-${planId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const validateTransactionId = (id: string) => {
    return /^\d{12}$/.test(id); // Check if it's exactly 12 digits
  };
  
  const onSubmit = async (values: FormValues) => {
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
      
      // Parse price to get amount
      const amount = parseInt(planPrice.replace('₹', ''));
      
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
        amount: amount,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center mb-2">Pay with UPI for {planName} (₹{planPrice.replace('₹', '')})</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="border p-2 bg-white rounded-md w-full flex justify-center">
                <img 
                  src="/lovable-uploads/5ff00fa8-2352-4ed4-a053-759205327dd0.png" 
                  alt="Payment QR Code" 
                  className="w-64 h-64 object-contain"
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
                  type="button"
                >
                  Download QR
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleShare}
                  className="flex-1"
                  type="button"
                >
                  Share QR
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Enter 12-digit Transaction ID:</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456789012"
                        maxLength={12}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">Enter the transaction ID from your UPI app after payment</p>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Your Email:</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">Provide your email to activate your plan</p>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-[#33C3F0] hover:bg-[#1493c7]"
                disabled={isProcessing || !form.getValues("transactionId") || form.getValues("transactionId").length !== 12}
              >
                {isProcessing ? "Processing..." : "Verify & Activate Plan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
