import { program, Command } from "commander";
import commandir from "./lib";


program.description("example usage");

const root = __dirname + "/..";

program.command("commandir")
  .option("-r, --root <root>", "root")
  .option("-d, --depth <depth>", "max depth", parseInt)
  .option("-e, --exclude <exclude>", "exclude", (val) => val.split(","))
  .option("-f, --exclude-follow <exclude-follow>", "exclude follow", (val) => val.split(", "))
  .arguments("[args...]")
  .description("commandir")
  .action((args: string[], options: { root?: string, depth?: number, exclude?: string[], excludeFollow?: string[] }) => {
    const maxDepth = options.depth ?? 1;
    const exclude = options.exclude ?? [];
    const excludeFollow = options.excludeFollow ?? [];
    const cmd = new Command("commandir-cli");
    commandir(cmd, options.root || root, {
      maxDepth,
      exclude,
      excludeFollow,
    });
    cmd.parse(args);
  });

commandir(program, root, {
  maxDepth: 2,
  exclude: ["scripts"],
  excludeFollow: ["node_modules", "dist"],
});

program.parse(process.argv);