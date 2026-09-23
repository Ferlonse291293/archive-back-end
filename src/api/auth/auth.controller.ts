import type { Request, Response } from 'express';
import {
    loginService,
    refreshService,
    profileService
} from './auth.service.js';

export const login = async (req: Request, res: Response) => {
    const result = await loginService(req.body);

    if (!result) {
        return res.status(401).json({
            message: 'Invalid credentials'
        });
    }

    res.cookie('token', result.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    });

    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    });

    res.json({
        csrfToken: result.csrfToken
    });
};

export const refresh = async (req: Request, res: Response) => {

    const result = await refreshService(req.cookies.refreshToken);
    console.log('refresh', result)
    if (!result) {
        return res.status(401).json({
            message: 'Invalid refresh token'
        });
    }

    res.cookie('token', result.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    });

    res.json({
        success: true
    });
};

export const profile = async (req: Request, res: Response) => {
    const result = await profileService(req.user.userId);
    if (!result) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(200).json(result);

};

export const logout =  async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
    });

    return res.status(200).json({ message: 'Logged out' });
};
