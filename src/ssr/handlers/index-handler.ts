import { Response } from "../render";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

export function indexHandler(_): Response {
  const currentFile = import.meta.url;
  const fileUrl = path.join(path.dirname(currentFile), "views", "index.html");
  // convert to path
  const contents = fs.readFileSync(fileUrl.replace("file:", ""), "utf8");
  const template = Handlebars.compile(contents);
  const body = template({});

  return {
    head: { statusCode: 200 },
    content: body,
  };
}
