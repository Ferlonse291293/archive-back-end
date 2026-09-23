import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
    connectionString: String(process.env.DATABASE_URL)
})

const prisma = new PrismaClient({ adapter });

const departments = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "./departments.json"),
        "utf-8"
    )
);


async function main() {
    console.log("Seed started");

    for (const d of departments) {
        await prisma.department.upsert({
            where: { id: d.id },
            update: {
                code: d.code,
                name: d.name,
                city: d.city,
                address: d.street,
                isActive: true,
            },
            create: {
                id: d.id,
                code: d.code,
                name: d.name,
                city: d.city,
                address: d.street,
                isActive: true,
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
