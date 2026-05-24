import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const workTypes = [
  { name: "Кладка перегородок", unit: "м³" },
  { name: "Монтаж опалубки", unit: "м²" },
  { name: "Бетонирование", unit: "м³" },
  { name: "Арматурные работы", unit: "т" },
  { name: "Штукатурные работы", unit: "м²" },
  { name: "Малярные работы", unit: "м²" },
  { name: "Земляные работы", unit: "м³" },
];

async function main() {
  for (const workType of workTypes) {
    await prisma.workType.upsert({
      where: { name: workType.name },
      update: { unit: workType.unit },
      create: workType,
    });
  }

  const count = await prisma.workType.count();
  console.log(`Seeded ${count} work types`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
