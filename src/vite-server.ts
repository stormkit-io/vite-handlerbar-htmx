import type { RenderFunction } from "./entry-server";
// import fs from "fs";
import path from "path";
import express from "express";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { matchPath } from "@stormkit/serverless/router";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  // use vite's connect instance as middleware
  // if you use your own express router (express.Router()), you should use router.use
  app.use(vite.middlewares);

  // Add support for a local environment API.
  app.all(/\/api(\/.*|$)/, async (req, res) => {
    const route = matchPath(
      path.join(__dirname, "api"),
      req.originalUrl.split(/\?|#/)[0].replace("/api", ""),
      req.method
    );

    if (!route) {
      res.status(404);
      res.send();
      return;
    }

    const handler = (await vite.ssrLoadModule(`/src/api/${route}`)) as {
      default: express.Handler;
    };

    handler.default(req, res, () => {});
  });

  app.get("*", async (req, res, next) => {
    try {
      const url: string = req.originalUrl.split(/\?#/)[0] || "/";

      // Load the server entry. vite.ssrLoadModule automatically transforms
      // your ESM source code to be usable in Node.js! There is no bundling
      // required, and provides efficient invalidation similar to HMR.
      const { render } = (await vite.ssrLoadModule("./src/entry-server")) as {
        render: RenderFunction;
      };

      const rendered = await render(url);
      const headers = Object.assign({}, rendered.head.headers, {
        "Content-Type": "text/html",
      })

      return res
        .status(rendered.head.statusCode)
        .set(headers)
        .send(rendered.content);
    } catch (e) {
      // If an error is caught, let Vite fix the stack trace so it maps back to
      // your actual source code.
      if (e instanceof Error) {
        vite.ssrFixStacktrace(e);
      }

      next(e);
    }
  });

  app.listen(5173, () => {
    console.log(`Server listening on http://localhost:5173`);
  });
}

(async () => {
    createServer();
})();
