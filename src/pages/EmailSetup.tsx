
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const EmailSetup = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Email Setup Instructions</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Configuring Cloudflare Nameservers</CardTitle>
          <CardDescription>Follow these steps to set up your domain with Cloudflare</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              These changes are made at your domain registrar, not within this application.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Step 1: Log into your DNS provider</h3>
              <p>Log into your DNS provider (most likely your domain registrar). If you purchased your domain through a reseller (e.g., Squarespace) or use a separate DNS provider, log into that account instead.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Step 2: Make sure DNSSEC is off</h3>
              <p>Find and turn off the DNS security (DNSSEC) setting if it is on. You can re-enable it later through Cloudflare.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Step 3: Replace your current nameservers with Cloudflare nameservers</h3>
              <p>Find the nameservers section in your registrar's dashboard.</p>
              <div className="p-4 bg-gray-100 rounded-md my-2">
                <p className="font-medium">Add both of your assigned Cloudflare nameservers:</p>
                <ul className="list-disc list-inside ml-4">
                  <li className="font-mono">irena.ns.cloudflare.com</li>
                  <li className="font-mono">mustafa.ns.cloudflare.com</li>
                </ul>
              </div>
              <p>Delete any other nameservers that may be listed.</p>
              <p>Save your changes.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Step 4: Set up email records in Cloudflare</h3>
              <p>After your nameservers propagate:</p>
              <ol className="list-decimal list-inside ml-4">
                <li>Log in to your Cloudflare account</li>
                <li>Select your domain</li>
                <li>Go to the DNS tab</li>
                <li>Add MX records for your email provider (like Google Workspace, Microsoft 365, or another email service)</li>
                <li>Add any required TXT records for email verification (SPF, DKIM, DMARC)</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Step 5: Sign up for an email service</h3>
              <p>To create work emails with your domain, you'll need to sign up for an email hosting service like:</p>
              <ul className="list-disc list-inside ml-4">
                <li>Google Workspace (formerly G Suite)</li>
                <li>Microsoft 365</li>
                <li>Zoho Mail</li>
                <li>Proton Mail</li>
              </ul>
              <p>Follow their specific instructions to connect your domain and create email accounts.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>DNS Propagation Time</CardTitle>
          <CardDescription>Important information about the process</CardDescription>
        </CardHeader>
        <CardContent>
          <p>After changing nameservers, it typically takes 24-48 hours for these changes to propagate across the internet. During this time, some users might see the old configuration while others see the new one.</p>
          <p className="mt-2">You can check the propagation status using tools like <a href="https://www.whatsmydns.net/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">whatsmydns.net</a></p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSetup;
