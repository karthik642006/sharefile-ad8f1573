
import { useEffect } from "react";

export const CacheBuster = () => {
  // Force refresh app version on first load
  useEffect(() => {
    // Add timestamp parameter to force reload assets
    if (window.performance && window.performance.navigation.type === 0) {
      // This is a fresh page load, not a refresh
      const cacheBuster = `?v=${new Date().getTime()}`;
      const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
      const scriptElements = document.querySelectorAll('script[src]');
      
      // Update CSS links
      linkElements.forEach(link => {
        const elem = link as HTMLLinkElement;
        if (elem.href && !elem.href.includes('?v=')) {
          elem.href = `${elem.href}${cacheBuster}`;
        }
      });
      
      // Update JS scripts
      scriptElements.forEach(script => {
        const elem = script as HTMLScriptElement;
        if (elem.src && !elem.src.includes('?v=')) {
          // Create a new script element
          const newScript = document.createElement('script');
          newScript.src = `${elem.src}${cacheBuster}`;
          elem.parentNode?.replaceChild(newScript, elem);
        }
      });
    }
  }, []);

  return null;
};
