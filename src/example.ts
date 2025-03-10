import { program } from "commander";
import commandir from "./lib";

program.description("example usage");

const root = __dirname + "/..";
commandir(program, root, {
  maxDepth: 2,
  exclude: ["scripts"],
  excludeFollow: ["node_modules", "dist"],
});

program.parse(process.argv);