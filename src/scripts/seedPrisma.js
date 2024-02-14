import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

async function main() {
  // ... you will write your Prisma Client queries here\
  await prisma.user.create({
    data: {
      name: 'Tudor',
      email: 'tudor@kronos.com'
    },
  });
  await prisma.mindset.create({
    data: {
      name: 'restReward',
      restReward:     1,
      survive:        1,
      maintain:       1,
      socialise:      1,
      play:           1,
      learn:          1,
      create:         1,
      selfChallenge:  1,
      selfCare:       1,
    },
  });
  await prisma.mindset.create({
    data: {
      name: 'survive',
      restReward:     1,
      survive:        1,
      maintain:       1,
      socialise:      2,
      play:           2,
      learn:          3,
      create:         3,
      selfChallenge:  3,
      selfCare:       4,
    },
  });
  await prisma.mindset.create({
    data: {
      name: 'maintain',
      restReward:     1,
      survive:        1,
      maintain:       1,
      socialise:      1,
      play:           1,
      learn:          2,
      create:         2,
      selfChallenge:  2,
      selfCare:       3,
    },
  });
  await prisma.mindset.create({
    data: {
      name: 'socialise',
      restReward:     1,
      survive:        2,
      maintain:       1,
      socialise:      1,
      play:           1,
      learn:          1,
      create:         1,
      selfChallenge:  1,
      selfCare:       2,
    },
  });
  await prisma.mindset.create({
    data: {
      name: 'play',
      restReward:     1,
      survive:        2,
      maintain:       1,
      socialise:      1,
      play:           1,
      learn:          1,
      create:         1,
      selfChallenge:  1,
      selfCare:       2,
    },
  });
  await prisma.mindset.create({
    data: {
      name: 'learn',
      restReward:     1,
      survive:        3,
      maintain:       2,
      socialise:      1,
      play:           1,
      learn:          1,
      create:         1,
      selfChallenge:  1,
      selfCare:       1,
    },
  });
  await prisma.mindset.create({
    data: {
      name: 'create',
      restReward:     1,
      survive:        3,
      maintain:       2,
      socialise:      1,
      play:           1,
      learn:          1,
      create:         1,
      selfChallenge:  1,
      selfCare:       1,
    },
  });
  await prisma.mindset.create({
    data: {
      name: 'selfChallenge',
      restReward:     1,
      survive:        3,
      maintain:       2,
      socialise:      1,
      play:           1,
      learn:          1,
      create:         1,
      selfChallenge:  1,
      selfCare:       1,
    },
  });
  await prisma.mindset.create({
    data: {
      name: 'selfCare',
      restReward:     1,
      survive:        4,
      maintain:       3,
      socialise:      2,
      play:           2,
      learn:          1,
      create:         1,
      selfChallenge:  1,
      selfCare:       1,
    },
  });

  const allMindsets = await prisma.mindset.findMany();
  console.dir(allMindsets, { depth: null });
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