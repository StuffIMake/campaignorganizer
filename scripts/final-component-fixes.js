import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files with known issues
const filesToFix = [
  'src/features/characters/components/CharacterCard.tsx',
  'src/features/combats/views/CombatSessionView.tsx',
  'src/features/locations/components/LocationDescriptionDialog.tsx',
  'src/features/map/components/EditLocationDialog.tsx',
  'src/features/map/views/MapView.tsx',
  'src/features/characters/components/ItemFormDialog.tsx',
  'src/features/characters/hooks/useCharacterForm.ts'
];

// Process each file
filesToFix.forEach(relativeFilePath => {
  try {
    const filePath = path.join(__dirname, '..', relativeFilePath);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${relativeFilePath}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileChanged = false;
    
    // 1. Fix Button onClick to onPress and disabled to isDisabled
    if (content.includes('<Button')) {
      // Handle Button with content
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
      
      // Handle self-closing Button
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
    }
    
    // 2. Fix Location import in EditLocationDialog
    if (filePath.includes('EditLocationDialog')) {
      // Replace import { Location } from '../../../types' with named import
      content = content.replace(
        /import\s+{([^}]*)}\s+from\s+['"]\.\.\/\.\.\/\.\.\/types['"]/g,
        (match, imports) => {
          const importItems = imports.split(',').map(item => item.trim());
          const hasLocation = importItems.some(item => item === 'Location');
          
          if (hasLocation) {
            // Replace Location with named import
            const newImports = importItems
              .filter(item => item !== 'Location')
              .join(', ');
              
            return `import { ${newImports} } from '../../../types'${newImports ? '\nimport { Location as LocationType } from "../../../types/location";' : ''}`;
          }
          
          return match;
        }
      );
      
      // Replace all Location with LocationType
      content = content.replace(/Location(?!\w)/g, 'LocationType');
      fileChanged = true;
    }
    
    // 3. Fix form event handlers in ItemFormDialog
    if (filePath.includes('ItemFormDialog')) {
      // Find onChange handlers that access .target on a string
      const eventHandlerRegex = /(onChange|onBlur|onFocus)\s*=\s*{\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*=>\s*{?[\r\n\s]*([^}]+)\.target/g;
      content = content.replace(eventHandlerRegex, (match, eventType, paramName, usage) => {
        return match.replace(
          `(${paramName})`,
          `(${paramName}: React.ChangeEvent<HTMLInputElement>)`
        );
      });
      
      // Fix for FormEvent in handleSubmit
      content = content.replace(
        /(const handleSubmit = \([^)]*\))/g,
        'const handleSubmit = (e: React.FormEvent<HTMLFormElement>)'
      );
      
      fileChanged = true;
    }
    
    // 4. Fix DragEvent in MapView
    if (filePath.includes('MapView')) {
      // Fix the DragEvent handler
      content = content.replace(
        /(onDragOver|onDrop|onDragEnter|onDragLeave)\s*=\s*{\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*=>/g,
        (match, eventType, paramName) => {
          return match.replace(
            `(${paramName})`,
            `(${paramName}: React.DragEvent<Element>)`
          );
        }
      );
      fileChanged = true;
    }
    
    // 5. Fix useCharacterForm.ts undefined type issue
    if (filePath.includes('useCharacterForm.ts')) {
      content = content.replace(
        /let[\s\n]+([a-zA-Z0-9_]+)[\s\n]*:[\s\n]*number[\s\n]*\|[\s\n]*undefined/g,
        'let $1: number | string'
      );
      fileChanged = true;
    }
    
    // Write back to file if changes were made
    if (fileChanged) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${relativeFilePath}`);
    } else {
      console.log(`No changes needed for: ${relativeFilePath}`);
    }
  } catch (error) {
    console.error(`Error processing file:`, error);
  }
});

console.log('Fixes completed!'); 