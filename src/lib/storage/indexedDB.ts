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

// 3.1 GET SINGLE DOCUMENT LOCALLY
export async function getDocumentLocally(id: string): Promise<Document | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["documents"], "readonly");
    const store = transaction.objectStore("documents");
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = (e: any) => reject(e.target.error);
  });
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
  // We use dynamic import for createClient to avoid circular dependencies or early initialization issues
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["syncQueue"], "readonly");
    const store = transaction.objectStore("syncQueue");
    const request = store.getAll();
    
    request.onsuccess = async () => {
      const queue = request.result || [];
      if (queue.length === 0) {
        resolve();
        return;
      }

      for (const item of queue) {
        try {
          // Fetch the full document from the documents store
          const doc = await getDocumentLocally(item.id);
          
          if (doc) {
            console.log(`Syncing document to cloud: ${doc.id}`);
            
            const { error: syncError } = await supabase.from('documents').upsert({
              id: doc.id,
              title: doc.title || "Untitled Record",
              content_json: doc.content_json || {},
              subject: doc.subject,
              language: doc.language,
              updated_at: new Date(doc.updated_at).toISOString()
            });

            if (syncError) {
              console.error(`Cloud sync failed for ${doc.id}:`, syncError.message);
              continue; // Skip this item for now
            }
          }

          // Remove from queue after successful sync or if document was deleted locally
          const deleteTx = db.transaction(["syncQueue"], "readwrite");
          const deleteStore = deleteTx.objectStore("syncQueue");
          deleteStore.delete(item.id);
          
        } catch (err) {
          console.error(`Error processing sync item ${item.id}:`, err);
        }
      }
      resolve();
    };
    request.onerror = (e: any) => reject(e.target.error);
  });
}
