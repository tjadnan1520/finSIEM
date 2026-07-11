const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const run = async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "FieldOfficer" (
      "id" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "isAvailable" BOOLEAN NOT NULL DEFAULT true,
      "userId" TEXT NOT NULL,
      "areaId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "FieldOfficer_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "FieldOfficer_code_key" ON "FieldOfficer"("code")');
  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "FieldOfficer_phone_key" ON "FieldOfficer"("phone")');
  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "FieldOfficer_userId_key" ON "FieldOfficer"("userId")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "FieldOfficer_areaId_isAvailable_idx" ON "FieldOfficer"("areaId", "isAvailable")');
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FieldOfficer_userId_fkey') THEN
        ALTER TABLE "FieldOfficer"
        ADD CONSTRAINT "FieldOfficer_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FieldOfficer_areaId_fkey') THEN
        ALTER TABLE "FieldOfficer"
        ADD CONSTRAINT "FieldOfficer_areaId_fkey"
        FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;
    END
    $$;
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "Role" ("id", "name", "description", "createdAt", "updatedAt")
    SELECT gen_random_uuid()::text, 'Field Officer', 'Field operation user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM "Role" WHERE "name" = 'Field Officer')
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "FieldOfficer" ("id", "code", "phone", "userId", "areaId", "createdAt", "updatedAt")
    SELECT
      gen_random_uuid()::text,
      'FO-' || substring(a."code" from 4),
      regexp_replace(a."phone", '017', '018'),
      a."userId",
      a."areaId",
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    FROM "Agent" a
    JOIN "User" u ON u."id" = a."userId"
    WHERE a."userId" IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM "FieldOfficer" fo WHERE fo."userId" = a."userId")
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE "User"
    SET "roleId" = (SELECT "id" FROM "Role" WHERE "name" = 'Field Officer')
    WHERE "id" IN (SELECT "userId" FROM "FieldOfficer")
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE "Agent"
    SET "userId" = NULL
    WHERE "userId" IN (SELECT "userId" FROM "FieldOfficer")
  `);
};

run()
  .then(async () => {
    await prisma.$disconnect();
    console.log("FieldOfficer schema and backfill are ready.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
