import { PrismaClient, TypeClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prisma 7: конструктор PrismaClient требует явный adapter, "голый"
// new PrismaClient() больше не подключается автоматически по DATABASE_URL.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Путь к clients.json — поменяй, если файл лежит в другом месте
const CLIENTS_JSON_PATH = path.join(__dirname, "clients.json");

const CLIENT_TYPE_MAP = {
  C01: TypeClient.INDIVIDUALS,
  C02: TypeClient.LEGAL_ENTITY,
  C03: TypeClient.SOLE_PROPRIETOR,
};

async function main() {
  const raw = fs.readFileSync(CLIENTS_JSON_PATH, "utf-8");
  const clients = JSON.parse(raw);

  console.log(`Найдено ${clients.length} клиентов в файле.`);

  let upserted = 0;
  let skipped = 0;

  for (const c of clients) {
    const typeClient = CLIENT_TYPE_MAP[c.clientType];
    if (!typeClient) {
      console.error(`Неизвестный clientType "${c.clientType}" у клиента ${c.id}, пропускаю.`);
      skipped++;
      continue;
    }

    // upsert вместо deleteMany+create: не трогает связанные document_groups,
    // если они уже есть у клиента, и идемпотентен при повторных запусках.
    await prisma.client.upsert({
      where: { id: c.id },
      update: {
        typeClient,
        email: c.email,
        phone: c.phone,
        code: c.code,
        individual: {
          upsert: {
            update: {
              firstName: c.firstName,
              lastName: c.lastName,
              fullName: c.fullName,
              birthDate: new Date(Number(c.birthDate)),
              nationality: c.nationality,
              department: { connect: { id: c.departmentId } },
              passportNumber: c.passportNumber,
              ipn: c.ipn,
            },
            create: {
              firstName: c.firstName,
              lastName: c.lastName,
              fullName: c.fullName,
              birthDate: new Date(Number(c.birthDate)),
              nationality: c.nationality,
              department: { connect: { id: c.departmentId } },
              passportNumber: c.passportNumber,
              ipn: c.ipn,
            },
          },
        },
      },
      create: {
        id: c.id,
        typeClient,
        email: c.email,
        phone: c.phone,
        code: c.code,
        individual: {
          create: {
            firstName: c.firstName,
            lastName: c.lastName,
            fullName: c.fullName,
            birthDate: new Date(Number(c.birthDate)),
            nationality: c.nationality,
            department: { connect: { id: c.departmentId } },

            passportNumber: c.passportNumber,
            ipn: c.ipn,
          },
        },
      },
    });
    upserted++;
  }

  console.log(`Готово. Создано/обновлено клиентов: ${upserted}, пропущено: ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
