import { Hono } from 'hono'
import { jwt, sign, verify } from 'hono/jwt'
import { user } from '../types/user.ts';
import { jwtSecret, client } from '../main.ts';
import { db_get_obj } from '../utils/db_actions.ts';
import type { JwtVariables } from 'hono/jwt';

function get_payload(id: number, username: string, time: number, type: string) {
    return ({"id": `${id}`, 
            "username": `${username}`,
            "type": `${type}`,
            "exp": `${Math.floor(Date.now() / 1000) + (60 * time)}`,
            "nbf": `${Math.floor(Date.now() / 1000)}`
        });
}

export async function get_refresh_token(user: user) {
    const token = await sign(get_payload(user.id, user.username, 10080, "refresh"), jwtSecret);
    return token
}

export async function get_access_token(user: user)//check verify refresh token
{
    const token = await sign(get_payload(user.id, user.username, 5, "acces"), jwtSecret);
    return token
}

export async function verify_token(token: string) {
    try {
        const payload = await verify(token, jwtSecret);
        console.log(payload);
        if (payload["type"] == "acces")
            return 1;
        else if (payload["type"] == "refresh")
            return 2;
    }
        catch (error) {
        return 0;
    }
    return payload;
      
}