const Route = {
  HEALTH_CHECK: {
    PING: 'ping',
    MONGO: 'mongo',
    DATABASE: 'database',
    MEMORY_HEAP: 'memory-heap',
    MEMORY_RSS: 'memory-rss',
    STORAGE: 'storage',
    KAFKA: 'kafka',
    toString: () => 'health',
  },
  USERS: {
    toString: () => 'users',
  },
};

export default Route;
