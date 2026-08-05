import fs from 'fs';
import {JWT_SECRET, REFRESH_SECRET} from "../../server.js";


import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const users = JSON.parse(
    fs.readFileSync('./src/db/users.json', 'utf-8')
);
const userPermissions = JSON.parse(
    fs.readFileSync('./src/db/userPermission.json', 'utf-8')
);
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

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
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_SECRET!,
        { expiresIn: "7d" }
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

    if (!refreshToken) return null;

    try {
        const payload = jwt.verify(
            refreshToken,
            REFRESH_SECRET
        ) as any;

        const token = jwt.sign(
            { userId: payload.userId },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        return { token };

    } catch {
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



