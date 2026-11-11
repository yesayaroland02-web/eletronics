const memoryCache = new Map<string, { value: any; expiry: number }>();

export const redis = {
  async get(key: string) {
    const item = memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      memoryCache.delete(key);
      return null;
    }
    return item.value;
  },
  async set(key: string, value: any, options?: { ex?: number }) {
    const ttlSeconds = options?.ex ?? 60;
    memoryCache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  },
  async del(key: string) {
    memoryCache.delete(key);
  },
};