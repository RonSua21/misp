import { PrismaClient, ApplicationStatus, VoterStatus } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const firstNames = ["Maria", "Jose", "Juan", "Ana", "Rosa", "Pedro", "Carlo", "Liza", "Mark", "Grace", "Antonio", "Maricel", "Ramon", "Jasmine", "Eduardo", "Cynthia", "Roberto", "Sheila", "Ernesto", "Rowena"];
const lastNames = ["Santos", "Reyes", "Cruz", "Bautista", "Garcia", "Mendoza", "Flores", "Aquino", "Ramos", "Dela Cruz", "Torres", "Villanueva", "Castillo", "Gonzales", "Perez", "Delos Santos", "Fernandez", "Dizon", "Manalo", "Ocampo"];
const barangays = ["Bangkal", "Bel-Air", "Cembo", "Comembo", "Dasmariñas", "East Rembo", "Guadalupe Nuevo", "Guadalupe Viejo", "Hulo", "Olympia", "Palanan", "Pembo", "Pinagkaisahan", "Pio del Pilar", "Pitogo", "Poblacion", "San Antonio", "San Isidro", "Singkamas", "West Rembo"];
const streets = ["Ayala Avenue", "EDSA", "Chino Roces Avenue", "Makati Avenue", "Buendia Avenue"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const PROGRAMS = [
  { name: "Emergency Financial Assistance", category: "FINANCIAL_ASSISTANCE" as const, description: "Emergency cash assistance for Makati City residents facing economic hardship due to calamity, job loss, or other crises.", requirements: ["Valid Government-Issued ID", "Proof of Residency (Barangay Certificate)", "Income Certificate or Sworn Affidavit", "Application Letter"], maxAmount: 5000, isActive: true },
  { name: "Livelihood Assistance Program", category: "FINANCIAL_ASSISTANCE" as const, description: "Financial support for small business startup or expansion for qualified low-income Makati residents.", requirements: ["Valid Government-Issued ID", "Proof of Residency", "Business Plan", "Barangay Clearance"], maxAmount: 10000, isActive: true },
  { name: "Educational Financial Assistance", category: "FINANCIAL_ASSISTANCE" as const, description: "Scholarship and educational support for deserving students from indigent Makati families.", requirements: ["Valid Government-Issued ID", "School Enrollment Certificate", "Report Card", "Proof of Residency"], maxAmount: 3000, isActive: true },
  { name: "Burial Assistance Program", category: "FINANCIAL_ASSISTANCE" as const, description: "Financial aid to bereaved families for funeral and burial expenses of deceased Makati residents.", requirements: ["Death Certificate", "Valid ID of Claimant", "Proof of Relationship", "Proof of Residency"], maxAmount: 5000, isActive: true },
  { name: "Solo Parent Financial Aid", category: "FINANCIAL_ASSISTANCE" as const, description: "Monthly cash assistance for registered solo parents in Makati City.", requirements: ["Solo Parent ID", "Birth Certificate of Child", "Valid Government-Issued ID", "Proof of Residency"], maxAmount: 2000, isActive: true },
  { name: "Fire Victim Assistance", category: "FINANCIAL_ASSISTANCE" as const, description: "Immediate financial relief for Makati residents who have lost their homes due to fire incidents.", requirements: ["Fire Incident Report", "Valid Government-Issued ID", "Proof of Residency", "Barangay Certification"], maxAmount: 5000, isActive: true },
  { name: "Transportation Assistance", category: "FINANCIAL_ASSISTANCE" as const, description: "Transportation allowance for indigent residents needing to travel for medical or legal purposes.", requirements: ["Valid Government-Issued ID", "Medical/Legal Referral Letter", "Proof of Residency"], maxAmount: 1000, isActive: true },
  { name: "Housing Repair Assistance", category: "FINANCIAL_ASSISTANCE" as const, description: "Financial aid for minor home repair and improvement for qualified low-income homeowners in Makati.", requirements: ["Valid Government-Issued ID", "Proof of Home Ownership", "Proof of Residency", "Photo of Damage"], maxAmount: 8000, isActive: true },
  { name: "Medical Assistance Program", category: "MEDICAL_ASSISTANCE" as const, description: "Financial support for hospitalization, medicines, dialysis, and laboratory fees for qualified low-income residents.", requirements: ["Valid Government-Issued ID", "Medical Certificate from attending physician", "Hospital/Clinic Statement of Account", "Prescription (if for medicines)", "Proof of Residency"], maxAmount: 10000, isActive: true },
  { name: "Dialysis Assistance Program", category: "MEDICAL_ASSISTANCE" as const, description: "Subsidized dialysis sessions for indigent Makati residents with chronic kidney disease.", requirements: ["Valid Government-Issued ID", "Medical Certificate from Nephrologist", "Dialysis Schedule", "Proof of Residency"], maxAmount: 15000, isActive: true },
  { name: "Cancer Treatment Support", category: "MEDICAL_ASSISTANCE" as const, description: "Financial assistance for chemotherapy, radiation, and other cancer treatments for qualified Makati residents.", requirements: ["Valid Government-Issued ID", "Oncologist Certificate", "Treatment Plan", "Hospital Statement of Account", "Proof of Residency"], maxAmount: 20000, isActive: true },
  { name: "Mental Health Support Program", category: "MEDICAL_ASSISTANCE" as const, description: "Free psychological counseling and psychiatric consultation for Makati residents in need.", requirements: ["Valid Government-Issued ID", "Referral Letter", "Proof of Residency"], maxAmount: null, isActive: true },
  { name: "Maternal Care Assistance", category: "MEDICAL_ASSISTANCE" as const, description: "Financial support for prenatal care, delivery, and postnatal care for indigent mothers in Makati.", requirements: ["Valid Government-Issued ID", "OB-GYN Referral", "Proof of Pregnancy", "Proof of Residency"], maxAmount: 5000, isActive: true },
  { name: "Pediatric Medical Aid", category: "MEDICAL_ASSISTANCE" as const, description: "Medical assistance for children under 18 from low-income families in Makati City.", requirements: ["Valid Government-Issued ID of Parent/Guardian", "Birth Certificate of Child", "Medical Certificate", "Proof of Residency"], maxAmount: 8000, isActive: true },
  { name: "Senior Citizen Social Pension", category: "SENIOR_CITIZEN" as const, description: "Monthly financial assistance and social welfare support for senior citizens aged 60 and above residing in Makati City.", requirements: ["Senior Citizen ID", "Valid Government-Issued ID", "Proof of Residency (Barangay Certificate)", "Birth Certificate", "2x2 ID photo"], maxAmount: 500, isActive: true },
  { name: "Senior Citizen Health Program", category: "SENIOR_CITIZEN" as const, description: "Free medical check-ups, laboratory tests, and medicine subsidies for Makati senior citizens.", requirements: ["Senior Citizen ID", "Valid Government-Issued ID", "Proof of Residency"], maxAmount: 3000, isActive: true },
  { name: "Senior Citizen Livelihood Support", category: "SENIOR_CITIZEN" as const, description: "Skills training and small business starter kits for active senior citizens who wish to remain productive.", requirements: ["Senior Citizen ID", "Valid Government-Issued ID", "Proof of Residency", "Application Letter"], maxAmount: 5000, isActive: true },
  { name: "PWD Assistance Program", category: "PWD_ASSISTANCE" as const, description: "Financial aid, assistive devices, and livelihood support for Persons with Disabilities registered in Makati City.", requirements: ["PWD ID", "Medical Certificate from licensed physician", "Valid Government-Issued ID", "Proof of Residency", "Disability documentation"], maxAmount: 5000, isActive: true },
  { name: "PWD Assistive Device Program", category: "PWD_ASSISTANCE" as const, description: "Provision of wheelchairs, hearing aids, crutches, and other assistive devices for qualified PWDs in Makati.", requirements: ["PWD ID", "Medical Prescription for Device", "Valid Government-Issued ID", "Proof of Residency"], maxAmount: 10000, isActive: true },
  { name: "PWD Skills Development", category: "PWD_ASSISTANCE" as const, description: "Free vocational and technical training programs for persons with disabilities in Makati City.", requirements: ["PWD ID", "Valid Government-Issued ID", "Proof of Residency", "Application Letter"], maxAmount: null, isActive: true },
  { name: "PWD Transportation Voucher", category: "PWD_ASSISTANCE" as const, description: "Monthly transportation vouchers for PWDs needing to travel for medical consultations and therapy.", requirements: ["PWD ID", "Medical Certificate", "Valid Government-Issued ID", "Proof of Residency"], maxAmount: 500, isActive: true },
];

const ANNOUNCEMENTS = [
  { title: "MSWD Makati Online Services Now Available", content: "Makati City MSWD is pleased to announce the launch of the MISP online portal for faster processing of social services. Residents may now apply for assistance programs online." },
  { title: "Medical Assistance Applications Open", content: "The MSWD Makati is now accepting applications for medical assistance. Apply online through the portal or visit the MSWD office at the Makati City Hall." },
  { title: "Senior Citizen Social Pension Distribution", content: "The quarterly social pension for senior citizens will be distributed starting next week at designated barangay halls. Please bring your Senior Citizen ID." },
  { title: "PWD Registration Drive 2024", content: "All Persons with Disabilities in Makati City are encouraged to register or update their PWD ID at the MSWD office. Registration is free." },
  { title: "Livelihood Program Enrollment Open", content: "Enrollment for the 2024 Makati Livelihood Program is now open. Limited slots are available. Apply early through the online portal." },
  { title: "Holiday Schedule Notice", content: "The MSWD Makati office will be closed on November 1-2 in observance of All Saints and All Souls Day. Online applications will still be accepted." },
  { title: "Home Visit Schedule for Applicants", content: "Applicants for the Emergency Financial Assistance program may expect home visits from MSWD social workers starting this month. Please ensure someone is home." },
  { title: "New Program: Housing Repair Assistance", content: "The MSWD Makati is launching a new Housing Repair Assistance Program for qualified low-income homeowners. Apply through the MISP portal." },
  { title: "Mental Health Awareness Month", content: "In celebration of Mental Health Awareness Month, MSWD Makati offers free counseling sessions. Contact the office to schedule an appointment." },
  { title: "Educational Assistance Applications Now Open", content: "Low-income families in Makati may now apply for educational financial assistance for the upcoming school year. Required documents include enrollment certificate and report card." },
];

// Emails to preserve — real accounts that should never be deleted
const PROTECTED_EMAILS = [
  "rsuarez.a12345334@umak.edu.ph",
  "ronvinz321@gmail.com",
  "markangelo.dapalla@gmail.com",
  "brgy.poblacion@makati.gov.ph",
];

async function main() {
  console.log("Starting MISP database seed...\n");

  // Clear existing data but preserve real accounts
  console.log("Clearing existing data (preserving real accounts)...");
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.idIssuance.deleteMany();
  await prisma.document.deleteMany();
  await prisma.application.deleteMany();
  await prisma.benefitProgram.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.residencyVerification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.user.deleteMany({
    where: { email: { notIn: PROTECTED_EMAILS } },
  });
  console.log("Cleared.\n");

  // 1. Benefit Programs (21)
  console.log("Seeding benefit programs...");
  const programs = [];
  for (const p of PROGRAMS) {
    const program = await prisma.benefitProgram.create({ data: p });
    programs.push(program);
  }
  console.log(`  ${programs.length} benefit programs created\n`);

  // 2. Super Admin (1)
  console.log("Creating users...");
  const superAdmin = await prisma.user.create({
    data: {
      supabaseId: randomUUID(),
      email: "superadmin@mswd.makati.gov.ph",
      firstName: "Ricardo",
      lastName: "Dela Cruz",
      role: "SUPER_ADMIN",
      barangay: "Poblacion",
      city: "Makati City",
      residencyVerified: true,
      consentGiven: true,
      consentDate: new Date("2024-01-01"),
    },
  });
  console.log(`  Super Admin: ${superAdmin.firstName} ${superAdmin.lastName}`);

  // 3. Staff — ADMIN role (5)
  const staffData = [
    { firstName: "Maria", lastName: "Santos", email: "msantos@mswd.makati.gov.ph" },
    { firstName: "Jose", lastName: "Reyes", email: "jreyes@mswd.makati.gov.ph" },
    { firstName: "Ana", lastName: "Garcia", email: "agarcia@mswd.makati.gov.ph" },
    { firstName: "Carlo", lastName: "Mendoza", email: "cmendoza@mswd.makati.gov.ph" },
    { firstName: "Rosa", lastName: "Flores", email: "rflores@mswd.makati.gov.ph" },
  ];
  const staffUsers = [];
  for (const s of staffData) {
    const staff = await prisma.user.create({
      data: {
        supabaseId: randomUUID(),
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        role: "ADMIN",
        barangay: pick(barangays),
        city: "Makati City",
        residencyVerified: true,
        consentGiven: true,
        consentDate: new Date("2024-01-01"),
      },
    });
    staffUsers.push(staff);
    console.log(`  Staff: ${staff.firstName} ${staff.lastName}`);
  }

  // 4. Clients — REGISTERED_USER (20)
  const clients = [];
  for (let i = 0; i < 20; i++) {
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const barangay = pick(barangays);
    const client = await prisma.user.create({
      data: {
        supabaseId: randomUUID(),
        email: `${firstName.toLowerCase()}${lastName.toLowerCase().replace(/\s/g, "")}${i + 1}@gmail.com`,
        firstName,
        lastName,
        role: "REGISTERED_USER",
        contactNumber: `09${randomInt(100000000, 999999999)}`,
        houseNo: `${randomInt(1, 999)}`,
        street: pick(streets),
        barangay,
        city: "Makati City",
        zipCode: "1200",
        latitude: 14.55 + Math.random() * 0.05,
        longitude: 121.01 + Math.random() * 0.05,
        residencyVerified: i < 14,
        consentGiven: true,
        consentDate: new Date(2024, randomInt(0, 11), randomInt(1, 28)),
      },
    });
    clients.push(client);
    console.log(`  Client: ${client.firstName} ${client.lastName}`);
  }
  console.log();

  // 5. Applications / Transactions (100)
  console.log("Creating applications (transactions)...");
  const statuses: ApplicationStatus[] = [
    ...Array(20).fill("PENDING"),
    ...Array(20).fill("UNDER_REVIEW"),
    ...Array(25).fill("APPROVED"),
    ...Array(15).fill("REJECTED"),
    ...Array(20).fill("DISBURSED"),
  ] as ApplicationStatus[];

  const voterStatuses: VoterStatus[] = ["ACTIVE", "INACTIVE", "UNKNOWN"];

  const applications = [];
  for (let i = 0; i < 100; i++) {
    const client = pick(clients);
    const program = pick(programs);
    const status = statuses[i];
    const staffUser = pick(staffUsers);
    const createdAt = new Date(2024, randomInt(0, 11), randomInt(1, 28));
    const reviewedAt = new Date(createdAt.getTime() + 86400000 * randomInt(1, 5));
    const approvedAt = new Date(createdAt.getTime() + 86400000 * randomInt(3, 10));
    const disbursedAt = new Date(createdAt.getTime() + 86400000 * randomInt(10, 20));

    const app = await prisma.application.create({
      data: {
        userId: client.id,
        benefitProgramId: program.id,
        status,
        applicantName: `${client.firstName} ${client.lastName}`,
        applicantContact: client.contactNumber ?? `09${randomInt(100000000, 999999999)}`,
        applicantBarangay: client.barangay,
        applicantAddress: `${client.houseNo ?? ""} ${client.street ?? ""}, ${client.barangay}, Makati City`,
        purpose: `Requesting assistance under ${program.name} due to financial hardship and inability to meet basic needs.`,
        amountRequested: program.maxAmount ? randomInt(1000, program.maxAmount) : null,
        amountApproved: (status === "APPROVED" || status === "DISBURSED") && program.maxAmount ? randomInt(1000, program.maxAmount) : null,
        voterStatus: pick(voterStatuses),
        reviewedBy: status !== "PENDING" ? staffUser.id : null,
        reviewedAt: status !== "PENDING" ? reviewedAt : null,
        approvedAt: status === "APPROVED" || status === "DISBURSED" ? approvedAt : null,
        disbursedAt: status === "DISBURSED" ? disbursedAt : null,
        createdAt,
      },
    });
    applications.push(app);
  }
  console.log(`  ${applications.length} applications created\n`);

  // 6. Status History / Audit Logs
  console.log("Creating audit log entries...");
  let historyCount = 0;
  for (const app of applications) {
    const staffUser = pick(staffUsers);
    const base = app.createdAt ?? new Date();

    // Every app starts as PENDING (initial submission)
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: app.id,
        fromStatus: null,
        toStatus: "PENDING",
        changedBy: app.userId,
        remarks: "Application submitted by resident.",
        changedAt: new Date(base.getTime()),
      },
    });
    historyCount++;

    if (app.status === "UNDER_REVIEW" || app.status === "APPROVED" || app.status === "REJECTED" || app.status === "DISBURSED") {
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: app.id,
          fromStatus: "PENDING",
          toStatus: "UNDER_REVIEW",
          changedBy: staffUser.id,
          remarks: "Documents reviewed. Proceeding to evaluation.",
          changedAt: new Date(base.getTime() + 86400000 * randomInt(1, 3)),
        },
      });
      historyCount++;
    }

    if (app.status === "APPROVED" || app.status === "DISBURSED") {
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: app.id,
          fromStatus: "UNDER_REVIEW",
          toStatus: "APPROVED",
          changedBy: staffUser.id,
          remarks: "Application approved after evaluation and home visit.",
          changedAt: new Date(base.getTime() + 86400000 * randomInt(4, 7)),
        },
      });
      historyCount++;
    }

    if (app.status === "REJECTED") {
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: app.id,
          fromStatus: "UNDER_REVIEW",
          toStatus: "REJECTED",
          changedBy: staffUser.id,
          remarks: "Application rejected: incomplete requirements or ineligible.",
          changedAt: new Date(base.getTime() + 86400000 * randomInt(4, 7)),
          rejectionCode: "INCOMPLETE_DOCS",
        },
      });
      historyCount++;
    }

    if (app.status === "DISBURSED") {
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: app.id,
          fromStatus: "APPROVED",
          toStatus: "DISBURSED",
          changedBy: superAdmin.id,
          remarks: "Assistance disbursed via cash at MSWD office.",
          changedAt: new Date(base.getTime() + 86400000 * randomInt(10, 20)),
        },
      });
      historyCount++;
    }
  }
  console.log(`  ${historyCount} audit log entries created\n`);

  // 7. Announcements (10)
  console.log("Creating announcements...");
  const announcements = [];
  for (const a of ANNOUNCEMENTS) {
    const announcement = await prisma.announcement.create({
      data: {
        title: a.title,
        content: a.content,
        isPublished: true,
        publishedAt: new Date(2024, randomInt(0, 11), randomInt(1, 28)),
        createdBy: superAdmin.id,
      },
    });
    announcements.push(announcement);
  }
  console.log(`  ${announcements.length} announcements created\n`);

  const total = programs.length + 1 + staffUsers.length + clients.length + applications.length + historyCount + announcements.length;
  console.log("─────────────────────────────────────────");
  console.log("Seed complete!");
  console.log(`  Benefit Programs  : ${programs.length}`);
  console.log(`  Super Admin       : 1`);
  console.log(`  Staff (Admin)     : ${staffUsers.length}`);
  console.log(`  Clients           : ${clients.length}`);
  console.log(`  Applications      : ${applications.length}`);
  console.log(`  Audit Log Entries : ${historyCount}`);
  console.log(`  Announcements     : ${announcements.length}`);
  console.log(`  ──────────────────────────`);
  console.log(`  TOTAL             : ${total} records`);
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
