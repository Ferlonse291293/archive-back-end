import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prisma 7: конструктор PrismaClient требует явный adapter.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const FOLDERS_JSON_PATH = path.join(__dirname, "folders.json");
const TEMPLATES_JSON_PATH = path.join(__dirname, "document-templates.json");

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function genId(len = 16) {
  let out = "";
  const bytes = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

const CLIENTS_TO_SEED = 2000; // первые N клиентов из БД
const DOCS_PER_CLIENT = 30;

async function main() {
  const folders = JSON.parse(fs.readFileSync(FOLDERS_JSON_PATH, "utf-8"));
  const templates = JSON.parse(fs.readFileSync(TEMPLATES_JSON_PATH, "utf-8"));

  if (templates.length !== DOCS_PER_CLIENT) {
    console.warn(
      `Внимание: шаблонов ${templates.length}, а нужно ${DOCS_PER_CLIENT} документов на клиента. ` +
        `Скрипт всё равно пройдёт по всем шаблонам по кругу.`
    );
  }

  // 1) Папки — идемпотентно, сначала родительские (parentFolderId = null), потом дочерние
  const roots = folders.filter((f) => f.parentFolderId === null);
  const children = folders.filter((f) => f.parentFolderId !== null);

  for (const f of roots) {
    await prisma.folder.upsert({
      where: { id: f.id },
      update: { name: f.name, parentFolderId: null },
      create: { id: f.id, name: f.name, parentFolderId: null },
    });
  }
  for (const f of children) {
    await prisma.folder.upsert({
      where: { id: f.id },
      update: { name: f.name, parentFolderId: f.parentFolderId },
      create: { id: f.id, name: f.name, parentFolderId: f.parentFolderId },
    });
  }
  console.log(`Папки готовы: ${folders.length}`);

  // 2) Клиенты берём напрямую из БД (уже залиты через seed-clients.js)
  const targetClients = await prisma.client.findMany({
    take: CLIENTS_TO_SEED,
    orderBy: { createdAt: "asc" },
  });

  if (targetClients.length === 0) {
    console.error("В БД нет клиентов. Сначала прогони seed-clients.js.");
    return;
  }
  if (targetClients.length < CLIENTS_TO_SEED) {
    console.warn(
      `В БД только ${targetClients.length} клиентов, ожидалось ${CLIENTS_TO_SEED}. ` +
        `Документы создам только для найденных.`
    );
  }

  let totalDocs = 0;

  for (const client of targetClients) {
    for (let i = 0; i < DOCS_PER_CLIENT; i++) {
      const template = templates[i % templates.length];

      const groupId = genId();
      const documentId = genId();
      const metadataId = genId();
      const fileId = genId();

      const now = new Date();

      await prisma.documentGroup.create({
        data: {
          id: groupId,
          clientId: client.id,
          folderId: template.folderId,
          title: template.title,
          versions: {
            create: {
              id: documentId,
              createdAt: now,
              updatedAt: now,
              metadata: {
                create: {
                  id: metadataId,
                  version: 1,
                  language: "en",
                  confidential: template.confidential,
                  documentType: template.documentType,
                  issueDate: now,
                  expiryDate: null,
                  issuingAuthority: null,
                  verificationStatus: "PENDING",
                },
              },
              files: {
                create: {
                  file: {
                    create: {
                      id: fileId,
                      fileName: `${template.documentType.toLowerCase()}.pdf`,
                      mimeType: "application/pdf",
                      sizeBytes: 100_000 + Math.floor(Math.random() * 400_000),
                      storagePath: `/storage/${client.id}/${documentId}/${fileId}.pdf`,
                      checksum: crypto.randomBytes(16).toString("hex"),
                      uploadedAt: now,
                    },
                  },
                },
              },
            },
          },
        },
      });

      await prisma.documentGroup.update({
        where: { id: groupId },
        data: { currentVersionId: documentId },
      });

      totalDocs++;
    }

    console.log(`Клиент ${client.id}: создано ${DOCS_PER_CLIENT} документов.`);
  }

  console.log(`Готово. Всего документов создано: ${totalDocs} для ${targetClients.length} клиентов.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
