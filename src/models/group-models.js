const { db } = require("../config/db-connection");

class GroupUser {
    constructor(usuario, grupo, tipo) {
        this.usuario = usuario;
        this.grupo = grupo;
        this.tipo = tipo;
    }
}

class Group {
    constructor(id, nome, dono) {
        this.id = id;
        this.nome = nome;
        this.dono = dono;
    }
}

class GroupDAO {
    static async GroupEnter(groupuser){        
        const groupvalues = [groupuser.usuario, groupuser.grupo, groupuser.tipo];     
         const sql = 'INSERT INTO public.grupousuario (usuario, grupo, tipo) VALUES ($1, $2, $3);';
        try {
            await db.query(sql, groupvalues);
        } catch (error) {
            console.log('NAO FOI POSSIVEL ENTRAR NO GRUPO');
            console.log({ error });
        }
    }

    static async SearchGroup(grupomembros){
       const sql = 'SELECT * from grupo where id = $1'
       const result = await db.query(sql, [grupomembros]);
        const grupo = result.rows[0];
        return grupo;

    }

    static async GroupValidation(nome) {
        const sql = 'SELECT * FROM grupo where nome = $1';
        const result = await db.query(sql, [nome]);
        const verificagrupo = result.rows[0];
        return verificagrupo;
    }

   static async GroupSelect(usuario){
        const sql = 'SELECT id, nome FROM grupo LEFT JOIN grupousuario ON grupo.id = grupousuario.grupo WHERE grupousuario.usuario = $1 GROUP BY grupo.id;';
        const result = await db.query(sql, [usuario]); 
        const useringroup = result.rows;
        return useringroup;
    }

    static async AllGroups(select){
        const selectv = [select[0], select[1]];
         const sql = 'SELECT id, nome, COUNT(grupousuario.grupo) AS participantes FROM grupo LEFT JOIN grupousuario ON grupo.id = grupousuario.grupo GROUP BY grupo.id ORDER BY participantes DESC LIMIT $1 OFFSET $2;';
         const result = await db.query(sql, selectv); 
         const useringroup = result.rows;
         return useringroup;
     }

    static async GrupoUserValidation(grupouser){
        const verificagrupousuario = [grupouser.usuario, grupouser.grupo];
        const sql = 'select * from grupousuario where usuario = $1 and grupo = $2'
        const result = await db.query(sql, verificagrupousuario);
        const existe = result.rows[0];
        return existe;
    }

    static async GroupRegister(group){
        const grupov = [group.nome, group.dono];
        const sql = 'INSERT INTO public.grupo (nome, dono) VALUES ($1, $2);'
        try{
            await db.query(sql, grupov);
            const tipo = 3;
            const select = 'SELECT id FROM grupo where nome = $1'
           const selectID = await db.query(select, [group.nome]);
           const grupo = selectID.rows[0].id
           const usuario = group.dono
           const groupuser = new GroupUser(usuario, grupo, tipo);
           await GroupDAO.GroupEnter(groupuser);    
        }catch(error){
            console.log('NÃO FOI POSSIVEL CRIAR O GRUPO');
            return console.log({ error });
        }

    }

    static async GroupExit(group) {
        const grupouser = [group.usuario, group.grupo];
        const sql = 'delete from grupousuario where usuario = $1 and grupo = $2';
        try{
            await db.query(sql, grupouser);
        }catch(error){
            console.log('NÃO FOI POSSIVEL SAIR DO GRUPO');
            return console.log({ error });
        }
    }

    static async GroupUsers(group){
        const sql = "select usuario.id, nome, email, tipos.cargo as tipon from usuario join grupousuario on usuario.id = grupousuario.usuario join tipos on tipos.id  = grupousuario.tipo where grupo = $1";
        try{
            const result = await db.query(sql, [group]);
            const usuarios = result.rows;
            return usuarios;
        }catch(error){
            console.log('NÃO FOI POSSIVEL ACHAR OS MEMBROS');
            return console.log({ error });
        }

    }

    static async GroupMensagem(selectv){
        const select = [selectv[0], selectv[1], selectv[2]]
        const sqlchat = "select * from mensagem join usuario on usuario.id = mensagem.usuario where grupo = $1 ORDER BY datamsg desc LIMIT $2 OFFSET $3";
        const allsql = "select count(*) as msgs from mensagem join usuario on usuario.id = mensagem.usuario where grupo = $1";
        const resultchat = await db.query(sqlchat, select);
        const resultall = await db.query (allsql, [selectv[0]]);
        const chat = resultchat.rows;
        const allchat = resultall.rows[0].msgs;
        const returnv = [chat, allchat];
        return returnv;
    } 

    static async DeleteUser(groupuser){
        const apagar = [groupuser.usuarioparams, groupuser.grupoparams];
        const sql ='delete from mensagem where usuario = $1 and grupo = $2'
        try{
            await db.query(sql, apagar);
        }catch(error){
            console.log('Não foi possivel apagar o uusário');
           return console.log({error})
        }
    }

    static async UserAdd(add){
        let msg = '';
        const adicionar = [add.usuario, add.grupo, add.tipo]
        const sql = 'insert into grupousuario(usuario, grupo, tipo) values ($1, $2, $3)'
        try{
            await db.query(sql, adicionar);
        }catch(error){
                console.log('Não foi possivel adicionar o usuário no grupo');
                console.log({error})
            }
        }

        static async GroupDelete(group){
            const sql = 'delete from grupo where id = $1';
            const grupo = group.id
            try {
                await db.query(sql, [grupo]);
            } catch (error) {
                console.log('Não foi possivel deletar o grupo');
                console.log({error})
            }
        }

        static async GroupClear(grupousuario){
            const sql = 'delete from grupousuario where grupo = $1';
            const grupouser = grupousuario.grupo;        
            try {
                await db.query(sql, [grupouser]);
            } catch (error) {
                console.log('Não foi possivel excluir os usuários do grupo');
                console.log({error});
            }
        }

        static async SendMessage(user,grupo,msg){        
            const msgvalues = [user, grupo, msg];     
             const sql = 'INSERT INTO public.mensagem (usuario, grupo, texto) VALUES ($1, $2, $3);';
            try {
                await db.query(sql, msgvalues);
            } catch (error) {
                console.log('NAO FOI POSSIVEL ENVIAR A MENSAGEM');
                console.log({ error });
            }
        }

    }


module.exports = {
    GroupUser,
    Group,
    GroupDAO 
};