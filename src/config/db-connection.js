const { Client } = require('pg');

const db = new Client({
    connectionString: 'postgres://qouacwddvkcntg:a47432f452bb58fee6dbfe4a10d5637d46ce08b2eb66540094f7842f84362226@ec2-3-218-171-44.compute-1.amazonaws.com:5432/dhm6n600rmhjj',
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect(err => {
    if (err) {
        console.log("Não foi possivel se conectar ao banco.");
        console.log( { err });
    } else {
        console.log("Banco conectado com sucesso.");
    }
});

module.exports = { db }