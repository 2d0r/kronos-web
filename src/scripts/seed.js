const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      name: '2d0r',
      email: '2d0r@kronos.com'
    },
  });
  console.log('Seeded users table with:', {
    name: '2d0r',
    email: '2d0r@kronos.com'
  });

  // await prisma.mindset.create({
  //   data: {
  //     name: 'survive',
  //     display: 'Survive',
  //     maslowLevel: 1,
  //     colour: '#d44c47',
  //   },
  // });
  // await prisma.mindset.create({
  //   data: {
  //     name: 'work',
  //     display: 'Work',
  //     maslowLevel: 2,
  //     colour: '#337ea9',
  //   },
  // });
  // await prisma.mindset.create({
  //   data: {
  //     name: 'chore',
  //     display: 'Chore',
  //     maslowLevel: 2,
  //     colour: '#d9730d',
  //   },
  // });
  // await prisma.mindset.create({
  //   data: {
  //     name: 'freeTime',
  //     display: 'Free Time',
  //     maslowLevel: 3,
  //     colour: '#cb912f',
  //   },
  // });
  // await prisma.mindset.create({
  //   data: {
  //     name: 'love',
  //     display: 'Family & Friends',
  //     maslowLevel: 3,
  //     colour: '#c14c8a',
  //   },
  // });
  // await prisma.mindset.create({
  //   data: {
  //     name: 'learn',
  //     display: 'Learn',
  //     maslowLevel: 4,
  //     colour: '#18938D',
  //   },
  // });
  // await prisma.mindset.create({
  //   data: {
  //     name: 'health',
  //     display: 'Health',
  //     maslowLevel: 4,
  //     colour: '#448361',
  //   },
  // });
  // await prisma.mindset.create({
  //   data: {
  //     name: 'create',
  //     display: 'Create',
  //     maslowLevel: 4,
  //     colour: '#7c3aed',
  //   },
  // });
  // await prisma.mindset.create({
  //   data: {
  //     name: 'achieve',
  //     display: 'Achieve',
  //     maslowLevel: 5,
  //     colour: '#7c3aed',
  //   },
  // });

  // const allMindsets = await prisma.mindset.findMany();
  // console.log('Seeded mindsets table with:', Object.keys(allMindsets));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })