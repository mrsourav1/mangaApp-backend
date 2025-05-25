import redis from 'redis';

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

await client.connect();

export const getCache = async (key) => {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
};

export const setCache = async (key, data) => {
  try {
    await client.setEx(key, CACHE_TTL, JSON.stringify(data));
  } catch (error) {
    console.error('Cache write error:', error);
  }
};