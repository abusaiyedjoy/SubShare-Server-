import { createApp } from './app';

export default {
  fetch: (request: Request, env: any, ctx: any) => {
    const app = createApp();
    return app.fetch(request, env, ctx);
  },
};