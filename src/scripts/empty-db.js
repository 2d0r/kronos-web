import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ... you will write your Prisma Client queries here\
  await prisma.user.deleteMany();
  await prisma.mindset.deleteMany();
  
  console.log('Emptied database');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });