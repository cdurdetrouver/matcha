import { connect } from 'ts-postgres';

export async function db_connect() {
    const client = await connect({
        "host": 'db',
        "port": 5432,
        "database": 'matcha',
        "user": 'postgresuser',
        "password": 'postgrespassword'});

    //const result = await client.query('');

    return client;
}

export async function db_obj_init(name, collums, contraints, client) {
    let query;
    let i = 0;

    query = `CREATE TABLE IF NOT EXISTS "${name}" (`;
    for (var y in collums) {
       
        query += `${y} `;
        if (contraints && i < contraints.length) {
            query += `${contraints[i]}`;
            if (y != Object.keys(collums)[Object.keys(collums).length - 1])
                query += ', ';
            i++;
        }
    }
    query += ');';
    console.log(query);
    const result = await client.query(query)
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error(`DB Error : init request of ${name} failed`);
    });
}

export async function db_print() {}

export async function db_print_table() {}
