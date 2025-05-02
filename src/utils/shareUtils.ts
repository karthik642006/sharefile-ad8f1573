
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
    
    // Use Web Share API if available
    if (navigator.share) {
      await navigator.share({
        title: title || 'Share QR Code',
        text: text || 'Scan this QR code',
        files: [file]
      });
      return { success: true, message: 'QR Code shared successfully' };
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

// Add the new shareApp function
export const shareApp = async () => {
  const appUrl = window.location.origin;
  const title = 'ShareFile - Securely share your files';
  const text = 'Check out ShareFile, a secure way to share your files instantly!';
  
  return await shareUrl(appUrl, title, text);
};
