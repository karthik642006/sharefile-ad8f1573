
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    id: "basic",
    name: "Free",
    price: "₹0",
    duration: "Forever",
    storage: "2GB",
    fileRetention: "24 hours",
    features: [
      "Public File Sharing",
      "Unlimited Downloads",
      "Files deleted after 24h"
    ],
    popular: false
  },
  {
    id: "5day",
    name: "5 Day Plan",
    price: "₹10",
    duration: "5 days",
    storage: "50GB",
    fileRetention: "5 days",
    features: [
      "Premium Support",
      "Secure Download Links",
      "Folder Upload Support",
      "Files retained for 5 days"
    ],
    popular: true
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "₹50",
    duration: "1 Month",
    storage: "100GB",
    fileRetention: "30 days",
    features: [
      "Premium Support",
      "Priority Downloads",
      "Folder Upload Support",
      "Files retained for 30 days"
    ],
    popular: false
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "₹500",
    duration: "1 Year",
    storage: "200GB",
    fileRetention: "365 days",
    features: [
      "Premium Support",
      "Priority Downloads",
      "Analytics Dashboard",
      "Files retained for 1 year"
    ],
    popular: false
  }
];

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
      now.setDate(now.getDate() + 1); // Default to 1 day
      return now;
  }
};

const Pricing = () => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const subscribeToPlan = async (planId: string, amount: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to login to subscribe to a plan",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    try {
      setIsProcessing(planId);
      
      // Calculate expiration date based on plan
      const expiresAt = calculateExpiryDate(planId);
      
      // For now, we'll simulate a successful payment
      // In production, integrate payment gateway here
      
      // Create subscription record
      const { error } = await supabase.from('subscriptions').insert({
        user_id: user.id,
        plan_type: planId,
        amount: amount,
        expires_at: expiresAt.toISOString(),
      });
      
      if (error) throw error;
      
      toast({
        title: "Plan Activated",
        description: `Your ${planId} subscription has been activated successfully!`,
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#FFDEE2] via-[#e5deff] to-[#d3e4fd] animate-fade-in p-4">
      <div className="w-full max-w-6xl">
        <h2 className="text-3xl font-extrabold text-center text-[#9b87f5] mb-6">Plans &amp; Pricing</h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">Choose the plan that suits your needs. Upgrade anytime to get more storage and longer file retention.</p>
        <div className="flex flex-wrap justify-center gap-4">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`w-[260px] bg-white rounded-xl shadow-lg border p-5 flex flex-col hover-scale transition-all ${
                plan.popular ? 'ring-2 ring-[#9b87f5] transform scale-105' : 'border-gray-100'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 rounded-bl-lg px-3 py-1 bg-[#9b87f5] text-white text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <span className="uppercase tracking-wider text-sm text-gray-400 mb-2">{plan.name}</span>
              <div className="text-2xl font-bold mb-1">{plan.price}</div>
              <div className="text-sm text-gray-500 mb-4">{plan.duration}</div>
              
              <div className="text-sm font-medium mb-2">{plan.storage} Storage</div>
              <ul className="mb-5 text-gray-700 text-sm space-y-2 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>• {feature}</li>
                ))}
              </ul>
              
              <Button
                className={plan.id === "basic" 
                  ? "bg-[#9b87f5] hover:bg-[#7E69AB]" 
                  : "bg-[#33C3F0] hover:bg-[#1493c7]"
                }
                disabled={isProcessing === plan.id}
                onClick={() => subscribeToPlan(plan.id, parseInt(plan.price.replace('₹', '')))}
              >
                {isProcessing === plan.id 
                  ? "Processing..." 
                  : plan.id === "basic" 
                    ? "Get Started" 
                    : "Subscribe"
                }
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
