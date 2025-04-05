/**
 * Utilities for handling PDFs in the application
 */

/**
 * Extracts filename from a PDF path or URL
 */
export const getPdfFilename = (pdfPath: string): string => {
  if (!pdfPath) return "Document";
  
  // Handle data URLs
  if (pdfPath.startsWith('data:')) {
    return "PDF Document";
  }
  
  // Handle file paths and URLs
  try {
    // Try to parse as a URL
    const url = new URL(pdfPath);
    const pathnameParts = url.pathname.split('/');
    const filename = pathnameParts[pathnameParts.length - 1];
    return filename || "Document";
  } catch {
    // Not a valid URL, treat as file path
    const parts = pdfPath.split('/');
    return parts[parts.length - 1] || "Document";
  }
};

/**
 * Normalizes a PDF path for use with our viewer
 * Handles both URLs and asset names
 */
export const normalizePdfPath = (pdfPath: string): string => {
  // If it's already a URL or data URL, return as is
  if (pdfPath.startsWith('http') || pdfPath.startsWith('data:')) {
    return pdfPath;
  }
  
  // Otherwise assume it's an asset name
  return pdfPath;
};

/**
 * Extracts base64 data from a data URL
 */
export const extractBase64FromDataUrl = (dataUrl: string): { data: string, type: string } | null => {
  if (!dataUrl || !dataUrl.startsWith('data:')) {
    return null;
  }
  
  try {
    const parts = dataUrl.split(';base64,');
    if (parts.length !== 2) {
      return null;
    }
    
    const type = parts[0].split(':')[1];
    const data = parts[1];
    
    return { data, type };
  } catch (error) {
    console.error('Error extracting base64 from data URL:', error);
    return null;
  }
};

/**
 * Creates a blob URL from base64 data
 */
export const createBlobUrlFromBase64 = (base64Data: string, mimeType: string): string | null => {
  try {
    const binary = atob(base64Data);
    const array = new Uint8Array(binary.length);
    
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    
    const blob = new Blob([array], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error creating blob URL from base64:', error);
    return null;
  }
}; 