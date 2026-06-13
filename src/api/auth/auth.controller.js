import { loginService, refreshService, profileService } from './auth.service.js';
export const login = async (req, res) => {
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
export const refresh = async (req, res) => {
    const result = await refreshService(req.cookies.refreshToken);
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
export const profile = async (req, res) => {
    const result = await profileService(req.cookies.token);
    if (!result) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }
    res.json(result);
};
//# sourceMappingURL=auth.controller.js.map