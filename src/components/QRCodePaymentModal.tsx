
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import QRCode from 'qrcode.react';

interface QRCodePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  planPrice: string;
}

export function QRCodePaymentModal({ isOpen, onClose, planId, planName, planPrice }: QRCodePaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase a plan",
        variant: "destructive",
      });
      onClose();
      return;
    }

    setIsProcessing(true);

    try {
      // Create a payment record in Supabase
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          amount: parseFloat(planPrice.replace('₹', '')),
          status: 'completed',
          transaction_id: `tr_${Math.random().toString(36).substring(2, 15)}`,
        })
        .select();

      if (error) throw error;

      // Update user metadata with the new subscription
      const expiryDate = calculateExpiryDate(planId);
      
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          subscription_plan: planId,
          subscription_expiry: expiryDate.toISOString(),
        },
      });

      if (updateError) throw updateError;

      toast({
        title: "Payment Successful",
        description: `You've successfully subscribed to the ${planName} plan!`,
      });
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateExpiryDate = (plan: string) => {
    const now = new Date();
    switch (plan) {
      case "5day":
        now.setDate(now.getDate() + 5);
        return now;
      case "monthly":
        now.setMonth(now.getMonth() + 1);
        return now;
      case "yearly":
        now.setFullYear(now.getFullYear() + 1);
        return now;
      default:
        now.setDate(now.getDate() + 30); // Free plan: 30 days
        return now;
    }
  };

  const paymentLink = `upi://pay?pa=example@upi&pn=FileService&am=${planPrice.replace('₹', '')}&cu=INR&tn=${planName} Subscription`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code to Pay</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 p-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCode value={paymentLink} size={200} />
          </div>
          <div className="text-center">
            <p className="mb-2"><span className="font-semibold">{planName}</span> - {planPrice}</p>
            <p className="text-sm text-gray-500 mb-4">Scan the QR code with any UPI payment app</p>
          </div>
          <Button 
            className="w-full" 
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "I've Completed Payment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
