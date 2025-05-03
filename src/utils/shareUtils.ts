
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
    
    // Check if browser supports file sharing
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: title || 'Pay using UPI app',
          text: text || 'Scan this QR code with your UPI payment app',
          files: [file]
        });
        return { success: true, message: 'QR Code shared successfully' };
      } catch (shareError) {
        console.error("Error in Web Share API:", shareError);
        
        // If there's an error with file sharing, try URL sharing
        if (navigator.share) {
          await navigator.share({
            title: title || 'Pay using UPI app',
            text: text || 'Use your favorite payment app to scan this QR code',
            url: window.location.href
          });
          return { success: true, message: 'QR Code link shared successfully' };
        }
        
        throw new Error('Web Share API failed');
      }
    } else if (navigator.share) {
      // Fallback to sharing URL if file sharing is not supported
      await navigator.share({
        title: title || 'Pay using UPI app',
        text: text || 'Use GPay, PhonePe or your preferred UPI app',
        url: window.location.href
      });
      return { success: true, message: 'QR Code link shared successfully' };
    } else {
      // Fallback if Web Share API is not supported
      const dataUrl = qrCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, message: 'QR Code downloaded successfully' };
    }
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
