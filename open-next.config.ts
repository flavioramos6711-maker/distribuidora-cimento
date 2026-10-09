import type { OpenNextConfig } from '@opennextjs/cloudflare';
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: 'cloudflare-node',
      converter: 'edge',
      proxyExternalRequest: 'fetch',
      incrementalCache: kvIncrementalCache,
      tagCache: 'dummy',
      queue: 'dummy',
    },
  },
  middleware: {
    external: true,
  },
};

export default config;
