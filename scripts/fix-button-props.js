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
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileChanged = false;
    
    // Check if the file uses Button components
    if (content.includes('<Button')) {
      // Replace onClick with onPress and disabled with isDisabled
      // Updated to handle both self-closing and normal Button components
      
      // Handle Button with content and closing tag <Button ...>...</Button>
      const regexWithContent = /<Button([^>]*)>([\s\S]*?)<\/Button>/g;
      content = content.replace(regexWithContent, (match, props, children) => {
        let newProps = props
          .replace(/onClick=/g, 'onPress=')
          .replace(/disabled=/g, 'isDisabled=');
        
        if (props !== newProps) {
          fileChanged = true;
          return `<Button${newProps}>${children}</Button>`;
        }
        return match;
      });
      
      // Handle self-closing Button <Button ... />
      const regexSelfClosing = /<Button([^>]*)\s*\/>/g;
      content = content.replace(regexSelfClosing, (match, props) => {
        let newProps = props
          .replace(/onClick=/g, 'onPress=')
          .replace(/disabled=/g, 'isDisabled=');
        
        if (props !== newProps) {
          fileChanged = true;
          return `<Button${newProps} />`;
        }
        return match;
      });

      // Handle IconButton with onClick
      if (content.includes('<IconButton')) {
        const regexIconButton = /<IconButton([^>]*)>([\s\S]*?)<\/IconButton>/g;
        content = content.replace(regexIconButton, (match, props, children) => {
          let newProps = props
            .replace(/onPress=/g, 'onClick=');
          
          if (props !== newProps) {
            fileChanged = true;
            return `<IconButton${newProps}>${children}</IconButton>`;
          }
          return match;
        });
      }
    }
    
    // Handle PDFViewer with allowDownload prop
    if (content.includes('<PDFViewer') && content.includes('allowDownload={')) {
      const oldContent = content;
      content = content.replace(/allowDownload=\{[^}]+\}/g, '');
      if (content !== oldContent) {
        fileChanged = true;
      }
    }
    
    // Handle MUI imports
    if (content.includes('@mui/material') || content.includes('@mui/icons-material')) {
      const oldContent = content;
      
      // Replace Material UI Button with our Button
      if (content.includes('Button') && content.includes('@mui/material')) {
        content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]@mui\/material['"]/g, (match, imports) => {
          // Extract the imports
          const importItems = imports.split(',').map(item => item.trim());
          
          // Filter out Button and related components
          const remainingImports = importItems
            .filter(item => !item.includes('Button'));
            
          if (importItems.length !== remainingImports.length) {
            // Add import for our Button if needed
            if (!content.includes("import { Button } from '../../../components/ui'") && 
                !content.includes("import Button from '../../../components/ui'")) {
              
              // Try to find existing UI imports to add Button to
              const uiImportRegex = /import\s+{([^}]*)}\s+from\s+['"].*\/components\/ui['"]/;
              const uiImportMatch = content.match(uiImportRegex);
              
              if (uiImportMatch) {
                content = content.replace(uiImportRegex, (match, imports) => {
                  return match.replace(imports, `${imports}, Button`);
                });
              } else {
                // Add a new import for Button
                content = content.replace(/import\s+.*from\s+['"].*['"];?(\n)/m, (match, newline) => {
                  return `${match}import { Button } from '../../../components/ui';${newline}`;
                });
              }
            }
            
            // If there are no remaining MUI imports, remove the entire import
            if (remainingImports.length === 0) {
              return '';
            }
            
            // Otherwise, rebuild the import statement without Button
            return `import { ${remainingImports.join(', ')} } from '@mui/material'`;
          }
          
          return match;
        });
      }
      
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
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
});

console.log(`\nCompleted with ${totalChanges} files updated.`); 