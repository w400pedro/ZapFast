const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './src/views');

app.use(express.urlencoded({
    extended: true,
}));

app.use(express.json());

const session = require('express-session');
app.use(session({
    secret: 'chave secreta de criptografia',
    resave: false, 
    saveUninitialized: false,
    cookie: { secure: false }
}))

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/user');
});

const usersRoutes = require('./routes/user-routes');
app.use('/user', usersRoutes);

const groupRoutes = require('./routes/group-routes');
app.use('/group', groupRoutes);

app.use('*', (req, res) => {
    return res.status(404).send(`
        <h1>Sorry, not found!!!</h1>
        <a href="/">VOLTAR</a>
    `);
})

const db = require('./config/db-connection');
console.log(db);

const PORT = process.env.PORT;
console.log({PORT});
app.listen(PORT || 8080, () => console.log(`Server iniciado na porta ${PORT}`));

