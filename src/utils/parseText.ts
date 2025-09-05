import mammoth from "mammoth";
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedFile {
  filename: string;
  content: string;
  pageCount?: number;
  type?: string;
}

/**
 * Extract text from a plain text file
 * @param file - The text file to extract from
 * @returns Object containing filename, content, and optional pageCount
 */
export const extractTextFromTxt = async (file: File): Promise<ExtractedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve({
        filename: file.name,
        content: content.trim()
      });
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
};

/**
 * Extract text from a DOCX file using mammoth.js
 * @param file - The DOCX file to extract from
 * @returns Object containing filename, content, and optional pageCount
 */
export const extractTextFromDocx = async (file: File): Promise<ExtractedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // Use mammoth.js to extract text from DOCX
        const result = await mammoth.extractRawText({ arrayBuffer });
        
        resolve({
          filename: file.name,
          content: result.value.trim()
        });
      } catch (error) {
        reject(new Error(`Failed to extract text from ${file.name}: ${error}`));
      }
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Extract text from a PDF file using PDF.js
 * @param file - The PDF file to extract from
 * @returns Object containing filename, content, and pageCount
 */
export const extractTextFromPdf = async (file: File): Promise<ExtractedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        if (!arrayBuffer) {
          throw new Error('Failed to read file as ArrayBuffer');
        }

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer
        });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        
        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContentItems = await page.getTextContent({
            includeMarkedContent: true
          });
          
          if (i > 1) {
            fullText += `\n\n--- Page ${i} ---\n\n`;
          }
          
          // Combine all text items from the page
          const pageText = textContentItems.items
            .map((item: any) => item.str || '')
            .join(' ')
            .trim();
          
          if (pageText) {
            fullText += pageText;
          }
        }
        
        resolve({
          filename: file.name,
          content: fullText.trim(),
          pageCount: pdf.numPages
        });
      } catch (error) {
        reject(new Error(`Failed to extract text from ${file.name}: ${error}`));
      }
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Extract text from JSON files with pretty formatting
 * @param file - The JSON file to extract from
 * @returns Object containing filename and formatted content
 */
export const extractTextFromJson = async (file: File): Promise<ExtractedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        // Try to parse and pretty-print JSON
        const parsed = JSON.parse(content);
        const formatted = JSON.stringify(parsed, null, 2);
        
        resolve({
          filename: file.name,
          content: formatted
        });
      } catch (error) {
        // If JSON parsing fails, return raw content
        resolve({
          filename: file.name,
          content: (e.target?.result as string).trim()
        });
      }
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
};

/**
 * Extract text from JavaScript files
 * @param file - The JS file to extract from
 * @returns Object containing filename and content
 */
export const extractTextFromJs = async (file: File): Promise<ExtractedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve({
        filename: file.name,
        content: content.trim()
      });
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
};

/**
 * Extract text from Vue files
 * @param file - The Vue file to extract from
 * @returns Object containing filename and content
 */
export const extractTextFromVue = async (file: File): Promise<ExtractedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve({
        filename: file.name,
        content: content.trim()
      });
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
};

/**
 * Extract text from CSS files
 * @param file - The CSS file to extract from
 * @returns Object containing filename and content
 */
export const extractTextFromCss = async (file: File): Promise<ExtractedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve({
        filename: file.name,
        content: content.trim()
      });
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
};

/**
 * Extract text from HTML files
 * @param file - The HTML file to extract from
 * @returns Object containing filename and content
 */
export const extractTextFromHtml = async (file: File): Promise<ExtractedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve({
        filename: file.name,
        content: content.trim()
      });
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
};

/**
 * Extract text from Markdown files
 * @param file - The MD file to extract from
 * @returns Object containing filename and content
 */
export const extractTextFromMd = async (file: File): Promise<ExtractedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve({
        filename: file.name,
        content: content.trim()
      });
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
};

/**
 * Extract text from XML files
 * @param file - The XML file to extract from
 * @returns Object containing filename and content
 */
export const extractTextFromXml = async (file: File): Promise<ExtractedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve({
        filename: file.name,
        content: content.trim()
      });
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
};

/**
 * Main function to extract text from various file types
 * @param file - The file to extract text from
 * @returns Object containing filename, content, and optional pageCount
 */
export const extractTextFromFile = async (file: File): Promise<ExtractedFile> => {
  const extension = file.name.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'txt':
      return extractTextFromTxt(file);
    case 'docx':
      return extractTextFromDocx(file);
    case 'pdf':
      return extractTextFromPdf(file);
    case 'json':
      return extractTextFromJson(file);
    case 'js':
    case 'mjs':
    case 'ts':
    case 'tsx':
      return extractTextFromJs(file);
    case 'vue':
      return extractTextFromVue(file);
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return extractTextFromCss(file);
    case 'html':
    case 'htm':
      return extractTextFromHtml(file);
    case 'md':
    case 'markdown':
      return extractTextFromMd(file);
    case 'xml':
    case 'svg':
      return extractTextFromXml(file);
    case 'yaml':
    case 'yml':
      return extractTextFromTxt(file); // YAML can be read as text
    case 'csv':
      return extractTextFromTxt(file); // CSV can be read as text
    case 'log':
      return extractTextFromTxt(file); // Log files can be read as text
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
};

/**
 * Check if a file type is supported for text extraction
 * @param file - The file to check
 * @returns True if the file type is supported
 */
export const isTextFile = (file: File): boolean => {
  const extension = file.name.toLowerCase().split('.').pop();
  const supportedExtensions = [
    'txt', 'docx', 'pdf', 'json', 'js', 'mjs', 'ts', 'tsx', 'vue', 
    'css', 'scss', 'sass', 'less', 'html', 'htm', 'md', 'markdown', 
    'xml', 'svg', 'yaml', 'yml', 'csv', 'log'
  ];
  return supportedExtensions.includes(extension || '');
};

/**
 * Format extracted content from multiple files into a single string
 * @param extractedFiles - Array of extracted content objects
 * @returns Formatted string containing all file contents
 */
export const formatExtractedContent = (extractedFiles: ExtractedFile[]): string => {
  return extractedFiles.map(file => {
    let content = `\n\n=== ${file.filename} ===\n\n${file.content}`;
    if (file.pageCount) {
      content = `\n\n=== ${file.filename} (${file.pageCount} pages) ===\n\n${file.content}`;
    }
    return content;
  }).join('\n\n');
};

export interface ExtractResult {
  results: ExtractedFile[];
  errors: string[];
}

/**
 * Extract text from multiple files
 * @param files - Array of files to extract text from
 * @returns Array of extracted content objects
 */
export const extractTextFromFiles = async (files: File[]): Promise<ExtractResult> => {
  const results: ExtractedFile[] = [];
  const errors: string[] = [];
  
  for (const file of files) {
    try {
      if (isTextFile(file)) {
        const extracted = await extractTextFromFile(file);
        results.push(extracted);
      } else {
        errors.push(`Unsupported file type: ${file.name}`);
      }
    } catch (error) {
      errors.push(`Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return { results, errors };
};

