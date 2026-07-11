const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const run = async () => {
  await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "operatorProviderId" TEXT');
  await prisma.$executeRawUnsafe('ALTER TABLE "FieldOfficer" ADD COLUMN IF NOT EXISTS "providerId" TEXT');

  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "User_operatorProviderId_idx" ON "User"("operatorProviderId")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "FieldOfficer_providerId_areaId_isAvailable_idx" ON "FieldOfficer"("providerId", "areaId", "isAvailable")');

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_operatorProviderId_fkey') THEN
        ALTER TABLE "User"
        ADD CONSTRAINT "User_operatorProviderId_fkey"
        FOREIGN KEY ("operatorProviderId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FieldOfficer_providerId_fkey') THEN
        ALTER TABLE "FieldOfficer"
        ADD CONSTRAINT "FieldOfficer_providerId_fkey"
        FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END
    $$;
  `);
};

run()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Provider assignment schema is ready.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
