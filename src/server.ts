import app from './app.js';
import dotenv from 'dotenv';

const PORT = 3000;
dotenv.config();
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
export const JWT_SECRET = process.env.JWT_SECRET!;
export const REFRESH_SECRET = process.env.REFRESH_SECRET!;
