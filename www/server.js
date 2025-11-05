import express from 'express';
import { testConnection, User, DiaryEntry, Emotion, SleepQuality } from './models/index.js';

const port = 5000;
const app = express()

app.use(express.json())

testConnection();

//регистрация
app.post('/sign-up', async (req,res) => {
    try{
        const { login, birth_date, email, password, gender } = req.body;

        if (!login || !email || !password) {
            return res.status(400).json({ error: 'заполните все поля' });
        }

        const user = await User.create({ login, birth_date, email, password_hash: password, gender });
        res.status(201).json({ success: true, user: { 
            id: user.id, 
            login: user.login, 
            email: user.email }  
        });
    }  catch (error) {
    res.status(400).json({ error: error.message });
  }
    
});

//вход
app.post('/log-in', async (req,res) => {
    try{
        const { email, password } = req.body;

        const user = await User.findOne({where: {email}});

        if (!user) {
            return res.status(401).json({ error: 'неверный email или пароль' });
        }

        if (user.password_hash !== password) {
            return res.status(401).json({ error: 'неверный email или пароль' });
        }

        res.json({ success: true, user: { id: user.id, login: user.login, email: user.email } });
    } catch (error) {
    res.status(500).json({ error: error.message });
  }  
});


app.listen(port, () => {console.log('web app on: http://localhost:%s', port)})
