import fs from 'fs';
import path from 'path';
import { Order, DiningTable, Payment } from '../types/index.js';

const DATA_DIR = process.cwd().endsWith('server')
  ? path.resolve(process.cwd(), 'data')
  : path.resolve(process.cwd(), 'server/data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const TMP_FILE = path.join(DATA_DIR, 'store.json.tmp');

export interface DiskStoreState {
  orders: Order[];
  tables: DiningTable[];
  payments: Payment[];
  lastSavedAt: string;
}

class DiskStorageService {
  private cache: DiskStoreState | null = null;
  private isSaving = false;
  private pendingSave = false;

  constructor() {
    this.ensureDataDir();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.warn('⚠️ Could not create data directory:', err);
      }
    }
  }

  public init(initialSeed: { orders: Order[]; tables: DiningTable[]; payments: Payment[] }): DiskStoreState {
    this.ensureDataDir();
    if (fs.existsSync(STORE_FILE)) {
      try {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.orders) && Array.isArray(parsed.tables)) {
          this.cache = parsed;
          console.log(`💾 DiskStorage: Loaded ${parsed.orders.length} orders & ${parsed.tables.length} tables from persistent disk.`);
          return this.cache!;
        }
      } catch (err: any) {
        console.warn('⚠️ DiskStorage read error, reinitializing with seed:', err?.message || err);
      }
    }

    this.cache = {
      orders: initialSeed.orders,
      tables: initialSeed.tables,
      payments: initialSeed.payments,
      lastSavedAt: new Date().toISOString(),
    };
    this.persistSync();
    return this.cache;
  }

  public getState(): DiskStoreState | null {
    return this.cache;
  }

  public updateOrders(orders: Order[]) {
    if (!this.cache) return;
    this.cache.orders = orders;
    this.queueSave();
  }

  public updateTables(tables: DiningTable[]) {
    if (!this.cache) return;
    this.cache.tables = tables;
    this.queueSave();
  }

  public addPayment(payment: Payment) {
    if (!this.cache) return;
    this.cache.payments.push(payment);
    this.queueSave();
  }

  private queueSave() {
    if (this.isSaving) {
      this.pendingSave = true;
      return;
    }
    this.isSaving = true;
    setImmediate(async () => {
      await this.persist();
      this.isSaving = false;
      if (this.pendingSave) {
        this.pendingSave = false;
        this.queueSave();
      }
    });
  }

  private async persist(): Promise<void> {
    if (!this.cache) return;
    try {
      this.cache.lastSavedAt = new Date().toISOString();
      const serialized = JSON.stringify(this.cache, null, 2);
      await fs.promises.writeFile(TMP_FILE, serialized, 'utf-8');
      await fs.promises.rename(TMP_FILE, STORE_FILE);
    } catch (err: any) {
      console.warn('⚠️ DiskStorage atomic write failed:', err?.message || err);
    }
  }

  private persistSync(): void {
    if (!this.cache) return;
    try {
      this.cache.lastSavedAt = new Date().toISOString();
      const serialized = JSON.stringify(this.cache, null, 2);
      fs.writeFileSync(TMP_FILE, serialized, 'utf-8');
      fs.renameSync(TMP_FILE, STORE_FILE);
      console.log('💾 DiskStorage: Initial state persisted to server/data/store.json.');
    } catch (err: any) {
      console.warn('⚠️ DiskStorage initial sync write failed:', err?.message || err);
    }
  }
}

export const diskStorage = new DiskStorageService();
