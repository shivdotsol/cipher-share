import Redis from "ioredis";

const redis = new Redis({
    host: "redis-13490.crce206.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 13490,
    username: "default",
    password: process.env.REDIS_PASSWORD,
});

export default redis;
