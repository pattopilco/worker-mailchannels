import {Hono} from 'hono';
import emailSchema from './schema/email';
import Email from './class/email';
import {zValidator} from '@hono/zod-validator';
import {basicAuth} from 'hono/basic-auth';

type BindingsType = {
  BASIC_AUTH_USERNAME: string
  BASIC_AUTH_PASSWORD: string
  DKIM_PRIVATE_KEY: string
}

const app = new Hono<{ Bindings: BindingsType }>();
app.use('*', async (c, next) => {
  const auth = basicAuth({
    username: c.env.BASIC_AUTH_USERNAME,
    password: c.env.BASIC_AUTH_PASSWORD
  });
  return auth(c, next);
});
app.post('/api', zValidator('json', emailSchema), async (c) => {
  const email = await Email.send(c.req.valid('json'), c.env.DKIM_PRIVATE_KEY);
  if (!email) {
    return c.json({
      success: false,
      message: 'Internal Server Error'
    }, 500);
  }

  return c.json({
    success: true,
    message: 'OK'
  }, 200);
});

export default app;
