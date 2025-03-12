import { Hono } from 'hono'
import bcrypt from "bcrypt";
import { user_match, user_check } from '../utils/user.ts';
import { user, user_serializer } from '../types/user.ts';
import { get_access_token, get_refresh_token, verify_token } from '../utils/jwt.ts';
import { db_print_table, db_post_obj, db_get_number_obj, db_get_user, db_get_user_custom, db_delete_obj, db_put_obj } from '../utils/db_actions.ts';
import { client } from '../main.ts';

const app = new Hono()

//hash le mdp en db | transit pas crypte en clair ??
//user register policy -> password policy
//clean db functions by import client directly in the files

//app.post('/login', async (c) => {
//  const { email, password, remember } = await c.req.parseBody();
//  try {
//      const rememberMe = (remember as string) === 'on';
//      const user = await authService.login(email as string, password as string, rememberMe);
//      c.res.headers.append('Set-Cookie', `token=${authService.fakeToken}; HttpOnly; Secure; Path=/`);
//      c.res.headers.append('Set-Cookie', `userId=${user.id}; HttpOnly; Path=/`);
//      c.res.headers.append('Set-Cookie', `rememberMe=${rememberMe}; HttpOnly; Path=/`);

app.post('/login', async (c) => {
  const body = await c.req.json();

  console.log(body);
  const {user_found, user} = await user_match(body.username, body.email, body.password);
  if (user_found == 0) {
    const acces_token = await get_access_token(user);
    const refresh_token = await get_refresh_token(user);
    c.res.headers.append('Set-Cookie', `acces_token=${acces_token}; HttpOnly; Secure; Path=/`);
    c.res.headers.append('Set-Cookie', `refresh_token=${refresh_token}; HttpOnly; Secure; Path=/`);
    return c.json({ message: 'User logged in!'}, 200);
  }
  else if (user_found == 1) {
    return c.json({ message: "Email or password is incorrect"}, 401);
  }
    return c.json({ message: 'User not found!'}, 404);
});

app.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const bcrypt = require('bcrypt');
    const saltRounds = 12;
    const [ ret_check, mess ] = await user_check(body.username, body.email, body.password);

    if (!ret_check)
      return c.json({ "message": mess});
    const hash = bcrypt.hashSync(body.password, saltRounds);
    let user_test = new user(body.username, hash, body.email); 
    const ret_user = db_post_obj("user", user_test, client);
    if (ret_user == -1)
        return c.json({ message: 'User creation failed!'}, 500);
    const acces_token = await get_access_token(user);
    const refresh_token = await get_refresh_token(user);
    c.res.headers.append('Set-Cookie', `acces_token=${acces_token}; HttpOnly; Secure; Path=/`);
    c.res.headers.append('Set-Cookie', `refresh_token=${refresh_token}; HttpOnly; Secure; Path=/`);
    return c.json({ message: 'User created!'}, 200)
  }
  catch (error) {
    return c.json({ message: 'Backend error, please check logs'}, 403)
  }
  return c.json({ message: 'Backend error, please check logs'})
  });
  
app.put('/:id', async (c) => {
    const body = await c.req.json();
    const id = await c.req.param('id');
    const user_info = await db_get_user(id, client);
  
    if (user_info == -1)
        return c.json({ message: 'User not found!'}, 404);
  
    let user_test = new user(body.username, body.password, body.email);  
    const ret_user = db_put_obj("user", id, client, user_test);
    if (ret_user == -1)
        return c.json({ message: 'User update failed!'}, 500);
    return c.json({ message: 'User updated!'}, 200)
  });
  
app.get('/:id', async (c) => {
    const id = await c.req.param('id');
    let user_info = await db_get_user(id);
  
    if (user_info == -1)
        return c.json({ message: 'User not found!'}, 404);
    user_info = user_info.serialize();
    return c.json({message: "user found", user: user_info}, 200);
  });
  
app.delete('/:id', async (c) => {
    const id = await c.req.param('id');
    let user_info = await db_get_user(id);
  
    if (user_info == -1)
      return c.json({ message: 'User not found!'}, 404);
    user_info = await db_delete_obj("user", id, client);
    if (user_info == -1)
      return c.json({ message: 'User deletion failed!'}, 500);
    return c.json({ message: 'User Deleted'}, 200);
  });

export default app