import { connect } from 'ts-postgres';

export async function db_connect() {
    const client = await connect({
        "host": 'db',
        "port": 5432,
        "database": 'matcha',
        "user": 'postgresuser',
        "password": 'postgrespassword'});

    return client;
}

export async function db_obj_init(table, obj, contraints, client) {
    let query;
    let i = 0;

    query = `CREATE TABLE IF NOT EXISTS "${table}" (`;
    for (var y in obj) {
       
        query += `${y} `;
        if (contraints && i < contraints.length) {
            query += `${contraints[i]}`;
            if (y != Object.keys(obj)[Object.keys(obj).length - 1])
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
        console.error(`DB Error : init request of ${table} failed`);
    });
}

export async function db_print_table(client) {
    const query = 'SELECT *  FROM "user";';

    const result = await client.query(query)
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error(`DB Error : db print failed`);
    });
}

export async function db_export_obj(table, obj) {}
