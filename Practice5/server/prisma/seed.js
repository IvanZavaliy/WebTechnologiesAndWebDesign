const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({ data: { name: 'Engineering' } }),
    prisma.department.create({ data: { name: 'Marketing' } }),
    prisma.department.create({ data: { name: 'Sales' } }),
    prisma.department.create({ data: { name: 'Human Resources' } }),
    prisma.department.create({ data: { name: 'Finance' } }),
  ]);

  // Create users
  const users = [
    { firstName: 'Oleksandr', lastName: 'Kovalenko', email: 'o.kovalenko@company.com', phone: '+380501234567', departmentId: departments[0].id },
    { firstName: 'Maria', lastName: 'Shevchenko', email: 'm.shevchenko@company.com', phone: '+380671234567', departmentId: departments[1].id },
    { firstName: 'Dmytro', lastName: 'Bondarenko', email: 'd.bondarenko@company.com', phone: '+380931234567', departmentId: departments[0].id },
    { firstName: 'Iryna', lastName: 'Tkachenko', email: 'i.tkachenko@company.com', phone: '+380441234567', departmentId: departments[2].id },
    { firstName: 'Andriy', lastName: 'Melnyk', email: 'a.melnyk@company.com', phone: '+380501234568', departmentId: departments[3].id },
    { firstName: 'Natalia', lastName: 'Kravchenko', email: 'n.kravchenko@company.com', phone: '+380671234568', departmentId: departments[4].id },
    { firstName: 'Yuriy', lastName: 'Lysenko', email: 'y.lysenko@company.com', phone: '+380931234568', departmentId: departments[0].id },
    { firstName: 'Svitlana', lastName: 'Moroz', email: 's.moroz@company.com', phone: '+380441234568', departmentId: departments[1].id },
    { firstName: 'Viktor', lastName: 'Polishchuk', email: 'v.polishchuk@company.com', phone: '+380501234569', departmentId: departments[2].id },
    { firstName: 'Oksana', lastName: 'Boyko', email: 'o.boyko@company.com', phone: '+380671234569', departmentId: departments[3].id },
    { firstName: 'Roman', lastName: 'Savchenko', email: 'r.savchenko@company.com', phone: '+380931234569', departmentId: departments[4].id },
    { firstName: 'Tetiana', lastName: 'Marchenko', email: 't.marchenko@company.com', phone: '+380441234569', departmentId: departments[0].id },
    { firstName: 'Serhiy', lastName: 'Rudenko', email: 's.rudenko@company.com', phone: '+380501234570', departmentId: departments[1].id },
    { firstName: 'Larysa', lastName: 'Zinchenko', email: 'l.zinchenko@company.com', phone: '+380671234570', departmentId: departments[2].id },
    { firstName: 'Petro', lastName: 'Honcharenko', email: 'p.honcharenko@company.com', phone: '+380931234570', departmentId: departments[3].id },
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  console.log('Seed completed: 5 departments, 15 users created.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
