import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import parser from "@babel/parser";
import _traverse from "@babel/traverse";

const traverse = _traverse.default;

const file = process.argv[2];
if (!file) {
  console.error("Usage: node extract-jsx-strings.mjs <path-to-tsx>");
  process.exit(1);
}

const src = readFileSync(file, "utf8");
const ast = parser.parse(src, {
  sourceType: "module",
  plugins: ["typescript", "jsx"],
});

const strings = new Set();

traverse(ast, {
  JSXText(path) {
    const t = path.node.value.replace(/\s+/g, " ").trim();
    if (t.length > 2) strings.add(t);
  },
  StringLiteral(path) {
    if (path.parent.type === "ImportDeclaration") return;
    if (path.parent.type === "ExportNamedDeclaration") return;
    const key = path.parent.key?.name;
    if (key === "icon" || key === "imagePath") return;
    const v = path.node.value;
    if (v.length > 15 && !v.startsWith("/") && !v.startsWith("#")) {
      strings.add(v);
    }
  },
  TemplateLiteral(path) {
    if (path.node.expressions.length === 0) {
      const v = path.node.quasis[0]?.value?.cooked;
      if (v && v.length > 15) strings.add(v);
    }
  },
});

const arr = [...strings].sort();
writeFileSync(
  join(import.meta.dirname, "extracted-strings.json"),
  JSON.stringify(arr, null, 2)
);
console.log("count", arr.length);
