const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const run = async () => {
  await prisma.$executeRawUnsafe('ALTER TABLE "Case" ADD COLUMN IF NOT EXISTS "agentId" TEXT');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Case_agentId_idx" ON "Case"("agentId")');
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Case_agentId_fkey'
      ) THEN
        ALTER TABLE "Case"
        ADD CONSTRAINT "Case_agentId_fkey"
        FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END
    $$;
  `);
};

run()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Case.agentId schema is ready.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
