// Quick script to clean up old author data before migration
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up old author data...');

  // Delete all existing authors
  const deleted = await prisma.author.deleteMany({});
  console.log(`✅ Deleted ${deleted.count} old author records`);

  console.log(
    '✨ Database is now ready for new authors with email/password fields',
  );
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
