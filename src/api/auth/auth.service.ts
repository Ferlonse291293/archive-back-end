import fs from 'fs';
import {JWT_SECRET, REFRESH_SECRET} from "../../server.js";


import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const userPermissions = JSON.parse(
    fs.readFileSync('./src/db/userPermission.json', 'utf-8')
);
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {JWT_SECRET_EXPIRES_IN, REFRESH_SECRET_EXPIRES_IN} from "../../shared/const/token.js";

const adapter = new PrismaPg({
    connectionString: String(process.env.DATABASE_URL)
})

const prisma = new PrismaClient({ adapter });

export const loginService = async ({
                                       email,
                                       password,
                                   }: {
    email: string;
    password: string;
}) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) return null;

    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: JWT_SECRET_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_SECRET!,
        { expiresIn: REFRESH_SECRET_EXPIRES_IN }
    );

    return {
        token,
        refreshToken,
        csrfToken: crypto.randomUUID(),
    };
};
export const refreshService = async (
    refreshToken: string
) => {
    console.log('refreshToken exists:', !!refreshToken);

    if (!refreshToken) {
        return null;
    }

    try {
        const payload = jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET!
        ) as { userId: number };

        console.log('refresh payload:', payload);

        const token = jwt.sign(
            { userId: payload.userId },
            process.env.JWT_SECRET!,
            { expiresIn: JWT_SECRET_EXPIRES_IN }
        );

        return { token };

    } catch (error) {
        console.error('REFRESH VERIFY ERROR:', error);
        return null;
    }
};
export const profileService = async (userId: number) => {

    const user  = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) return null;

    return {
        user: {
            id: user.id.toString(),
            name: user.username,
            role: user.role,
        },
        permissions: userPermissions.permissions
    };
};



