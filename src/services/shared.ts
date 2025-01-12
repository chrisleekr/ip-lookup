import { IpLookupService } from './ip-lookup/ip-lookup.service';
import { MaxMindProvider } from './providers/maxmind/maxmind.provider';
import { IPInfoProvider } from './providers/ipinfo/ipinfo.provider';
import { config } from '@/config';
import { NodeMemoryCache } from '@/utils/cache/cache.node-memory';

// Create singleton instance of IpLookupService
export const ipLookupService = new IpLookupService(
  [new MaxMindProvider(), new IPInfoProvider(config.ipInfo)],
  new NodeMemoryCache(),
);
