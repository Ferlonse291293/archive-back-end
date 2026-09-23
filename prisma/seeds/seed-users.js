import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import "dotenv/config"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
    connectionString: String(process.env.DATABASE_URL)
})

const prisma = new PrismaClient({ adapter });

const users = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "./users.json"),
        "utf-8"
    )
);


async function main() {
    console.log("Seed started");

    for (const user of users) {
        const passwordHash = await bcrypt.hash(user.password, 10);

        await prisma.user.upsert({
            where: { username: user.username },
            update: {
                email: user.email,
                passwordHash,
                role: user.role,
            },
            create: {
                username: user.username,
                email: user.email,
                passwordHash,
                role: user.role,
            },
        });
    }

    console.log("Seed finished");
}

main()
    .catch((e) => {
        console.error("SEED ERROR:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
