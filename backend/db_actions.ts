import { connect } from 'ts-postgres';
import { user } from './user.ts';

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
    const result = await client.query(query)
    .then(data => {
        return true;
    })	
    .catch((error) => {
        console.error(`DB Error : init request of ${table} failed`);
        return false;
    });
}

export async function db_init(client) {
    let user_init = new user;
    const contraints = ["VARCHAR(255) NOT NULL",  "VARCHAR(255) NOT NULL",  "VARCHAR(255) NOT NULL", "SERIAL PRIMARY KEY", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"];
    if (!db_obj_init("user", user_init, contraints, client))
        return false;
    db_print_table(client, "user");
    return true;
}

export async function db_print_table(client, table) {
    const query = `SELECT *  FROM "${table}";`;

    const result = await client.query(query)
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error(`DB Error : db print failed`);
    });
}

export async function db_get_number_obj(client, table) {
    const query = 'SELECT COUNT(*) FROM "user" WHERE id = NOT NULL;';

    const result = await client.query(query)
    .then(data => {
        const nb = parseInt(data['rows'][0][0]);
        return (nb);
    })
    .catch((error) => {
        console.error(`DB Error : can't find number of objects in ${table}`);
        return (-1);
    });
    return result;
}

export async function db_post_obj(table, obj, client) {
    let query;

    query = `INSERT INTO "${table}" (`;
    for (var y in obj) {
        query += `${y}`;
        if (y != Object.keys(obj)[Object.keys(obj).length - 3])
            query += ', ';
        else
            break;
    }
    query += ') VALUES (';
    for (var y in obj) {
        query += `'${obj[y]}'`;
        if (y != Object.keys(obj)[Object.keys(obj).length - 3])
            query += ', ';
        else
            break;
    }
    query += ');';

    const result = await client.query(query)
    .then(data => {
        return (1);
    })
    .catch((error) => {
        console.error(`DB Error : can't store in ${table}`);
        return (-1);
    });
    return result;
}

export async function db_put_obj(table, id, client, obj) {
    let query;

    query = `UPDATE "${table}" SET `;
    for (var y in obj) {
        query += `${y} = '${obj[y]}'`;
        if (y != Object.keys(obj)[Object.keys(obj).length - 3])
            query += ', ';
        else
            break;
    }
    query += ` WHERE "id" = ${id};`;

    const result = await client.query(query)
    .then(data => {
        return (1);
    })
    .catch((error) => {
        console.error(`DB Error : can't update ${id} in ${table}`);
        return (-1);
    });
    return result;
}

export async function db_delete_obj(table, id, client) {
    let query;

    query = `DELETE FROM "${table}" WHERE id = ${id};`;

    const result = await client.query(query)
    .then(data => {
        return 1
    })
    .catch((error) => {
        console.error(`DB Error : can't destroy in ${table}`);
        return (-1);
    });
    return result;
}

export async function db_get_obj(table, id, client) {
    const query = `SELECT *  FROM "${table}" WHERE id = ${id};`;

    const result = await client.query(query)
    .then(data => {
        return(data);
    })
    .catch((error) => {
        console.error(`DB Error : db get failed for ${id} in ${table}`);
        return (-1);
    });
    return db_parse_user(result);
}

export async function db_parse_user(response) {
    if (response == -1 || response['rows'].length == 0)
        return (-1);
    const rows = response['rows'][0];

    let user_get = new user(rows[0], rows[1], rows[2], rows[3], rows[4]);
    return user_get;
}
