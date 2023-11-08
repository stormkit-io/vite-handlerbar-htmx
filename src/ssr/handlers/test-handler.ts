import path from "path";
import { Response } from "../render";
import fs from "fs";
import Handlebars from "handlebars";

export function testHandler(params): Response {
  const currentFile = import.meta.url;
  const page = params['query']['page'] * 1 || 1
  const words = generateRandomStrings(10)
  // return only partial html
  let contents = ''
  if (page > 1) {
    contents = `
      {{#each words}}
        {{#if @last}}
        <tr hx-get="/foo/contacts/?page={{../nextPage}}" hx-trigger="revealed" hx-swap="afterend">
          <td> *** {{this}} *** {{../nextPage}}  </td>
        </tr>
        {{else}}
          <tr> <td> {{this}}  </td> </tr>
        {{/if}}
      {{/each}}
    `
  } else {
   const fileUrl = path.join(path.dirname(currentFile), "views", "test.html");
   contents = fs.readFileSync(fileUrl.replace("file:", ""), "utf8");
  }

  const template = Handlebars.compile(contents);
  const body = template({words: words, nextPage: page + 1 });

  return {
    head: { statusCode: 200 },
    content: body,
  };
}

function generateRandomString(length = 10) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

function generateRandomStrings(numStrings) {
  const strings = [];

  for (let i = 0; i < numStrings; i++) {
    const newString = generateRandomString(10);
    strings.push(newString);
  }

  return strings;
}
