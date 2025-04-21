import Redis from "ioredis";

const redis = new Redis({
    host: "redis-14163.c301.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 14163,
    username: "default",
    password: process.env.REDIS_PASSWORD,
});

export default redis;
