import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively get all files in a directory
const getAllFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fileList = getAllFiles(filePath, fileList);
    } else if (
      stat.isFile() && 
      (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) && 
      !filePath.includes('node_modules')
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
};

// Get all .tsx and .jsx files in the src directory
const srcDir = path.join(__dirname, '..', 'src');
const files = getAllFiles(srcDir);

let totalChanges = 0;

// Process each file
files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileChanged = false;
  
  // Only process files that use Button and have either onClick or disabled on those elements
  if (
    content.includes('<Button') && 
    (content.includes('onClick={') || content.includes('disabled={'))
  ) {
    // Find all Button components and update their props
    // Match both <Button ...> and <Button ... />
    const buttonRegex = /<Button\s+([^>]*)(\/?>)/g;
    let match;
    
    while ((match = buttonRegex.exec(content)) !== null) {
      const buttonProps = match[1];
      const closeTag = match[2];
      
      // Only process if this specific Button has onClick or disabled
      if (buttonProps.includes('onClick={') || buttonProps.includes('disabled={')) {
        // Get the complete Button component with its props
        const fullMatch = match[0];
        
        // Create a new version with fixed props
        let updatedMatch = fullMatch
          .replace(/onClick=\{([^}]+)\}/g, 'onPress={$1}')
          .replace(/disabled=\{([^}]+)\}/g, 'isDisabled={$1}');
        
        // Replace the old Button with the updated one
        if (updatedMatch !== fullMatch) {
          content = content.replace(fullMatch, updatedMatch);
          fileChanged = true;
        }
      }
    }
    
    // Also check for mui imports and update them
    if (content.includes('@mui/material')) {
      const oldContent = content;
      
      // Replace Material UI imports with React Aria Components
      content = content
        .replace(/import.*from\s+['"]@mui\/material['"]/g, (match) => {
          // Transform imports only if they contain Button
          if (match.includes('Button')) {
            return match.replace('Button', '').replace('@mui/material', '../../../components/ui');
          }
          return match;
        });
      
      if (content !== oldContent) {
        fileChanged = true;
      }
    }
  }
  
  // Find PDFViewer with allowDownload prop
  if (content.includes('<PDFViewer') && content.includes('allowDownload={')) {
    const oldContent = content;
    content = content.replace(/allowDownload=\{[^}]+\}/g, '');
    if (content !== oldContent) {
      fileChanged = true;
    }
  }
  
  // Write back to file if changes were made
  if (fileChanged) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated props in: ${path.relative(process.cwd(), filePath)}`);
    totalChanges++;
  }
});

console.log(`\nCompleted with ${totalChanges} files updated.`); 