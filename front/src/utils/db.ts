// TODO: migrate to https://github.com/jlongster/absurd-sql
import { dbConfig } from "../constants";
import { Callable } from "../../../common/utils/typing";

export interface IDbOptions {
  dbName?: string;
  key?: string;
  indexes?: { key: string; unique: boolean }[];
  storeName: string;
  expiry?: number;
  hot?: boolean; // Added flag for hot cache
  onExpiry?: (id: string) => Callable<void>;
}

export type Boxed = {
  value: any;
  expiry?: number;
};

const isExpired = (o: any) => !o?.expiry || Date.now() > o.expiry;

// Method to initialize the database with all required stores
export function initializeIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbConfig.name, dbConfig.version);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      dbConfig.stores.forEach(storeConfig => {
        if (!db.objectStoreNames.contains(storeConfig.name)) {
          const store = db.objectStoreNames.contains(storeConfig.name)
            ? request.transaction!.objectStore(storeConfig.name)
            : db.createObjectStore(storeConfig.name, { keyPath: storeConfig.keyPath });
          // Create indexes, potentially with nested key paths
          storeConfig.indexes?.forEach(({ key, unique }) => {
            if (!store.indexNames.contains(key)) {
              store.createIndex(key, key, { unique });
            }
          });
        }
      });
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export class IndexedDBCache {
  private dbPromise?: Promise<IDBDatabase>;
  private inMemoryCache: Record<string, Boxed> = {}; // In-memory cache
  public dbName: string;
  public storeName: string;
  public ttl: number;
  public key: string;
  public indexes: { key: string; unique: boolean }[];
  public onExpiry: Callable<any>;
  public hot: boolean; // Flag to enable in-memory cache

  constructor(o: IDbOptions) {
    this.dbName = o.dbName || process.env.DB_NAME || "cache";
    this.storeName = o.storeName;
    this.ttl = o.expiry || 0;
    this.key = o.key || "id";
    this.indexes = o.indexes || [];
    this.onExpiry = o.onExpiry || this.remove.bind(this);
    this.hot = o.hot || false; // Set the hot flag
  }

  private async getClient(): Promise<IDBDatabase> {
    this.dbPromise ??= initializeIndexedDB(); // singleton
    return this.dbPromise;
  }

  async get(id: string, key = this.key): Promise<any> {
    if (this.hot && this.inMemoryCache[id] && !isExpired(this.inMemoryCache[id]))
      return this.inMemoryCache[id].value; // Return from in-memory cache if present and not expired

    try {
      const db = await this.getClient();
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request: IDBRequest<any> = key !== this.key ? store.index(key).get(id) : store.get(id);

      return new Promise((resolve, reject) => {
        request.onsuccess = async (bs) => {
          const data = request.result?.data ?? request.result;
          const expired = data && isExpired(data);
          if (expired) {
            console.warn(`Cache expired for ${id}, hydrating...`);
            await this.onExpiry(id); // Call onExpiry if expired
          } else if (this.hot && data.value) {
            this.inMemoryCache[id] = data; // Update in-memory cache
          }
          resolve(data?.value); // unbox
        },
        request.onerror = () => {
          console.log(request.error);
          resolve(undefined);
        };
      });
    } catch (e) {
      console.error(e, `${this.dbName}:${this.storeName}:${id}`);
    }
  }

  async getOrSet(
    id: string,
    fetcher: Callable<Promise<any>>,
    key = this.key,
    ttl = this.ttl
  ): Promise<any> {
    const cached = await this.get(id, key);
    if (cached) return cached;
    const data = await fetcher();
    await this.set(id, data, ttl);
    return data;
  }

  async getAll(key="id"): Promise<any[]> {
    try {
      const db = await this.getClient();
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const getAllRequest = store.getAll();

      // Getting all entries from IndexedDB
      const dbEntries = await new Promise<Boxed[]>((resolve, reject) => {
        getAllRequest.onsuccess = () => resolve(getAllRequest.result.map(item => item.data));
        getAllRequest.onerror = () => reject(getAllRequest.error);
      });

      // If hot cache is enabled, check for count match
      if (this.hot) {
        const dbCount = dbEntries.length;
        const ramCount = Object.keys(this.inMemoryCache).length;

        if (dbCount === ramCount) {
          // Return entries from RAM if counts match
          return Object.values(this.inMemoryCache).map(entry => entry.value);
        } else {
          // Synchronize RAM cache with DB entries if counts do not match
          this.inMemoryCache = dbEntries.reduce((acc: any, entry, index) => {
            const id = getAllRequest.result[index][key]; // Assuming your IDB records include an 'slug' field
            acc[id] = entry;
            return acc;
          }, {});
        }
      }

      return dbEntries.map(entry => entry.value);
    } catch (e) {
      console.error(e, `${this.dbName}:${this.storeName}`);
      return [];
    }
  }

  async set(id: string, o: any, ttl = this.ttl): Promise<void> {
    // Structure the record to include 'id' as the keyPath
    const record = { [this.key]: id, value: o, expiry: ttl ? Date.now() + ttl * 1000 : undefined };

    if (this.hot)
      this.inMemoryCache[id] = record;

    try {
      const db = await this.getClient();
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);

      // Use 'id' directly if your object store uses out-of-line keys, or as part of 'record' if using in-line keys
      store.put(record);

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = transaction.onabort = () => reject(transaction.error);
      });
    } catch (e) {
      console.error(e, `${this.dbName}:${this.storeName}:${id}`);
    }
  }

  async setAll(entries: { id: string, o: any, ttl?: number }[], storeName: string): Promise<void> {
    try {
      const db = await this.getClient();
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);

      entries.forEach(entry => {
        const { id, o, ttl } = entry;
        // Structure the record to include the object with data and optional expiry
        const record = { [this.key]: id, value: o, expiry: ttl ? Date.now() + ttl * 1000 : undefined };

        // If hot cache is enabled, update the in-memory cache
        if (this.hot)
          this.inMemoryCache[id] = record;
        store.put(record);
      });

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = transaction.onabort = () => reject(transaction.error);
      });
    } catch (e) {
      console.error(e, `${this.dbName}:${this.storeName}`);
      return;
    }
  }

  async remove(id: string, key = this.key): Promise<boolean> {
    if (this.hot) {
        // Assuming id is suitable for directly referencing items in the in-memory cache
        delete this.inMemoryCache[id];
    }

    try {
      const db = await this.getClient();
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
          if (key === this.key) {
              // If the provided key is the default keyPath, use it directly to delete
              const deleteRequest = store.delete(id);
              deleteRequest.onsuccess = () => resolve(true);
              deleteRequest.onerror = () => reject(deleteRequest.error);
          } else {
              // If a different key is provided, assume it's an index
              const index = store.index(key);
              const request = index.getKey(id);

              request.onsuccess = () => {
                  const primaryKey = request.result;
                  if (primaryKey) {
                      const deleteRequest = store.delete(primaryKey);
                      deleteRequest.onsuccess = () => resolve(true);
                      deleteRequest.onerror = () => reject(deleteRequest.error);
                  } else {
                      // If no record is found for the index, resolve as false
                      resolve(false);
                  }
              };

              request.onerror = () => reject(request.error);
          }

          transaction.onerror = transaction.onabort = () => reject(transaction.error);
      });
    } catch (e) {
      console.error(e, `${this.dbName}:${this.storeName}:${id}`);
      return false;
    }
  }

  async flush(): Promise<void> {
    if (this.hot)
      this.inMemoryCache = {}; // Clear in-memory cache
    try {
      const db = await this.getClient();
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      store.clear();

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = transaction.onabort = () =>
          reject(transaction.error);
      });
    } catch (e) {
      console.error(e, `${this.dbName}:${this.storeName}`);
      return;
    }
  }
}
