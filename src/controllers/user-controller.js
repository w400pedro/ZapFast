const { db } = require('../config/db-connection');
const { Users, UserDAO } = require('../models/user-models');
const { GroupDAO } = require('../models/group-models');

class UserController {

    async ShowUser(req, res) {

        const result = await db.query('SELECT * FROM usuario');
        return res.render('zap', { users: result.rows })
    }

    async UserRegister(req, res) {
        const { nome, nascimento, email, senha } = req.body;

        const usuarioEncontrado = await UserDAO.UserValidation(email);
        if (usuarioEncontrado) return res.send('Email ja existente <a href="/">Voltar</a>');
        const user = new Users(null, nome, nascimento, email, senha);
        await UserDAO.Register(user);
        return res.redirect('/login.html');
    }

    async UserLogout(req, res){
        const userLogado = req.session.user;
        if (userLogado) {
            req.session.user = ''
            console.log('Deslogado');
            res.redirect('/')
        } else {
            return res.send("Eii, você ainda não fez login. <br><a href='/'>Voltar</a>")
        }
    }

    async UserLogin(req, res) {

        const { email, senha } = req.body;
        const usuarioEncontrado = await UserDAO.UserValidation(email);

        if (!usuarioEncontrado) return res.send('Usuario não encontrado <a href="/">Voltar</a>');

        if (usuarioEncontrado.senha == senha) {
            req.session.user = usuarioEncontrado;
            console.log('Logado com Sucesso')
            return res.redirect('/');

        } else {
            return res.send('Senha Errada');
        } 

    }

    async ShowGroupsMain(req, res) {
        const usuariologado = req.session.user;
        if (usuariologado) {
            const usuario = req.session.user.id;
            const usuarionogrupo = await GroupDAO.GroupSelect(usuario);
            const result = await db.query('SELECT * from(SELECT grupo, texto, datamsg, ROW_NUMBER() OVER(PARTITION BY grupo ORDER BY ID DESC) rn FROM mensagem ORDER BY datamsg DESC)as UMesangem WHERE rn=1 ;');
            if (req.params.id) {
                let { page } = req.query;
                if (!page) { page = 1 }
                const limit = 10;
                const offset = limit * (page - 1);
                const grupomembros = req.params.id;
                req.session.grupo = grupomembros;
                const rolev = [usuario, grupomembros];
                const role = await UserDAO.CatchRole(rolev);
                const selectv = [grupomembros ,limit, offset];   
                const grupo = await GroupDAO.SearchGroup(grupomembros, null, null);
                const chat = await GroupDAO.GroupMensagem(selectv);
                const chatexibido = chat[0]; 
                const total = chat[1];
                res.render('chat', { grupos: usuarionogrupo, mensagem: result.rows, grupoclicado: grupo, chat: chatexibido, usuario: usuario, cargo: role.tipo, total, page })
            } else
                res.render('chat', { grupos: usuarionogrupo, mensagem: result.rows, grupoclicado: null, cargo: null })
        } else {
            res.redirect('/login.html')
        }
    }
}
module.exports = { UserController };