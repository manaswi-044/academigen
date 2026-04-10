// Native wrapper for IndexedDB

const DB_NAME = "academigen-db";
const DB_VERSION = 1;

export interface Document {
  id: string;
  title?: string;
  subject?: string;
  content_json?: any;
  updated_at: number;
  [key: string]: any;
}

// 1. OPEN DATABASE
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("documents")) {
        db.createObjectStore("documents", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("userPrefs")) {
        db.createObjectStore("userPrefs", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("syncQueue")) {
        db.createObjectStore("syncQueue", { keyPath: "id" });
      }
    };

    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
}

// 2. SAVE DOCUMENT
export async function saveDocumentLocally(doc: Document): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["documents"], "readwrite");
    const store = transaction.objectStore("documents");
    
    // Always overwrite if id exists
    const request = store.put(doc);
    
    request.onsuccess = () => resolve();
    request.onerror = (e: any) => reject(e.target.error);
  });
}

// 3. GET ALL DOCUMENTS
export async function getAllDocuments(): Promise<Document[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["documents"], "readonly");
      const store = transaction.objectStore("documents");
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (e: any) => reject(e.target.error);
    });
  } catch (err) {
    return [];
  }
}

// 4. ADD TO SYNC QUEUE
export async function queueForSync(docId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["syncQueue"], "readwrite");
    const store = transaction.objectStore("syncQueue");
    const request = store.put({ id: docId, timestamp: Date.now() });
    
    request.onsuccess = () => resolve();
    request.onerror = (e: any) => reject(e.target.error);
  });
}

// 5. PROCESS SYNC QUEUE
export async function processSyncQueue(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["syncQueue"], "readonly");
    const store = transaction.objectStore("syncQueue");
    const request = store.getAll();
    
    request.onsuccess = async () => {
      const queue = request.result || [];
      for (const item of queue) {
        console.log(`will sync: ${item.id}`);
        // In Phase 2: call Supabase upsert here
        
        // Remove from queue after success log
        const deleteTx = db.transaction(["syncQueue"], "readwrite");
        const deleteStore = deleteTx.objectStore("syncQueue");
        deleteStore.delete(item.id);
      }
      resolve();
    };
    request.onerror = (e: any) => reject(e.target.error);
  });
}
