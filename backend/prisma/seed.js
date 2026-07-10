const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log("🚀 Starting database cleanup and synchronization...");

  try {
    // Clear dependent data in correct order to respect foreign key constraints
    await prisma.response.deleteMany({});
    await prisma.testAttempt.deleteMany({});
    await prisma.subtopicRating.deleteMany({});
    await prisma.selfAssessment.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("🧹 Previous data cleared.");

    // 1. Seed the Super Admin
    const superAdminHash = await bcrypt.hash("SuperAdmin@123!", SALT_ROUNDS);
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "superadmin@sceniuz.com",
        passwordHash: superAdminHash,
        role: "SUPER_ADMIN",
        department: "Management",
      },
    });
    console.log("✅ Super Admin created: superadmin@sceniuz.com / SuperAdmin@123!");

    // 2. Seed a test Admin (Team Lead)
    const adminHash = await bcrypt.hash("Admin@123!", SALT_ROUNDS);
    const testAdmin = await prisma.user.create({
      data: {
        name: "Test Admin",
        email: "admin@sceniuz.com",
        passwordHash: adminHash,
        role: "ADMIN",
        department: "DATA ANALYTICS",
      },
    });
    console.log("✅ Test Admin created: admin@sceniuz.com / Admin@123!");

    // 3. Seed a sample Employee (assigned to the test admin's team)
    const empHash = await bcrypt.hash("Employee@123!", SALT_ROUNDS);
    await prisma.user.create({
      data: {
        name: "Sample Employee",
        email: "employee@sceniuz.com",
        passwordHash: empHash,
        role: "EMPLOYEE",
        department: "DATA ANALYTICS",
        teamLead: testAdmin.name,
      },
    });
    console.log("✅ Sample Employee created: employee@sceniuz.com / Employee@123! (team: Test Admin)");

    console.log("\n🎉 Database seed complete. 'questions' table was left untouched.");
    console.log("\n📋 Seeded Credentials:");
    console.log("   Super Admin → superadmin@sceniuz.com  /  SuperAdmin@123!");
    console.log("   Admin       → admin@sceniuz.com        /  Admin@123!");
    console.log("   Employee    → employee@sceniuz.com     /  Employee@123!  (team: Test Admin)");

  } catch (error) {
    console.error("❌ Error during seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();