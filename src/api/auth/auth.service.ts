import fs from 'fs';
import jwt from 'jsonwebtoken';
import {JWT_SECRET, REFRESH_SECRET} from "../../server.js";

const users = JSON.parse(
    fs.readFileSync('./src/db/users.json', 'utf-8')
);
const userPermissions = JSON.parse(
    fs.readFileSync('./src/db/userPermission.json', 'utf-8')
);


export const loginService = async ({
                                       email,
                                       password
                                   }: {
    email: string;
    password: string;
}) => {

    const user = users.find(
        (u: any) =>
            u.email === email &&
            u.password === password
    );

    if (!user) return null;

    const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return {
        token,
        refreshToken,
        csrfToken: crypto.randomUUID()
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
    const user = users.find((u: any) => u.id === userId);

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



