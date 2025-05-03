
import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { PaymentFormValues } from "./usePaymentSubmission";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentFormProps {
  form: UseFormReturn<PaymentFormValues>;
  isProcessing: boolean;
  onSubmit: (values: PaymentFormValues) => Promise<void>;
}

export const PaymentForm = ({ form, isProcessing, onSubmit }: PaymentFormProps) => {
  const { user } = useAuth();
  const isLoggedIn = !!user;

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

          {!isLoggedIn && (
            <>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Username:</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Email:</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="profilePassword"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Profile Password:</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">This password will be used to access your purchases</p>
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-full bg-[#33C3F0] hover:bg-[#1493c7]"
            disabled={isProcessing || 
              !form.getValues("transactionId") || 
              form.getValues("transactionId").length !== 12 ||
              (!isLoggedIn && (!form.getValues("username") || !form.getValues("email")))
            }
          >
            {isProcessing ? "Processing..." : "Deposit & Activate Plan"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
