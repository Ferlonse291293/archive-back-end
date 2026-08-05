
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';


const adapter = new PrismaPg({
    connectionString: String(process.env.DATABASE_URL)
})
const prisma = new PrismaClient({ adapter });

export const optionsService = async (userId: number) => {

    const departments  = await prisma.department.findMany(
        { select: { name: true , code: true}  });
    if (!departments) return null;

    return {
        options: {
            departments: departments,
        },
    };
};



