import { User } from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

//регистрация
export const register = async (req,res) => {
    try{
        const { login, birth_date, email, password, gender } = req.body;

        if (!login || !email || !password) {
            return res.status(400).json({ error: 'заполните все поля' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ login, birth_date, email, password_hash: hashedPassword, gender });
        res.status(201).json({ success: true, 
            user: { 
            id: user.id, 
            login: user.login, 
            email: user.email }  
        });
    }  
    catch (error) {
        res.status(400).json({ error: error.message });
  }
    
};

//вход
export const login = async (req,res) => {
    try{
        const { login, password } = req.body;

        const user = await User.findOne({where: {login}});

        if (!user) {
            return res.status(401).json({ error: 'неверный логин или пароль' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'неверный логин или пароль' });
        }

        const token = jwt.sign({ id: user.id, login: user.login },
            process.env.TOKEN_SECRET, 
      { expiresIn: '24h' }
    );
        res.json({ success: true, token: token, user: { id: user.id, login: user.login, email: user.email } });
    } catch (error) {
    res.status(500).json({ error: error.message });
  }  
};