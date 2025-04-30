
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodePaymentModal } from "@/components/QRCodePaymentModal";

const plans = [
  {
    id: "basic",
    name: "Free",
    price: "₹0",
    duration: "Forever",
    features: [
      "Up to 3 files per month",
      "Each file up to 50MB",
      "Files auto-deleted after 24 hours",
      "Public File Sharing"
    ],
    popular: false
  },
  {
    id: "5day",
    name: "5 Day Plan",
    price: "₹10",
    duration: "5 days",
    features: [
      "Up to 2 files",
      "Each file up to 50MB",
      "Plan expires after 5 days",
      "Files auto-deleted after 24 hours",
      "Includes Free Plan"
    ],
    popular: true
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "₹50",
    duration: "1 Month",
    features: [
      "Up to 10 files per month",
      "Each file up to 100MB",
      "Premium Support",
      "Files auto-deleted after 24 hours",
      "Includes Free Plan"
    ],
    popular: false
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "₹500",
    duration: "1 Year",
    features: [
      "Up to 100 files per year",
      "Each file up to 100MB",
      "Priority Support",
      "Files auto-deleted after 24 hours",
      "Includes Free Plan"
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
      now.setDate(now.getDate() + 30); // Free plan: 30 days
      return now;
  }
};

const Pricing = () => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{id: string; name: string; price: string} | null>(null);

  const subscribeToPlan = async (planId: string, planName: string, planPrice: string) => {
    if (planId === "basic") {
      // For free plan, just show success message (all users have this by default)
      toast({
        title: "Basic Plan Active",
        description: "You can upload up to 3 files per month with the free plan",
      });
      return;
    } else {
      // For paid plans, show QR code payment modal
      setSelectedPlan({
        id: planId,
        name: planName,
        price: planPrice
      });
      setQrModalOpen(true);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#FFDEE2] via-[#e5deff] to-[#d3e4fd] animate-fade-in p-4">
      <div className="w-full max-w-6xl">
        <h2 className="text-3xl font-extrabold text-center text-[#9b87f5] mb-6">Plans &amp; Pricing</h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">Choose the plan that suits your needs. All plans include our free tier features.</p>
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
                onClick={() => subscribeToPlan(plan.id, plan.name, plan.price)}
              >
                {isProcessing === plan.id 
                  ? "Processing..." 
                  : plan.id === "basic" 
                    ? "Use Free Plan" 
                    : "Subscribe"
                }
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>All users get access to the Free plan with 3 file uploads per month, even after subscribing to a paid plan.</p>
          <p className="mt-2">All uploaded files are automatically deleted after 24 hours.</p>
        </div>
      </div>

      {/* QR Code Payment Modal */}
      {selectedPlan && (
        <QRCodePaymentModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
        />
      )}
    </section>
  );
};

export default Pricing;
