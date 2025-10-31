import express, { json } from 'express'
import { fakeDB } from './fakeDatabase.js';

const port = 5000;
const app = express()

app.use(express.json())

//регистрация
app.post('/sign-up', (req,res) => {
     const { login, birth_date, email, password, gender } = req.body;

     if (!login || !email || !password) {
        return res.status(400).json({ error: 'заполните все поля' });
     }

     const user = fakeDB.registerUser(login, birth_date, email, password, gender);
     res.status(201).json({ success: true, user });
});

app.post('/login', (req,res) => {
    const { email, password } = req.body;
    const user = fakeDB.loginUser(email, password);

    if (!user) {
        return res.status(401).json({ error: 'неверный email или пароль' });
    }

    res.json({ success: true, user });
})



app.listen(port, () => {console.log('web app on: http://localhost:%s', port)})
