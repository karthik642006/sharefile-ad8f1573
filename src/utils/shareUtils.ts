
export const getShareableLink = (fileId: string) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/download/${fileId}`;
};
