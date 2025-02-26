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