/* Inlines styles.css and src/*.js into a single self-contained page.
   Usage: node tools/bundle.mjs  ->  dist/protobuzz.html */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const html = read("index.html");
const css = read("styles.css");
const js = [read("src/data.js"), read("src/app.js")].join("\n");

/* Keep only the page content: the artifact host supplies doctype/head/body. */
const body = html
  .replace(/[\s\S]*?<body[^>]*>/i, "")
  .replace(/<\/body>[\s\S]*/i, "")
  .replace(/\s*<script src="[^"]+"><\/script>/g, "");

const fonts = (html.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/) || [""])[0];

const out = [
  "<title>ProtoBuzz</title>",
  fonts,
  "<style>\n" + css + "\n</style>",
  body.trim(),
  "<script>\n" + js + "\n</script>",
  ""
].join("\n");

mkdirSync(join(root, "dist"), { recursive: true });
writeFileSync(join(root, "dist", "protobuzz.html"), out);
console.log("dist/protobuzz.html  " + (out.length / 1024).toFixed(1) + " KB");
