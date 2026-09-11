// ─── Fast In-Memory TTL Cache with Tag Invalidation & Sweeper ────────────────
export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags: string[];
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRatio: number;
}

export class TtlCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private tagIndex = new Map<string, Set<string>>();
  private hits = 0;
  private misses = 0;
  private sweepInterval: NodeJS.Timeout | null = null;

  constructor(autoSweep = true) {
    if (autoSweep && typeof setInterval !== 'undefined') {
      this.sweepInterval = setInterval(() => this.sweep(), 30_000);
      if (this.sweepInterval && typeof this.sweepInterval === 'object' && 'unref' in this.sweepInterval) {
        this.sweepInterval.unref();
      }
    }
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      this.misses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.deleteKey(key);
      this.misses++;
      return null;
    }
    this.hits++;
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs: number, tags: string[] = []): void {
    if (this.store.has(key)) {
      this.unindexTags(key);
    }
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs, tags });
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
  }

  invalidate(prefix: string): void {
    for (const key of Array.from(this.store.keys())) {
      if (key.startsWith(prefix)) {
        this.deleteKey(key);
      }
    }
  }

  invalidateTag(tag: string): void {
    const keys = this.tagIndex.get(tag);
    if (!keys) return;
    for (const key of Array.from(keys)) {
      this.deleteKey(key);
    }
    this.tagIndex.delete(tag);
  }

  private unindexTags(key: string): void {
    const entry = this.store.get(key);
    if (!entry) return;
    for (const tag of entry.tags) {
      const set = this.tagIndex.get(tag);
      if (set) {
        set.delete(key);
        if (set.size === 0) this.tagIndex.delete(tag);
      }
    }
  }

  private deleteKey(key: string): void {
    this.unindexTags(key);
    this.store.delete(key);
  }

  sweep(): number {
    const now = Date.now();
    let purged = 0;
    for (const [key, entry] of Array.from(this.store.entries())) {
      if (now > entry.expiresAt) {
        this.deleteKey(key);
        purged++;
      }
    }
    return purged;
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.store.size,
      hitRatio: total > 0 ? Number((this.hits / total).toFixed(4)) : 0,
    };
  }

  clear(): void {
    this.store.clear();
    this.tagIndex.clear();
    this.hits = 0;
    this.misses = 0;
  }

  destroy(): void {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }
    this.clear();
  }
}

export const cache = new TtlCache();

export const TTL = {
  HOTEL:      60_000,
  TABLES:     30_000,
  CATEGORIES: 60_000,
  MENU:       60_000,
  ORDERS:     10_000,
  ANALYTICS:  30_000,
} as const;
