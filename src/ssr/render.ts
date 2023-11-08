// import * as nunjucks from "nunjucks";
// import nunjucks from "nunjucks";
import { pathToRegexp } from "path-to-regexp";
import { testHandler } from "./handlers/test-handler";
import { indexHandler } from "./handlers/index-handler";

// Add more routes as needed
const routes = [
  { path: "/foo/:name", handler: testHandler },
  { path: "/", handler: indexHandler },
];

function middleware1(_params) {
  // console.log('Middleware 1');
}

const middlewares = [middleware1];

export interface Response {
  head: Head,
  content: string,
}

interface Head {
  statusCode: number;
  statusMessage?: string;
  headers?: Record<string, string | string[]>;
}

export const Render = (url: string): Response => {

  const params = {};
  if (url.includes("?")) {
    params["query"] = {};
    let [tempUrl, urlParams] = url.split("?");
    url = tempUrl;
    let paramPair = new URLSearchParams(urlParams);
    paramPair.forEach((v, k) => {
      params["query"][k] = v;
    });
  }
  // if not path is matched return 404
  let res = {
    head: {statusCode: 404},
    content: `
       <!DOCTYPE html>
       <html lang="en">
       <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>404 - Page Not Found</title>
       </head>
       <body>
           <div class="container">
               <h1>404 - Page Not Found</h1>
               <p>The page you are looking for does not exist.</p>
               <p><a href="/">Go back to the homepage</a></p>
           </div>
       </body>
       </html>`
  }
  for (const route of routes) {
    const keys = [];
    const pattern = pathToRegexp(route.path, keys);
    const match = pattern.exec(url);
    console.log('match', match)
    console.log('keys', keys)
    if (match) {
      keys.forEach((key, index) => {
        params[key.name] = match[index + 1];
      });

  console.log('params', params)
      middlewares.forEach(middleware => middleware(params));
      res = route.handler(params);
      break;
    }
  }

  return res;
};

export default Render;
