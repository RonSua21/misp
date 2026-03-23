/**
 * Seed script — populates default benefit programs.
 * Run with: npx ts-node prisma/seed.ts
 * Or via: npm run db:seed (after adding to package.json)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PROGRAMS = [
  {
    name: "Emergency Financial Assistance",
    category: "FINANCIAL_ASSISTANCE" as const,
    description:
      "Emergency cash assistance for Makati City residents facing economic hardship due to calamity, job loss, or other crises.",
    requirements: [
      "Valid Government-Issued ID",
      "Proof of Residency (Barangay Certificate)",
      "Income Certificate or Sworn Affidavit",
      "Application Letter",
    ],
    maxAmount: 5000,
    isActive: true,
  },
  {
    name: "Medical Assistance Program",
    category: "MEDICAL_ASSISTANCE" as const,
    description:
      "Financial support for hospitalization, medicines, dialysis, and laboratory fees for qualified low-income residents.",
    requirements: [
      "Valid Government-Issued ID",
      "Medical Certificate from attending physician",
      "Hospital/Clinic Statement of Account",
      "Prescription (if for medicines)",
      "Proof of Residency",
    ],
    maxAmount: 10000,
    isActive: true,
  },
  {
    name: "Senior Citizen Social Pension",
    category: "SENIOR_CITIZEN" as const,
    description:
      "Monthly financial assistance and social welfare support for senior citizens aged 60 and above residing in Makati City.",
    requirements: [
      "Senior Citizen ID",
      "Valid Government-Issued ID",
      "Proof of Residency (Barangay Certificate)",
      "Birth Certificate",
      "2x2 ID photo",
    ],
    maxAmount: 500,
    isActive: true,
  },
  {
    name: "PWD Assistance Program",
    category: "PWD_ASSISTANCE" as const,
    description:
      "Financial aid, assistive devices, and livelihood support for Persons with Disabilities registered in Makati City.",
    requirements: [
      "PWD ID",
      "Medical Certificate from licensed physician",
      "Valid Government-Issued ID",
      "Proof of Residency",
      "Disability documentation",
    ],
    maxAmount: 5000,
    isActive: true,
  },
];

async function main() {
  console.log("Seeding benefit programs…");
  for (const program of PROGRAMS) {
    await prisma.benefitProgram.upsert({
      where: {
        // Use name as unique identifier for idempotent seeding
        id: program.name,
      },
      update: program,
      create: program,
    });
    console.log(`  ✓ ${program.name}`);
  }
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
