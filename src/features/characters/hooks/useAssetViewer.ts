import { useState } from 'react';

export const useAssetViewer = () => {
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfAsset, setCurrentPdfAsset] = useState('');
  const [markdownDialogOpen, setMarkdownDialogOpen] = useState(false);
  const [currentMarkdownContent, setCurrentMarkdownContent] = useState('');
  const [currentMarkdownTitle, setCurrentMarkdownTitle] = useState('');
  
  const viewPdf = (pdfAsset: string) => {
    setCurrentPdfAsset(pdfAsset);
    setPdfViewerOpen(true);
  };
  
  const viewMarkdown = (content: string, title: string) => {
    setCurrentMarkdownContent(content);
    setCurrentMarkdownTitle(title);
    setMarkdownDialogOpen(true);
  };
  
  const closeAssetViewer = () => {
    setPdfViewerOpen(false);
    setMarkdownDialogOpen(false);
  };
  
  return {
    pdfViewerOpen,
    currentPdfAsset,
    markdownDialogOpen,
    currentMarkdownContent,
    currentMarkdownTitle,
    viewPdf,
    viewMarkdown,
    closeAssetViewer
  };
}; 