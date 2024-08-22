const { db } = require('@vercel/postgres');
const {
  tasks,
  users,
} = require('./placeholder-data.js');
const bcrypt = require('bcrypt');

const seedUsers = async (client) => {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS 'uuid-ossp'`;
    // Create the 'users' table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;

    console.log(`Created 'users' table`);

    // Insert data into the 'users' table
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return client.sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
      }),
    );

    console.log(`Seeded ${insertedUsers.length} users`);

    return {
      createTable,
      users: insertedUsers,
    };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

const seedTasks = async (client) => {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS 'uuid-ossp'`;

    const deleteTable = await client.sql`
      DROP TABLE IF EXISTS tasks;
    `;

    // Create the 'invoices' table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mindset VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL,
        date DATE NOT NULL
      );
    `;

    console.log(`Created 'tasks' table`);

    // Insert data into the 'invoices' table
    const seededTasks = await Promise.all(
      tasks.map(
        (task) => client.sql`
        INSERT INTO tasks (id, name, mindset, status, date)
        VALUES (${task.id}, ${task.name}, ${task.mindset}, ${task.status}, ${task.date})
        ON CONFLICT (id) DO NOTHING;
      `,
      ),
    );

    console.log(`Seeded ${seededTasks.length} tasks`);

    // const updateTableFullTask = await client.sql`
    //   ALTER TABLE tasks
    //   ADD duration TIME,
    //   ADD start_time DATE,
    //   ADD end_time DATE,
    //   ADD repeat BOOL DEFAULT 0,
    //   ADD frequency INT,
    //   ADD repeatRange ENUM('', 'day', 'week', 'month', 'year') DEFAULT '',
    //   ADD totalDuration TIME,
    //   ADD preferredTimeOfDay SET('morning', 'noon', 'afternoon', 'evening', 'night'),
    //   ADD preferredDayOfWeek SET('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    //   ADD type ENUM('task', 'project', 'step', 'goal'),
    //   ADD priority ENUM('urgent', 'high', 'medium', 'low') DEFAULT 'medium';
    // `;

    return {
      // deleteTable,
      createTable,
      // tasks: seededTasks,
    };
  } catch (error) {
    console.error('Error seeding tasks:', error);
    throw error;
  }
}

const main = async () => {
  const client = await db.connect();

  await seedUsers(client);
  await seedTasks(client);
  await deleteKnexTables(client);

  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
