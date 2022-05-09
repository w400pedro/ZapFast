const { db } = require("../config/db-connection");

class Users {
    constructor(id, nome, nascimento, email, senha) {
        this.id = id;
        this.nome = nome;
        this.nascimento = nascimento;
        this.email = email;
        this.senha = senha;
    }
}

class UserDAO {

    static async UserValidation(email) {
        const sql = 'SELECT * FROM usuario where email = $1';
        const result = await db.query(sql, [email]);
        const usuario = result.rows[0];
        return usuario;
    }

    static async Register(user) {
        const sql = 'INSERT INTO public.usuario (nome, nascimento, email, senha) VALUES ($1, $2, $3, $4);';
        const uservalues = [user.nome, user.nascimento, user.email, user.senha];
        try {
            await db.query(sql, uservalues);
        } catch (error) {
            console.log('NAO FOI POSSIVEL CADASTRAR O USUÁRIO');
            console.log({ error });
        }
    }

        static async CatchRole(rolev){
        const roleoficial = [rolev[0], rolev[1]];
        const sql = 'SELECT tipo FROM grupousuario where usuario = $1 and grupo = $2';
        const result = await db.query(sql, roleoficial);
        const role = result.rows[0];
        return role;
     } 
}

module.exports = {
    Users,
    UserDAO
};