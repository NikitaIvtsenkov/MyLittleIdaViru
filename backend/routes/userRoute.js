import express from 'express';
import { Register, Login, getMe, getUsers, updateUser, getUserById } from '../controllers/userController.js';
import { registerValidation, loginValidation } from '../validations/validation.js';
import { handleValidationErrors } from '../validations/handleValidationErrors.js';
import { checkAuth } from '../validations/checkAuth.js';

const userrouter = express.Router();

// userrouter.post('/auth/register', registerValidation, handleValidationErrors, Register);

/**
 * @swagger
 * /users/auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Пользователи]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Успешный вход
 *       400:
 *         description: Ошибка входа (например, неверные данные)
 *       401:
 *         description: Неверный логин или пароль
 */
userrouter.post('/auth/login', loginValidation, handleValidationErrors, Login);
// userrouter.get('/auth/me', checkAuth, getMe);
// userrouter.get('/auth/allusers', checkAuth, getUsers);
// userrouter.put('/auth/updateuser', checkAuth, updateUser);
// userrouter.get('/auth/me/:id' , checkAuth, getUserById);


export default userrouter;