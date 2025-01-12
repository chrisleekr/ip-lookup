export interface CacheOptions {
  stdTTL?: number;
  checkperiod?: number;
  useClones?: boolean;
  deleteOnExpire?: boolean;
  maxKeys?: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  lastError?: {
    timestamp: string;
    message: string;
  };
}

export interface Cache {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttl?: number): Promise<boolean>;
  del(key: string): Promise<number>;
  flush(): Promise<void>;
  getMetrics(): Promise<CacheStats>;
  close(): Promise<void>;
}
