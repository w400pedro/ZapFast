const { db } = require('../config/db-connection');
const { GroupUser, Group, GroupDAO } = require('../models/group-models');
const { UserDAO } = require('../models/user-models');

class GroupController {

    async ShowGroups(req, res) {
        const usuariologado = req.session.user;
        if (usuariologado) {
               let { page } = req.query;
                if (!page) { page = 1 }
                const limit = 5;
                const offset = limit * (page - 1);
               const select = [limit, offset]   
               const result = await GroupDAO.AllGroups(select);
               const consulta = await db.query('SELECT count(*) as total from grupo');
               const total = consulta.rows[0].total;
            res.render('grupos', { membros: result, total, page })
        } else {
            res.redirect('/')
        }
    } 

    async RegisterGroup(req, res) {
        const usuariologado = req.session.user;
        if (usuariologado) {
            const dono = req.session.user.id;
            const nome = req.body.nome;

            const grupoEncontrado = await GroupDAO.GroupValidation(nome);
            if (grupoEncontrado) return res.send('Grupo ja existente');

            const group = new Group(null, nome, dono)
            await GroupDAO.GroupRegister(group);
            res.redirect('/group');
        } else {
            res.redirect('/')
        }
    }

    async ExitGroup(req, res) {
        const usuariologado = req.session.user
        if (usuariologado) {
            const usuario = req.session.user.id;
            const grupo = req.params.id;
            const groupuser = new GroupUser(usuario, grupo, null);
            await GroupDAO.GroupExit(groupuser);
            res.redirect('/')
        } else {
            res.redirect('/')
        }
    }

    async ShowGroupMembers(req, res) {
        const usuariologado = req.session.user;
        if (usuariologado) {
            const usuario = req.session.user.id;
            const grupoparams = req.params.grupo;
            const grupouser = new GroupUser(usuario, grupoparams, null);
            const verifica = await GroupDAO.GrupoUserValidation(grupouser);
            if (verifica) {
                const rolev = [usuario, grupoparams];
                const usuarioEncontrado = await GroupDAO.GroupUsers(grupoparams);
                const grupo = await GroupDAO.SearchGroup(grupoparams, null, null);
                const role = await UserDAO.CatchRole(rolev);
                res.render('grupo-membros', { membros: usuarioEncontrado, usercargo: role.tipo, grupo: grupo, logado: usuariologado });
            } else {
                res.redirect('/');
            }
        } else return res.redirect('/')
    }

    async RemoveGroup(req, res) {
        const usuariologado = req.session.user;
        const usuariol = req.session.user.id
        const grupo = req.params.grupo;
        const usuario = req.params.usuario;
        const rolev = [usuariol, grupo];
        const role = await UserDAO.CatchRole(rolev);
        if (usuariologado && role.tipo == 3) {
            const group = new GroupUser(usuario, grupo, null);
            await GroupDAO.GroupExit(group)
            res.redirect('/group/' + grupo + '/members')
        } else {
            res.redirect('/')
        }
    }

    async AddUser(req, res) {
        const usuariologado = req.session.user;
        if (usuariologado) {
            const usuariol = req.session.user.id
            const grupo2 = req.params.group;
            const email = req.body.email;
            const tipo = req.body.tipouser
            const rolev = [usuariol, grupo2];
            const role = await UserDAO.CatchRole(rolev);
            if (role.tipo == 3) {
                const usuarioe = await UserDAO.UserValidation(email);
                const grupo = await GroupDAO.SearchGroup(grupo2, null, null);
                const usuarioEncontrado = await GroupDAO.GroupUsers(grupo2);
                if (usuarioe) {
                    const usuario = usuarioe.id
                    const grupouser = new GroupUser(usuario, grupo2, null);
                    const verifica = await GroupDAO.GrupoUserValidation(grupouser);
                    if (!verifica) {
                        const groupuser = new GroupUser(usuario, grupo2, tipo);
                        await GroupDAO.GroupEnter(groupuser);
                        const msg = "Usuário Adicionado com sucesso";
                        res.render('grupo-membros', { membros: usuarioEncontrado, usercargo: role.tipo, grupo: grupo, logado: usuariologado, msg: msg });
                    } else {
                        const msg = "Esse usuário ja está no grupo."
                        res.render('grupo-membros', { membros: usuarioEncontrado, usercargo: role.tipo, grupo: grupo, logado: usuariologado, msg: msg });
                    }
                } else {
                    const msg = "Esse usuário não existe."
                    res.render('grupo-membros', { membros: usuarioEncontrado, usercargo: role.tipo, grupo: grupo, logado: usuariologado, msg: msg });
                }
            } else {
                res.redirect('/')
            }
        } else res.redirect('/')
    }

    async DeleteGroup(req, res) {
        const usuariologado = req.session.user;
        if (usuariologado) {
            const usuariol = req.session.user.id
            const grupo = req.params.id;
            const rolev = [usuariol, grupo];
            const role = await UserDAO.CatchRole(rolev);
            if (role.tipo == 3) {
                const grupousuario = new GroupUser(null, grupo, null);
                await GroupDAO.GroupClear(grupousuario);
                const group = new Group(grupo, null, null)
                await GroupDAO.GroupDelete(group);
                res.redirect('/');
            } else res.redirect('/')
        } else res.redirect('/')
    }

    async EnviarTexto(req, res) {
        const usuariomsg = req.session.user.id;
        const grupomsg = req.session.grupo;
        const msg = req.body.mensagem;
        const rolev = [usuariomsg, grupomsg];
        const role = await UserDAO.CatchRole(rolev);
        if (role.tipo != 1) {
        if(msg.length >= 1){
            await GroupDAO.SendMessage(usuariomsg, grupomsg, msg)
        }
    }
        res.redirect('/user/' + grupomsg + '')

    }

}
module.exports = { GroupController };