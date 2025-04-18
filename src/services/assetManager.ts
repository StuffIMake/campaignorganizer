import JSZip from 'jszip';

// IndexedDB database name and version
const DB_NAME = 'PenAndPaperDB';
const DB_VERSION = 1;

// Store names for different asset types
const AUDIO_STORE = 'audio';
const IMAGES_STORE = 'images';
const DATA_STORE = 'data';

// Asset types
export type AssetType = 'audio' | 'images' | 'data';

// Asset entry interface
export interface AssetEntry {
  name: string;
  data: string; // Base64 encoded data
  type: string; // MIME type
  lastModified: number;
}

// Define a class to manage the assets
export class AssetManager {
  
  // Open IndexedDB connection
  private static async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = (event) => {
        reject(new Error('Failed to open IndexedDB'));
      };
      
      request.onsuccess = (event) => {
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(AUDIO_STORE)) {
          db.createObjectStore(AUDIO_STORE, { keyPath: 'name' });
        }
        
        if (!db.objectStoreNames.contains(IMAGES_STORE)) {
          db.createObjectStore(IMAGES_STORE, { keyPath: 'name' });
        }
        
        if (!db.objectStoreNames.contains(DATA_STORE)) {
          db.createObjectStore(DATA_STORE, { keyPath: 'name' });
        }
      };
    });
  }
  
  // Process a zip file
  static async processZipFile(file: File): Promise<{ success: boolean; message: string }> {
    try {
      const zip = new JSZip();
      
      // Load the zip file with streaming option to reduce memory usage
      const zipContent = await zip.loadAsync(file, {
        // Use chunked reading to prevent memory issues with large files
        createFolders: true,
        checkCRC32: false
      });
      
      // Arrays to hold assets by type
      const audioFiles: AssetEntry[] = [];
      const imageFiles: AssetEntry[] = [];
      const dataFiles: AssetEntry[] = [];
      
      // Function to process files in a specific folder
      const processFolder = async (folderPath: string, assetType: AssetType, collection: AssetEntry[]) => {
        // Get the folder
        const folder = zipContent.folder(folderPath);
        if (!folder) {
          console.warn(`Folder '${folderPath}' not found in the zip file.`);
          return;
        }
        
        // Get all the files in this folder
        const filePaths = Object.keys(folder.files)
          .filter(path => !folder.files[path].dir && path.startsWith(`${folderPath}/`));
        
        // Process files in smaller batches to avoid memory issues
        const BATCH_SIZE = 5; // Process 5 files at a time
        
        for (let i = 0; i < filePaths.length; i += BATCH_SIZE) {
          const batch = filePaths.slice(i, i + BATCH_SIZE);
          
          // Process this batch of files
          await Promise.all(batch.map(async (path) => {
            const fileName = path.split('/').pop() || '';
            if (!fileName) return; // Skip if filename is empty
            
            try {
              // Get the file data as base64
              const fileData = await folder.files[path].async('base64');
              const mimeType = this.getMimeType(fileName);
              
              // Add to the appropriate collection
              collection.push({
                name: fileName,
                data: fileData,
                type: mimeType,
                lastModified: Date.now()
              });
            } catch (error) {
              console.error(`Error processing file ${fileName}:`, error);
              // Continue with other files even if one fails
            }
          }));
          
          // Small delay to allow garbage collection between batches
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      };
      
      // Process each required folder
      await processFolder('audio', 'audio', audioFiles);
      await processFolder('images', 'images', imageFiles);
      await processFolder('data', 'data', dataFiles);
      
      // Check if we found files in all required folders
      if (audioFiles.length === 0 && imageFiles.length === 0 && dataFiles.length === 0) {
        return { 
          success: false, 
          message: 'The zip file does not contain any recognized files in the required folders (audio, images, data).' 
        };
      }
      
      // Open database connection
      const db = await this.openDB();
      
      // Store the assets in IndexedDB in batches
      if (audioFiles.length > 0) {
        await this.storeAssetsInBatches(db, AUDIO_STORE, audioFiles);
      }
      
      if (imageFiles.length > 0) {
        await this.storeAssetsInBatches(db, IMAGES_STORE, imageFiles);
      }
      
      if (dataFiles.length > 0) {
        await this.storeAssetsInBatches(db, DATA_STORE, dataFiles);
      }
      
      db.close();
      
      return { 
        success: true, 
        message: `Successfully imported ${audioFiles.length} audio files, ${imageFiles.length} image files, and ${dataFiles.length} data files.` 
      };
    } catch (error) {
      console.error('Error processing zip file:', error);
      return { 
        success: false, 
        message: `Error processing zip file: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }
  
  // Store assets in IndexedDB in batches to prevent memory issues
  private static async storeAssetsInBatches(db: IDBDatabase, storeName: string, assets: AssetEntry[]): Promise<void> {
    // Clear the store first
    await this.clearStore(db, storeName);
    
    // Store assets in smaller batches
    const BATCH_SIZE = 10; // Process 10 assets at a time
    
    for (let i = 0; i < assets.length; i += BATCH_SIZE) {
      const batch = assets.slice(i, i + BATCH_SIZE);
      
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(new Error('Transaction failed'));
        
        // Add batch of assets
        batch.forEach(asset => {
          store.add(asset);
        });
      });
      
      // Small delay to allow garbage collection between batches
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  // Store assets in IndexedDB
  private static async storeAssets(db: IDBDatabase, storeName: string, assets: AssetEntry[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(new Error('Transaction failed'));
      
      // Clear the store first
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        // Add all assets
        assets.forEach(asset => {
          store.add(asset);
        });
      };
    });
  }
  
  // Get assets by type
  static async getAssets(type: AssetType): Promise<AssetEntry[]> {
    try {
      const db = await this.openDB();
      const storeName = this.getStoreName(type);
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          db.close();
          resolve(request.result || []);
        };
        
        request.onerror = () => {
          db.close();
          reject(new Error(`Failed to get assets from ${storeName}`));
        };
      });
    } catch (error) {
      console.error('Error getting assets:', error);
      return [];
    }
  }
  
  // Check if we have assets of a specific type
  static async hasAssets(type: AssetType): Promise<boolean> {
    try {
      const assets = await this.getAssets(type);
      return assets.length > 0;
    } catch (error) {
      console.error('Error checking for assets:', error);
      return false;
    }
  }
  
  // Get a specific asset by name and type
  static async getAssetByName(type: AssetType, name: string): Promise<AssetEntry | null> {
    if (!name) return null;
    
    try {
      const db = await this.openDB();
      const storeName = this.getStoreName(type);
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(name);
        
        request.onsuccess = () => {
          db.close();
          resolve(request.result || null);
        };
        
        request.onerror = (event) => {
          console.error(`[AssetManager DEBUG] IndexedDB GET request failed for type=${type}, name=${name}`, event);
          db.close();
          resolve(null);
        };
      });
    } catch (error) {
      console.error(`[AssetManager DEBUG] Error opening DB in getAssetByName for ${name}:`, error);
      return null;
    }
  }
  
  // Clear all assets from IndexedDB
  static async clearAllAssets(): Promise<void> {
    try {
      const db = await this.openDB();
      
      await Promise.all([
        this.clearStore(db, AUDIO_STORE),
        this.clearStore(db, IMAGES_STORE),
        this.clearStore(db, DATA_STORE)
      ]);
      
      db.close();
    } catch (error) {
      console.error('Error clearing assets:', error);
    }
  }
  
  // Clear a specific store
  private static clearStore(db: IDBDatabase, storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to clear ${storeName}`));
    });
  }
  
  // Helper to get store name by asset type
  private static getStoreName(type: AssetType): string {
    switch (type) {
      case 'audio': return AUDIO_STORE;
      case 'images': return IMAGES_STORE;
      case 'data': return DATA_STORE;
    }
  }
  
  // Helper to determine MIME type based on file extension
  private static getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      // Audio files
      case 'mp3': return 'audio/mpeg';
      case 'wav': return 'audio/wav';
      case 'ogg': return 'audio/ogg';
      
      // Image files
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'gif': return 'image/gif';
      case 'svg': return 'image/svg+xml';
      
      // Data files
      case 'json': return 'application/json';
      case 'txt': return 'text/plain';
      case 'pdf': return 'application/pdf';
      
      // Default
      default: return 'application/octet-stream';
    }
  }
  
  // Get a URL for an asset (from IndexedDB)
  static async getAssetUrl(type: AssetType, name: string): Promise<string> {
    if (!name) return '';

    try {
      // Check if it's a PDF file by extension
      const isPdf = name.toLowerCase().endsWith('.pdf');
      
      const asset = await this.getAssetByName(type, name);

      if (asset) {
        // For PDFs, create a blob URL to prevent routing issues
        if (isPdf) {
          try {
            // Create a blob from the base64 data
            const parts = asset.data.split(';base64,');
            let contentType = asset.type;
            let base64Data = asset.data;
            
            // Handle if the data is already in base64 format
            if (parts.length === 2) {
              contentType = parts[0].split(':')[1];
              base64Data = parts[1];
            } else {
              base64Data = asset.data;
            }
            
            const binary = atob(base64Data);
            const array = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              array[i] = binary.charCodeAt(i);
            }
            
            // Create blob and return blob URL
            const blob = new Blob([array], { type: contentType });
            return URL.createObjectURL(blob);
          } catch (err) {
            console.error('Error creating blob URL for PDF:', err);
            // Fall back to data URL if blob creation fails
          }
        }
        
        // For non-PDF files or if blob creation failed, return data URL
        return `data:${asset.type};base64,${asset.data}`;
      }

      // For PDFs not in database, use absolute URL to prevent routing conflicts
      if (isPdf) {
        // Ensure URL starts with / and doesn't have /campaignorganizer/ prefix
        const cleanName = name.startsWith('/') ? name : `/${name}`;
        return window.location.origin + cleanName;
      }

      // Return empty string if no asset found in DB
      return '';
    } catch (error) {
      console.error(`Error getting asset URL for ${name}:`, error);
      return '';
    }
  }
  
  // Helper function to safely encode Unicode strings to Base64
  private static encodeUnicode(str: string): string {
    // Use the built-in btoa function, but first encode the string as UTF-8
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  // Helper function to safely decode Base64 to Unicode strings
  private static decodeUnicode(base64: string): string {
    try {
      // Decode base64 to a UTF-8 string
      return decodeURIComponent(escape(window.atob(base64)));
    } catch (error) {
      // Fallback to direct decode for backward compatibility
      console.warn('Failed to decode with Unicode method, trying direct decode');
      try {
        return window.atob(base64);
      } catch (directError) {
        // If that fails too, try one more fallback
        console.warn('Direct decode failed too, returning as-is');
        return base64;
      }
    }
  }

  // Add or update a data object (converts it to JSON and stores it)
  static async saveDataObject<T>(name: string, data: T): Promise<{ success: boolean; message: string }> {
    try {
      // Convert object to JSON string
      const jsonString = JSON.stringify(data, null, 2);
      
      // Create asset entry - store JSON directly rather than base64 encoding it
      const asset: AssetEntry = {
        name,
        data: jsonString,
        type: 'application/json',
        lastModified: Date.now()
      };
      
      // Open database connection
      const db = await this.openDB();
      const storeName = DATA_STORE;
      
      // Store the asset
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        transaction.oncomplete = () => {
          db.close();
          resolve({ 
            success: true, 
            message: `Successfully saved ${name} data.` 
          });
        };
        
        transaction.onerror = (event) => {
          db.close();
          reject(new Error(`Failed to save data ${name}`));
        };
        
        // Add the asset (will update if it already exists)
        store.put(asset);
      });
    } catch (error) {
      console.error(`Error saving data object ${name}:`, error);
      return { 
        success: false, 
        message: `Error saving data: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }
  
  // Get a data object from a JSON asset
  static async getDataObject<T>(name: string): Promise<T | null> {
    if (!name) return null;
    
    try {
      const asset = await this.getAssetByName('data', name);
      
      if (!asset) return null;
      
      // Try to parse the data as JSON
      try {
        // If data is already a JSON string (new format)
        if (typeof asset.data === 'string' && (asset.data.startsWith('{') || asset.data.startsWith('['))) {
          return JSON.parse(asset.data);
        }
        
        // Try to decode from base64 (old format)
        const jsonString = this.decodeUnicode(asset.data);
        return JSON.parse(jsonString);
      } catch (e) {
        console.warn(`JSON parse failed for ${name}:`, e);
        
        // Last attempt - try direct atob
        try {
          const jsonString = window.atob(asset.data);
          return JSON.parse(jsonString);
        } catch (e) {
          console.error(`All parsing methods failed for ${name}`);
          return null;
        }
      }
    } catch (error) {
      console.error(`Error getting data object ${name}:`, error);
      return null;
    }
  }
  
  // Export all assets to a zip file
  static async exportToZip(): Promise<{ success: boolean; message: string; zipBlob?: Blob; url?: string }> {
    try {
      // Create a new JSZip instance
      const zip = new JSZip();
      
      // Create folders for each asset type
      const audioFolder = zip.folder('audio');
      const imagesFolder = zip.folder('images');
      const dataFolder = zip.folder('data');
      
      if (!audioFolder || !imagesFolder || !dataFolder) {
        throw new Error('Failed to create folders in the zip file');
      }
      
      // Get all assets
      const audioAssets = await this.getAssets('audio');
      const imageAssets = await this.getAssets('images');
      const dataAssets = await this.getAssets('data');
      
      // Add audio files to the zip
      for (const asset of audioAssets) {
        audioFolder.file(asset.name, asset.data, { base64: true });
      }
      
      // Add image files to the zip
      for (const asset of imageAssets) {
        imagesFolder.file(asset.name, asset.data, { base64: true });
      }
      
      // Add data files to the zip
      for (const asset of dataAssets) {
        // Check if this is a JSON file (data will be a JSON string, not base64 encoded)
        const isJsonFileWithDirectData = 
          asset.type === 'application/json' && 
          typeof asset.data === 'string' && 
          (asset.data.startsWith('{') || asset.data.startsWith('['));
        
        if (isJsonFileWithDirectData) {
          // Add the JSON file directly (not as base64)
          dataFolder.file(asset.name, asset.data);
        } else {
          // Add other data files as base64
          dataFolder.file(asset.name, asset.data, { base64: true });
        }
      }
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(zipBlob);
      
      return { 
        success: true, 
        message: `Successfully exported ${audioAssets.length} audio files, ${imageAssets.length} image files, and ${dataAssets.length} data files.`,
        zipBlob,
        url
      };
    } catch (error) {
      console.error('Error exporting assets to zip:', error);
      return { 
        success: false, 
        message: `Error exporting assets: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }
  
  // Add a single asset to the database
  static async addAsset(type: AssetType, file: File): Promise<{ success: boolean; message: string }> {
    try {
      // For JSON data files, handle them differently
      if (type === 'data' && file.name.endsWith('.json')) {
        return this.addJsonAsset(file);
      }
      
      // All other file types - convert to base64
      const reader = new FileReader();
      const fileDataPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          // Extract the base64 data from the result
          const base64Data = (reader.result as string).split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      
      const fileData = await fileDataPromise;
      const mimeType = this.getMimeType(file.name);
      
      // Create asset entry
      const asset: AssetEntry = {
        name: file.name,
        data: fileData,
        type: mimeType,
        lastModified: Date.now()
      };
      
      // Open database connection
      const db = await this.openDB();
      const storeName = this.getStoreName(type);
      
      // Store the asset
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        transaction.oncomplete = () => {
          db.close();
          resolve({ 
            success: true, 
            message: `Successfully added ${file.name} to ${type} assets.` 
          });
        };
        
        transaction.onerror = (event) => {
          db.close();
          reject(new Error(`Failed to add asset ${file.name} to ${storeName}`));
        };
        
        // Add the asset (will update if it already exists)
        store.put(asset);
      });
    } catch (error) {
      console.error(`Error adding asset ${file.name}:`, error);
      return { 
        success: false, 
        message: `Error adding asset: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }
  
  // Add a JSON file as a data asset
  static async addJsonAsset(file: File): Promise<{ success: boolean; message: string }> {
    try {
      // Read the JSON file as text
      const reader = new FileReader();
      const jsonTextPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => reject(new Error('Failed to read JSON file'));
        reader.readAsText(file);
      });
      
      const jsonText = await jsonTextPromise;
      
      // Validate that the content is valid JSON
      try {
        JSON.parse(jsonText);
      } catch (e) {
        return {
          success: false,
          message: `The file ${file.name} contains invalid JSON.`
        };
      }
      
      // Create asset entry - store the JSON directly
      const asset: AssetEntry = {
        name: file.name,
        data: jsonText,
        type: 'application/json',
        lastModified: Date.now()
      };
      
      // Open database connection
      const db = await this.openDB();
      const storeName = DATA_STORE;
      
      // Store the asset
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        transaction.oncomplete = () => {
          db.close();
          resolve({ 
            success: true, 
            message: `Successfully added ${file.name} to data assets.` 
          });
        };
        
        transaction.onerror = (event) => {
          db.close();
          reject(new Error(`Failed to add JSON asset ${file.name}`));
        };
        
        // Add the asset (will update if it already exists)
        store.put(asset);
      });
    } catch (error) {
      console.error(`Error adding JSON asset ${file.name}:`, error);
      return { 
        success: false, 
        message: `Error adding JSON asset: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }
  
  // Delete a single asset
  static async deleteAsset(type: AssetType, name: string): Promise<{ success: boolean; message: string }> {
    try {
      // Open database connection
      const db = await this.openDB();
      const storeName = this.getStoreName(type);
      
      // Delete the asset
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        transaction.oncomplete = () => {
          db.close();
          resolve({ 
            success: true, 
            message: `Successfully deleted ${name} from ${type} assets.` 
          });
        };
        
        transaction.onerror = (event) => {
          db.close();
          reject(new Error(`Failed to delete asset ${name} from ${storeName}`));
        };
        
        // Delete the asset
        store.delete(name);
      });
    } catch (error) {
      console.error(`Error deleting asset ${name}:`, error);
      return { 
        success: false, 
        message: `Error deleting asset: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }
  
  // Load example data when there's none
  static async loadExampleData(): Promise<{ success: boolean; message: string }> {
    try {
      // Sample empty locations array
      const emptyLocations: any[] = [];
      
      // Open database connection
      const db = await this.openDB();
      
      // Store in IndexedDB
      const dataStore = db.transaction(DATA_STORE, 'readwrite').objectStore(DATA_STORE);
      
      // Store the JSON string directly instead of base64 encoding
      const jsonString = JSON.stringify(emptyLocations, null, 2);
      
      dataStore.add({
        name: 'locations.json',
        data: jsonString,
        type: 'application/json',
        lastModified: Date.now()
      });
      
      db.close();
      
      return {
        success: true,
        message: 'Created empty locations data. You can now start adding your own locations.'
      };
    } catch (error) {
      console.error('Error creating example data:', error);
      return {
        success: false,
        message: `Error creating example data: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Helper to convert base64 string to Blob
  private static base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
} 