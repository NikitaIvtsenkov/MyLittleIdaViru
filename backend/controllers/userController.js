import Users from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const Login = async (req, res) => {
    try {
        const user = await Users.findAll({
            where: {
                email: req.body.email,
            },
        });
        if (!user[0]) return res.status(404).json({ msg: 'email не найден' });

        const isValidPass = await bcrypt.compare(req.body.password, user[0].password);
        if (!isValidPass) return res.status(400).json({ msg: 'неверный пароль' });

        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
       
        // Устанавливаем срок действия токена на 8 часов
        const token = jwt.sign({ userId, name, email }, process.env.SECRET_KEY, {
            expiresIn: '8h', // Изменено с '30d' на '8h'
        });
        
        // Устанавливаем срок действия куки на 8 часов
        res.cookie('token', token, { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 }); // 8 часов в миллисекундах
        res.json({ userId, name, token });
    } catch (error) {
        res.status(404).json({ msg: 'email не найден' });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await Users.findAll({
            where: {
                id: req.userId,
            },
        });
        if (!user) { 
            return res.status(404).json({
                message: 'User not found'
            });
        }
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
      
        res.json({ userId, name, email });
    } catch (error) {
        return res.status(403).json({
            message: 'no access query'
        });
    }
};

export const Register = async (req, res) => {
    try {
        const { name, email, password, confPassword } = req.body;
        if (password !== confPassword) {
            return res.status(400).json({ msg: 'password and confirm pass do not match'});
        }
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        await Users.create({
            name: name,
            email: email,
            password: hashPassword,
           
        }).then((response) => {
                const userid = response.id;
                const token = jwt.sign({ id: userid }, process.env.SECRET_KEY, {
                    expiresIn:'30d',
                });
                res.json({ userid, token });
        });
    } catch (error) {
        console.log(error);
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'name', 'email'],
        });
        res.json(users);
    } catch (error) {
        console.log(error);
    }
};

export const updateUser = async (req, res) => {
    try {
        const { name, password } = req.body;

        const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
        if (!token) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decoded.userId;
        const email = decoded.email; // Извлекаем email из токена

        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        const updatedBody = { name, password: hashPassword, avatarUrl, email }; // Передаем email в объект updatedBody

        const [updated] = await Users.update(updatedBody, {
            where: {
                id: userId
            }
        });

        if (!updated) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newToken = jwt.sign({
            userId: userId,  
            name: name,
            email: email // Включаем email в новый токен
        }, process.env.SECRET_KEY, { expiresIn: '1h' });

        res.cookie('token', newToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ token: newToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Users.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};