
/**
 * Utility functions for sharing content
 */

export const shareFile = async (file: File, title?: string, text?: string) => {
  // Check if Web Share API is supported
  if (navigator.share) {
    try {
      await navigator.share({
        title: title || 'Shared File',
        text: text || 'Check out this file I shared with you',
        files: [file]
      });
      return { success: true, message: 'File shared successfully' };
    } catch (error) {
      console.error('Error sharing file:', error);
      return { success: false, message: 'Failed to share file' };
    }
  } else {
    // Fallback for browsers that don't support the Web Share API
    return { success: false, message: 'Web Share API not supported in this browser' };
  }
};

export const shareUrl = async (url: string, title?: string, text?: string) => {
  // Check if Web Share API is supported
  if (navigator.share) {
    try {
      await navigator.share({
        title: title || 'Shared URL',
        text: text || 'Check out this link I shared with you',
        url: url
      });
      return { success: true, message: 'URL shared successfully' };
    } catch (error) {
      console.error('Error sharing URL:', error);
      return { success: false, message: 'Failed to share URL' };
    }
  } else {
    // Fallback for browsers that don't support the Web Share API
    try {
      await navigator.clipboard.writeText(url);
      return { success: true, message: 'URL copied to clipboard' };
    } catch (error) {
      console.error('Error copying URL:', error);
      return { success: false, message: 'Failed to copy URL to clipboard' };
    }
  }
};

export const getShareableLink = (fileId: string) => {
  const origin = window.location.origin;
  return `${origin}/download/${fileId}`;
};

export const shareQRCode = async (qrCanvas: HTMLCanvasElement, title?: string, text?: string) => {
  try {
    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      qrCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image'));
        }
      }, 'image/png');
    });
    
    // Create file from blob
    const file = new File([blob], 'qrcode.png', { type: 'image/png' });
    
    // Try native sharing with files first for payment apps
    if (navigator.share) {
      try {
        // Try direct URL sharing first (works best with most payment apps)
        await navigator.share({
          title: title || 'Pay using UPI app',
          text: text || 'Use GPay, PhonePe or your preferred UPI app',
          url: window.location.href
        });
        return { success: true, message: 'Payment link shared successfully' };
      } catch (urlError) {
        console.error("Error sharing URL:", urlError);
        
        // If URL sharing fails, try file sharing if supported
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: title || 'Pay using UPI app',
              text: text || 'Scan this QR code with your UPI payment app'
            });
            return { success: true, message: 'QR Code shared successfully' };
          } catch (fileError) {
            console.error("Error sharing file:", fileError);
            throw fileError;
          }
        } else {
          throw new Error("File sharing not supported");
        }
      }
    }
    
    // Fallback to download if sharing not supported
    const dataUrl = qrCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true, message: 'QR Code downloaded successfully' };
  } catch (error) {
    console.error('Error sharing QR code:', error);
    return { success: false, message: 'Failed to share QR Code' };
  }
};

// Enhanced shareApp function that works better with social media apps
export const shareApp = async () => {
  const appUrl = window.location.origin;
  const title = 'ShareFile - Securely share your files';
  const text = 'Check out ShareFile, a secure way to share your files instantly! Download now at ' + appUrl;
  
  try {
    // Check if the browser supports the Web Share API
    if (navigator.share) {
      // This will trigger the native share dialog showing available apps
      await navigator.share({
        title: title,
        text: text,
        url: appUrl
      });
      return { success: true, message: 'Choose an app to share with' };
    } else {
      // Fallback for browsers that don't support the Web Share API
      await navigator.clipboard.writeText(appUrl);
      return { success: true, message: 'App URL copied to clipboard' };
    }
  } catch (error) {
    console.error('Error sharing app:', error);
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(appUrl);
      return { success: true, message: 'App URL copied to clipboard' };
    } catch (clipboardError) {
      return { success: false, message: 'Failed to share app' };
    }
  }
};

// New helper function for direct UPI app sharing (GPay, PhonePe, etc)
export const sharePaymentQR = async (qrImageSrc: string, amount: number, description: string) => {
  try {
    // First try sharing the URL (best for payment apps)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pay ₹${amount} via UPI`,
          text: `${description}. Scan QR code with GPay, PhonePe or any UPI app`,
          url: window.location.href
        });
        return { success: true, message: 'Payment link shared successfully' };
      } catch (err) {
        console.error("URL sharing failed:", err);
      }
    }
    
    // If URL sharing fails, try image sharing
    // First, create an image element and load the QR code
    const img = new Image();
    
    // Create a promise to wait for image loading
    const imageLoaded = new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load QR image"));
    });
    
    // Set image source and start loading
    img.src = qrImageSrc;
    img.crossOrigin = "anonymous";
    
    // Wait for image to load
    await imageLoaded;
    
    // Create a canvas and draw the image
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }
    
    ctx.drawImage(img, 0, 0);
    
    // Convert to blob and file
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to create blob"));
      }, 'image/png');
    });
    
    const file = new File([blob], 'payment_qr.png', { type: 'image/png' });
    
    // Try file sharing if supported
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Pay ₹${amount} via UPI`,
          text: description
        });
        return { success: true, message: 'QR code shared successfully' };
      } catch (fileError) {
        console.error("File sharing failed:", fileError);
        throw fileError;
      }
    }
    
    // Final fallback - download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'payment_qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true, message: 'QR code downloaded' };
    
  } catch (error) {
    console.error("Error in sharePaymentQR:", error);
    return { success: false, message: 'Failed to share payment QR' };
  }
};
