
import React from "react";
import { Button } from "@/components/ui/button";

interface QrCodeDisplayProps {
  handleDownload: () => void;
  handleShare: () => void;
}

export const QrCodeDisplay = ({ handleDownload, handleShare }: QrCodeDisplayProps) => {
  return (
    <>
      <div className="border p-2 bg-white rounded-md w-full flex justify-center">
        <img 
          src="/lovable-uploads/9676781a-ff43-4b24-b512-340dd4f4ec58.png" 
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
    </>
  );
};
