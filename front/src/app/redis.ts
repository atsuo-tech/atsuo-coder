import { createClient } from 'redis';
const redis = createClient({url:"redis://127.0.0.1:6379"});
redis.connect()
export default redis;
