'use client';

import { useState, useEffect, useRef } from 'react';

export default function HydrationSuppressor({ children }) {
  // Only render on client-side
  const [isClient, setIsClient] = useState(false);
  const initialized = useRef(false);
  
  useEffect(() => {
    // Function to remove Grammarly-added attributes and any other problematic attributes
    const removeProblematicAttributes = () => {
      if (!document || !document.body) return;
      
      // List of problematic attributes to remove
      const attributesToRemove = [
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'data-gr-ext-id',
        'data-grammarly-source',
        'grammarly',
        'data-grammarly'
      ];
      
      // Elements to clean
      const elementsToClean = [
        document.documentElement,
        document.body,
        ...Array.from(document.querySelectorAll('form, textarea, input, div, span, p'))
      ];
      
      // Remove attributes from each element
      elementsToClean.forEach(element => {
        if (!element) return;
        
        attributesToRemove.forEach(attr => {
          if (element.hasAttribute(attr)) {
            element.removeAttribute(attr);
          }
        });
        
        // Add blocking attributes to relevant elements
        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT' || element.tagName === 'FORM') {
          element.setAttribute('data-gramm', 'false');
          element.setAttribute('data-gramm_editor', 'false');
          element.setAttribute('data-enable-grammarly', 'false');
          element.setAttribute('data-grammarly-extension', 'false');
        }
      });
      
      // Remove any Grammarly elements
      document.querySelectorAll('grammarly-extension, grammarly-button, div[data-grammarly-part="button"]').forEach(el => {
        el.remove();
      });
      
      // Add a style tag to prevent Grammarly elements from being displayed
      if (!document.getElementById('grammarly-blocker')) {
        const style = document.createElement('style');
        style.id = 'grammarly-blocker';
        style.textContent = `
          grammarly-extension,
          grammarly-button,
          div[data-grammarly-part="button"],
          .grammarly-desktop-integration,
          div[data-grammarly-part="highlights"],
          div[data-gramm="true"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
            position: absolute !important;
            overflow: hidden !important;
            pointer-events: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    };
    
    // Run immediately
    removeProblematicAttributes();
    
    // Set up mutation observer to prevent Grammarly from adding attributes back
    const observer = new MutationObserver((mutations) => {
      let shouldCleanup = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName?.startsWith('data-gr-') || 
             mutation.attributeName?.startsWith('data-gramm') ||
             mutation.attributeName?.includes('grammarly'))) {
          shouldCleanup = true;
        }
        
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && // Element node
                (node.tagName?.toLowerCase() === 'grammarly-extension' ||
                 node.tagName?.toLowerCase() === 'grammarly-button' ||
                 node.hasAttribute?.('data-grammarly-part'))) {
              shouldCleanup = true;
            }
          });
        }
      });
      
      if (shouldCleanup) {
        removeProblematicAttributes();
      }
    });
    
    // Start observing
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: [
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'data-gr-ext-id',
        'data-grammarly-source',
        'grammarly',
        'data-grammarly'
      ]
    });
    
    // Set client-side flag
    setIsClient(true);
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Return null during SSR
  if (!isClient) {
    return null;
  }
  
  // Once on client-side, render the actual content
  return (
    <div suppressHydrationWarning={true}>
      {children}
    </div>
  );
} 