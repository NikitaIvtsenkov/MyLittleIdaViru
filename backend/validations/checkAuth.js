import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const checkAuth = (req, res, next) => {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
    console.log("Received Token:", token);  // Отладка

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY); // Используем ключ из .env
            req.userId = decoded.userId;
            next();
        } catch (e) {
            console.error("JWT Error:", e.message);
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
    } else {
        return res.status(403).json({ message: 'No access token.' });
    }
};
