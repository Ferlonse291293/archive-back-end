import fs from 'fs';
import jwt from 'jsonwebtoken';
const users = JSON.parse(fs.readFileSync('./src/db/clients.json', 'utf-8'));
const JWT_SECRET = 'supersecret';
const REFRESH_SECRET = 'refreshsecret';
export const loginService = async ({ username, password }) => {
    const user = users.find((u) => u.username === username &&
        u.password === password);
    if (!user)
        return null;
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
    return {
        token,
        refreshToken,
        csrfToken: crypto.randomUUID()
    };
};
export const refreshService = async (refreshToken) => {
    if (!refreshToken)
        return null;
    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const token = jwt.sign({ userId: payload.userId }, JWT_SECRET, { expiresIn: '15m' });
        return { token };
    }
    catch {
        return null;
    }
};
export const profileService = async (token) => {
    if (!token)
        return null;
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = users.find((u) => u.id === payload.userId);
        if (!user)
            return null;
        return {
            id: user.id,
            username: user.username
        };
    }
    catch {
        return null;
    }
};
//# sourceMappingURL=auth.service.js.map
