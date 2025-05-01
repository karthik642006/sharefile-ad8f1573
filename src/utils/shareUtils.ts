
export const getShareableLink = (fileId: string) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/download/${fileId}`;
};

export const shareApp = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: "Sharefile by Lovable",
        text: "Check out Sharefile by Lovable for secure and instant file sharing!",
        url: window.location.origin,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error sharing app:", error);
    return false;
  }
};
