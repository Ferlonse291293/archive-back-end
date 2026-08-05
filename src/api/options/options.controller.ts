import type { Request, Response } from 'express';
import {optionsService} from './options.service.js';

export const options = async (req: Request, res: Response) => {
    const result = await optionsService(req.body);

    if (!result) {
        return res.status(400).json({
            message: 'not options for target user'
        });
    }
    res.status(200).json(result);
}

