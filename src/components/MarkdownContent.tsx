import React, { useState, useEffect } from 'react';
// Dynamically import ReactMarkdown to ensure it's included in production builds
import ReactMarkdown from 'react-markdown';
// Add remarkGfm for GitHub Flavored Markdown (tables, strikethrough, etc.)
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
  className?: string;
  debug?: boolean;
  disableParaTags?: boolean;
  sx?: Record<string, any>;
}

// Utility function to detect if a string contains markdown
const containsMarkdown = (text: string): boolean => {
  const markdownPatterns = [
    /^#+\s/, // headers
    /\*\*.*\*\*/, // bold
    /\*.*\*/, // italic
    /\[.*\]\(.*\)/, // links
    /!\[.*\]\(.*\)/, // images
    /^\s*[\*\-\+]\s/, // unordered lists
    /^\s*\d+\.\s/, // ordered lists
    /^\s*>\s/, // blockquotes
    /`.*`/, // inline code
    /```[\s\S]*```/, // code blocks
    /\|.*\|.*\|/, // tables
  ];

  return markdownPatterns.some(pattern => pattern.test(text));
};

// Simple markdown renderer without dependencies
const SimpleMarkdownRenderer: React.FC<{content: string}> = ({ content }) => {
  // Convert content to HTML using simple regex replacements
  const processMarkdown = (text: string): string => {
    let processed = text;
    
    // Headers
    processed = processed.replace(/^# (.*)$/gm, '<h1>$1</h1>');
    processed = processed.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    processed = processed.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    
    // Bold and italic
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Lists (simple approach)
    processed = processed.replace(/^\* (.*)$/gm, '<li>$1</li>');
    
    // Line breaks
    processed = processed.replace(/\n/g, '<br />');
    
    return processed;
  };
  
  const htmlContent = processMarkdown(content);
  
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
};

const MarkdownContent: React.FC<MarkdownContentProps> = ({ 
  content, 
  className = '', 
  debug = false, 
  disableParaTags = false,
  sx = {}
}) => {
  const [error, setError] = useState<boolean>(false);
  const [markdownDetected, setMarkdownDetected] = useState<boolean>(false);
  const [useSimpleRenderer, setUseSimpleRenderer] = useState<boolean>(false);

  useEffect(() => {
    // Check if ReactMarkdown is available
    if (typeof ReactMarkdown !== 'function') {
      console.error('ReactMarkdown is not available');
      setError(true);
      setUseSimpleRenderer(true);
    }

    // Check if content appears to contain markdown
    setMarkdownDetected(containsMarkdown(content));
  }, [content]);

  // Convert sx props to inline styles
  const inlineStyle: React.CSSProperties = {};
  
  // Handle common sx properties
  if (sx.width) inlineStyle.width = sx.width;
  if (sx.minWidth) inlineStyle.minWidth = sx.minWidth;
  if (sx.maxWidth) inlineStyle.maxWidth = sx.maxWidth;
  if (sx.height) inlineStyle.height = sx.height;
  if (sx.minHeight) inlineStyle.minHeight = sx.minHeight;
  if (sx.maxHeight) inlineStyle.maxHeight = sx.maxHeight;
  if (sx.mt) inlineStyle.marginTop = `${sx.mt * 0.25}rem`;
  if (sx.mb) inlineStyle.marginBottom = `${sx.mb * 0.25}rem`;
  if (sx.ml) inlineStyle.marginLeft = `${sx.ml * 0.25}rem`;
  if (sx.mr) inlineStyle.marginRight = `${sx.mr * 0.25}rem`;
  if (sx.mx) inlineStyle.marginLeft = inlineStyle.marginRight = `${sx.mx * 0.25}rem`;
  if (sx.my) inlineStyle.marginTop = inlineStyle.marginBottom = `${sx.my * 0.25}rem`;
  if (sx.m) inlineStyle.margin = `${sx.m * 0.25}rem`;
  if (sx.p) inlineStyle.padding = `${sx.p * 0.25}rem`;
  if (sx.pt) inlineStyle.paddingTop = `${sx.pt * 0.25}rem`;
  if (sx.pb) inlineStyle.paddingBottom = `${sx.pb * 0.25}rem`;
  if (sx.pl) inlineStyle.paddingLeft = `${sx.pl * 0.25}rem`;
  if (sx.pr) inlineStyle.paddingRight = `${sx.pr * 0.25}rem`;
  if (sx.px) inlineStyle.paddingLeft = inlineStyle.paddingRight = `${sx.px * 0.25}rem`;
  if (sx.py) inlineStyle.paddingTop = inlineStyle.paddingBottom = `${sx.py * 0.25}rem`;
  if (sx.fontSize) inlineStyle.fontSize = sx.fontSize;
  if (sx.fontWeight) inlineStyle.fontWeight = sx.fontWeight;
  if (sx.lineHeight) inlineStyle.lineHeight = sx.lineHeight;
  if (sx.color) inlineStyle.color = sx.color;
  if (sx.textAlign) inlineStyle.textAlign = sx.textAlign;
  if (sx.display) inlineStyle.display = sx.display;
  if (sx.overflow) inlineStyle.overflow = sx.overflow;
  if (sx.WebkitLineClamp) inlineStyle.WebkitLineClamp = sx.WebkitLineClamp;
  if (sx.WebkitBoxOrient) inlineStyle.WebkitBoxOrient = sx.WebkitBoxOrient;

  // Add debugging info if requested
  if (debug) {
    console.log('MarkdownContent debug:', {
      content: content?.substring(0, 100) + '...',
      markdownDetected,
      reactMarkdownAvailable: typeof ReactMarkdown === 'function',
      reactMarkdownType: typeof ReactMarkdown,
      window: window.ReactMarkdownLoaded ? 'ReactMarkdown is loaded globally' : 'No global ReactMarkdown',
    });
  }

  // Use our simple renderer if ReactMarkdown is unavailable
  if (useSimpleRenderer) {
    return (
      <div className={className} style={inlineStyle}>
        <SimpleMarkdownRenderer content={content} />
      </div>
    );
  }

  if (error) {
    // Fallback to plain text with line breaks if the markdown component fails
    return (
      <p className={`whitespace-pre-wrap ${className}`} style={inlineStyle}>
        {content}
      </p>
    );
  }

  // For cases where this component will be nested in a <p> tag (like in ListItemText),
  // use a simplified plain text approach to avoid DOM nesting errors
  if (disableParaTags) {
    // Just render the content as plain text with minimal formatting
    return (
      <span className="whitespace-normal" style={inlineStyle}>
        {content.replace(/\n/g, ' ').replace(/\s+/g, ' ')}
      </span>
    );
  }

  // Process custom styles for nested elements
  const customStyles = { ...inlineStyle };
  // Remove processed nested styles to avoid conflicts
  const nestedSelectors = ['& h1', '& h2', '& h3', '& h4', '& h5', '& h6', '& p', '& ul', '& ol', '& li', '& table', '& th', '& td'];
  
  for (const selector of nestedSelectors) {
    if (sx[selector as keyof typeof sx]) {
      delete (customStyles as any)[selector];
    }
  }

  // Safely render markdown with a try-catch
  try {
    return (
      <div 
        className={`prose prose-invert max-w-none
          prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2
          prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
          prose-p:mb-3 prose-p:leading-relaxed
          prose-ul:pl-6 prose-ol:pl-6 prose-ul:mb-3 prose-ol:mb-3
          prose-li:mb-1
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-blockquote:border-l-4 prose-blockquote:border-slate-400 prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:my-4 prose-blockquote:bg-slate-800 prose-blockquote:italic
          prose-code:font-mono prose-code:bg-slate-700 prose-code:p-1 prose-code:rounded
          prose-pre:font-mono prose-pre:bg-slate-800 prose-pre:text-white prose-pre:p-4 prose-pre:rounded prose-pre:overflow-auto
          prose-table:border-collapse prose-table:w-full prose-table:mb-4
          prose-th:border prose-th:border-slate-600 prose-th:p-2 prose-th:bg-slate-700 prose-th:font-bold
          prose-td:border prose-td:border-slate-600 prose-td:p-2
          ${className}`}
        style={customStyles}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    );
  } catch (err) {
    console.error('Failed to render markdown:', err);
    // Fall back to the simple renderer
    return (
      <div className={className} style={inlineStyle}>
        <SimpleMarkdownRenderer content={content} />
      </div>
    );
  }
};

export default MarkdownContent; 