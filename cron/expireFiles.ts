import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { subHours } from "date-fns";

const prisma = new PrismaClient();

cron.schedule("0 * * * * *", async () => {
    try {
        const res = await prisma.file.updateMany({
            where: {
                createdAt: { lt: subHours(new Date(), 24) },
                currentStatus: "ACTIVE",
            },
            data: {
                currentStatus: "EXPIRED",
            },
        });
        console.log(res.count);
    } catch (e) {
        console.log(e);
    }
});

// The deletion of files in the S3 bucket will be handled by a lifecycle rule I've set in AWS.
