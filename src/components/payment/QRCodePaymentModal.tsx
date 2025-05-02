
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import QRCode from 'qrcode.react';
import { Button } from '../ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planPrice?: number;
  upiId?: string;
}

export const QRCodePaymentModal: React.FC<QRCodePaymentModalProps> = ({
  isOpen,
  onClose,
  planPrice = 500,
  upiId = 'sharefile.lovable.app@okicici',
}) => {
  const paymentValue = `upi://pay?pa=${upiId}&am=${planPrice}&cu=INR&pn=ShareFlow%20Hub`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID copied to clipboard');
  };

  const handleShareQR = async () => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        toast.error('QR Code not found');
        return;
      }
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            toast.error('Failed to generate image');
          }
        }, 'image/png');
      });
      
      // Create file from blob
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
      
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'Share Flow Hub Payment',
          text: `Pay ₹${planPrice} to ${upiId}`,
          files: [file]
        });
        toast.success('QR Code shared successfully');
      } else {
        // Fallback if Web Share API is not supported
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'share-flow-hub-payment.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR Code downloaded successfully');
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      toast.error('Failed to share QR Code');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Scan to pay with any UPI app</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 p-4 bg-gray-900 rounded-lg">
          <div className="bg-white p-2 rounded-lg">
            <img 
              src="/lovable-uploads/3513aa2f-419d-4b06-8ef4-4145750d9a72.png" 
              alt="Payment QR Code"
              className="w-64 h-64 object-contain"
            />
          </div>
          <div className="flex items-center space-x-2 text-white">
            <img src="/lovable-uploads/9676781a-ff43-4b24-b512-340dd4f4ec58.png" alt="Bank Logo" className="h-8" />
            <span className="text-lg">Bank of India 1976</span>
          </div>
          <div className="flex items-center justify-between w-full text-white">
            <div className="flex-1">
              <p>UPI ID: {upiId}</p>
              <p className="font-bold">| ₹{planPrice}</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleCopyUPI}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <Button onClick={handleShareQR}>Share QR Code</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodePaymentModal;
