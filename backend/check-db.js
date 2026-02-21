const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const users = await prisma.user.findMany();
        console.log("USERS DB DUMP:");
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
check();
