/**
 * Helper utility for managing IndexedDB data in Playwright tests
 */
import { Page } from '@playwright/test';

// Define structure for image data to be stored
interface ImageData {
  name: string;      // Filename (key)
  data: string;      // Base64 encoded data
  type: string;      // MIME type (e.g., 'image/png')
  lastModified?: number; // Optional, can be added by the helper
}

export interface StorageState {
  locations?: any[];
  characters?: any[];
  images?: ImageData[];
  combats?: any[]; // Added combats
  // Add other data types as needed
}

// Constants should match AssetManager
const DB_NAME = 'PenAndPaperDB';
const DB_VERSION = 1; // Ensure this matches the app's DB version
const DATA_STORE = 'data';
const IMAGES_STORE = 'images';
const AUDIO_STORE = 'audio';

/**
 * Sets up IndexedDB with predefined test data
 * This function navigates to the app and injects a script to populate IndexedDB
 * @param page Playwright page object
 * @param data Data to initialize in IndexedDB
 */
export async function setupIndexedDB(page: Page, data: StorageState): Promise<void> {
  // First navigate to the app so we have the right origin context
  await page.goto('/');
  
  // Wait to ensure page has loaded and IndexedDB is available
  await page.waitForTimeout(1000);
  
  // Convert the data to a safe serialized string
  const serializedData = JSON.stringify(data);
  
  // Now inject the script with our data to populate IndexedDB
  await page.evaluate(async (serializedData) => {
    const data = JSON.parse(serializedData) as StorageState;
    const dbName = 'PenAndPaperDB';
    const dbVersion = 1; 
    const dataStoreName = 'data';
    const imagesStoreName = 'images';
    const audioStoreName = 'audio';
    
    return new Promise<void>((resolve, reject) => {
      
      try {
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onerror = (event) => {
          console.error('[Browser] IndexedDB open error:', event);
          reject(new Error('Failed to open IndexedDB'));
        };
        
        // Ensure all required stores are created/available
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(dataStoreName)) {
            db.createObjectStore(dataStoreName, { keyPath: 'name' });
          }
          if (!db.objectStoreNames.contains(imagesStoreName)) {
            db.createObjectStore(imagesStoreName, { keyPath: 'name' });
          }
          if (!db.objectStoreNames.contains(audioStoreName)) {
            db.createObjectStore(audioStoreName, { keyPath: 'name' });
          }
        };
        
        request.onsuccess = () => {
          const db = request.result;
          
          // Determine all stores to include in the transaction
          const storesToClear: string[] = [];
          if (data.locations || data.characters || data.combats) {
             storesToClear.push(dataStoreName);
          }
          if (data.images) storesToClear.push(imagesStoreName);
          // Add audio if needed: if (data.audio) storesToClear.push(audioStoreName);
          
          if (storesToClear.length === 0) {
            db.close();
            resolve();
            return;
          }

          try {
            const transaction = db.transaction(storesToClear, 'readwrite');
            let storesCompleted = 0;
            const expectedCompletions = storesToClear.length; // Count how many clear operations

            const checkCompletion = () => {
              storesCompleted++;
              if (storesCompleted === expectedCompletions) {
                addData(db, data, transaction); // Pass transaction to reuse?
              }
            };

            transaction.onerror = (event) => {
              console.error('[Browser] IndexedDB transaction error:', event);
              db.close();
              reject(new Error('Error during IndexedDB transaction'));
            };
            
            transaction.oncomplete = () => {
                console.log('[Browser] IndexedDB setup complete (transaction finished)');
                db.close();
                resolve();
            };

            // Clear existing data in relevant stores first
            storesToClear.forEach(storeName => {
              console.log(`[Browser] Clearing store: ${storeName}`);
              const store = transaction.objectStore(storeName);
              const clearRequest = store.clear();
              clearRequest.onsuccess = () => {
                console.log(`[Browser] Store ${storeName} cleared successfully.`);
                // Don't check completion here, wait for transaction.oncomplete
              };
              clearRequest.onerror = (event) => {
                  console.error(`[Browser] Error clearing store ${storeName}:`, event);
                  // Don't necessarily reject, maybe log and continue if possible?
              };
            });
            
            // Add data after clearing (inside the same transaction)
            const addData = (db: IDBDatabase, data: StorageState, tx: IDBTransaction) => {
              // Add data store items (locations, characters, combats)
              const dataStore = tx.objectStore(dataStoreName);
              if (data.locations) {
                dataStore.put({
                  name: 'locations.json', 
                  data: JSON.stringify(data.locations, null, 2), 
                  type: 'application/json', 
                  lastModified: Date.now() 
                });
              }
              if (data.characters) {
                dataStore.put({
                  name: 'characters.json', 
                  data: JSON.stringify(data.characters, null, 2), 
                  type: 'application/json', 
                  lastModified: Date.now() 
                });
              }
              if (data.combats) {
                dataStore.put({
                  name: 'combats.json', 
                  data: JSON.stringify(data.combats, null, 2), 
                  type: 'application/json', 
                  lastModified: Date.now() 
                });
              }

              // Add images
              if (data.images && data.images.length > 0) {
                  const imageStore = tx.objectStore(imagesStoreName);
                    data.images.forEach(img => {
                    imageStore.add({
                      ...img,
                      lastModified: img.lastModified || Date.now()
                    });
                  });
              }
            };
            
            // Trigger adding data within the transaction
            addData(db, data, transaction);
            
          } catch (txError) {
            console.error('[Browser] Error creating transaction:', txError);
            reject(new Error(`Transaction error: ${(txError as Error).message}`));
          }
        };
      } catch (error) {
        console.error('[Browser] Unexpected IndexedDB error:', error);
        reject(new Error(`IndexedDB error: ${(error as Error).message}`));
      }
    });
  }, serializedData);
  
  // After setting up data, reload the page to ensure app loads with the new data
  await page.reload({ waitUntil: 'domcontentloaded' }); // Wait until DOM is ready after reload
}

/**
 * Clears all data from IndexedDB
 * @param page Playwright page object
 */
export async function clearIndexedDB(page: Page): Promise<void> {
  try {
    if (page.isClosed()) {
      return;
    }
    
    await page.evaluate(() => {
      return new Promise<void>((resolve, reject) => {
        try {
          const DB_NAME = 'PenAndPaperDB';
          const DB_VERSION = 1;
          
          const request = indexedDB.open(DB_NAME, DB_VERSION);
          
          request.onerror = (event) => {
            console.error('[Browser] IndexedDB open error during cleanup:', event);
            // Don't reject, just resolve so tests can continue
            resolve();
          };
          
          request.onsuccess = () => {
            const db = request.result;
            try {
              const storeNames = Array.from(db.objectStoreNames);
              if (storeNames.length === 0) {
                db.close();
                resolve();
                return;
              }
              
              const transaction = db.transaction(storeNames, 'readwrite');
              
              storeNames.forEach(storeName => {
                transaction.objectStore(storeName).clear();
              });
              
              transaction.oncomplete = () => {
                db.close();
                resolve();
              };
              
              transaction.onerror = (event) => {
                db.close();
                // Don't reject, just resolve so tests can continue
                resolve();
              };
            } catch (txError) {
              console.error('[Browser] Transaction error during cleanup:', txError);
              db.close();
              resolve();
            }
          };
        } catch (error) {
          console.error('[Browser] Unexpected error during IndexedDB cleanup:', error);
          resolve();
        }
      });
    });
  } catch (error) {
    // Don't rethrow, let the test continue
  }
} 