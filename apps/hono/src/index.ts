import { Hono } from 'hono';

const app = new Hono()
  .get('/', (c) => { 
    return c.text('Hello world!')
  })
  .get('/health', (c) => {
    return c.json({ status: 'ok' });
  });

export type HonoAppType = typeof app;
export { app };

export default {
	port: 3000,
	fetch: app.fetch
};
