import serverless from "@stormkit/serverless";
import { Response, Render } from "./ssr/render";

export type RenderFunction = (url: string) => Promise<Response>;

export const render: RenderFunction = async (url) => {
   return Render(url);
};

// This handler add support for Stormkit environment. This is
// the entry point of the serverless application.
export const handler = serverless(async (req: any, res: any) => {
  // We are in assets folder
  // const dir = path.dirname(fileURLToPath(import.meta.url));
  // const html = fs.readFileSync(path.join(dir, "./index.html"), "utf-8");

  const { content, head } = await Render(req.url?.split(/\?#/)[0] || "/");

  res.writeHead(
    head.statusCode || 200,
    head.statusMessage || "OK",
    Object.assign({}, head.headers, {
      "Content-Type": "text/html; charset=utf-8",
    })
  );
  res.end(content);
});
