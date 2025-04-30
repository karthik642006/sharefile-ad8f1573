
import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { PaymentFormValues } from "./usePaymentSubmission";

interface PaymentFormProps {
  form: UseFormReturn<PaymentFormValues>;
  isProcessing: boolean;
  onSubmit: (values: PaymentFormValues) => Promise<void>;
}

export const PaymentForm = ({ form, isProcessing, onSubmit }: PaymentFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="flex flex-col items-center space-y-4">
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
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-full bg-[#33C3F0] hover:bg-[#1493c7]"
            disabled={isProcessing || !form.getValues("transactionId") || form.getValues("transactionId").length !== 12}
          >
            {isProcessing ? "Processing..." : "Deposit & Activate Plan"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
