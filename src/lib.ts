import { execSync } from "child_process";
import { Command } from "commander";
import fs from "fs";
import path from "path";

interface Options {
    // The maximum depth to traverse in the directory structure.
    maxDepth?: number;

    // Directories to exclude from the command structure.
    // e.g. I normally put sh files in scripts, so want
    //      foo/scripts/bar.sh to be `foo bar`
    exclude?: string[];

    // Directories to exclude from following into.
    excludeFollow?: string[];
}

/**
 * Adds commands to a Commander program based on the directory structure under the specified root.
 * 
 * Given a directory structure like:
 * 
 * <root>
 * ├── foo.txt
 * ├── run.sh
 * ├── scripts/
 * │   └── foo.sh
 * └── baz/
 *     ├── coo.sh
 *     ├── scripts/
 *     │   └── ddd.sh
 *     ├── eee.txt
 *     └── bat/
 *         ├── zoo.sh
 *         └── scripts/
 *             └── xxx.sh
 * 
 * This function will add the following commands to the program:
 * 
 * - run
 * - foo
 * - baz coo
 * - baz ddd
 * - baz bat zoo
 * - baz bat xxx
 * 
 * @param program - The Commander program to which commands will be added.
 * @param root - The root directory to scan for command scripts.
 * @param maxDepth - The maximum depth to traverse in the directory structure.
 * @param options - Options to control the behavior of the function.
 * @returns The updated Commander program with the added commands.
 */
const addToProgram = (program: Command, root: string, options?: Options) => {
    const maxDepth = options?.maxDepth ?? -1;
    const exclude = options?.exclude ?? [];
    const excludeFollow = options?.excludeFollow ?? [];

    const paths = [] as { dirPath: string[], action: string, relPath: string }[];

    const loop = (dir: string, depth: number, prefix: string[]) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const filePath = path.join(dir, file.name);
            if (file.isDirectory()) {
                if (maxDepth >= 0 && depth < maxDepth && !excludeFollow.includes(file.name)) {
                    loop(filePath, depth + 1, [...prefix, file.name]);
                }
            } else if (file.isFile()) {
                const ext = path.extname(file.name);
                if (ext === ".sh") {
                    const cmdName = path.basename(file.name, ext);
                    const commandPath = [...prefix, cmdName];
                    const dirPath = commandPath.slice(0, commandPath.length - 1).filter(dir => dir !== "scripts");
                    const action = commandPath[commandPath.length - 1];
                    const relPath = path.relative(root, filePath)
                    paths.push({ dirPath, action, relPath });
                }
            }
        }
    };

    loop(root, 0, []);

    const uniqueDirPaths = new Set<string>();
    paths.forEach((o) => {
        const { dirPath } = o;
        for (let i = 0; i <= dirPath.length; i++) {
            const dirs = dirPath.slice(0, i).filter(Boolean).filter(d => !exclude.includes(d));
            const key = dirs.join(":");
            uniqueDirPaths.add(key);
        }
    });
    const commandPathsToCommands = {} as Record<string, Command>;
    commandPathsToCommands[""] = program;
    Array.from(uniqueDirPaths).filter(Boolean).forEach((key) => {
        const parts = key.split(":");
        let par = program;
        for (let i = 0; i < parts.length; i++) {
            const key = parts.slice(0, i + 1).filter(d => !exclude.includes(d)).join(":");
            if (!commandPathsToCommands[key]) {
                const cmd = par.command(parts[i]);
                // Find all the commands that are children of this one
                const children = paths.filter((o) => {
                    const { dirPath } = o;
                    return dirPath.join(":").startsWith(key);
                });
                cmd.description("[" + children.length + " scripts]");
                commandPathsToCommands[key] = cmd;
            }
            par = commandPathsToCommands[key];
        }
    });

    paths.forEach((o) => {
        const { dirPath, action, relPath } = o;
        let actionName = action;
        const key = [...dirPath, actionName].join(":");
        let c = commandPathsToCommands[key];
        if (c) {
            actionName = path.basename(relPath);
        }
        const dirKey = dirPath.join(":");
        const par = commandPathsToCommands[dirKey];
        if (!par) {
            console.log(o);
            console.log("dirPath", dirPath);
            console.log("key", key);
            throw new Error("Command not found: " + dirKey);
        }
        const cmd = par.command(actionName)
            .option("-e, --echo", "Echo the command before running")
            .option("-n, --dry-run", "Just print the command")
            .arguments("[args...]")
            .description(relPath)
            .action((args: string[], options: { echo?: boolean, dryRun?: boolean }) => {
                const cmdArgs = (args || []).join(" ");
                const cmdLine = `${relPath} ${cmdArgs}`;
                if (options.echo) {
                    console.log(cmdLine);
                }
                if (options.dryRun) {
                    console.log(cmdLine);
                    return;
                }
                execSync(cmdLine, { stdio: 'inherit' });
            });
        const printConents = () => {
            const f = path.resolve(root, relPath)
            const contents = fs.readFileSync(f, "utf8");
            console.log();
            console.log("Contents of", relPath);
            console.log();
            console.log(contents);
        };
        cmd.on("help", printConents);
        cmd.on("--help", printConents);
    });

    return program;
};


export default addToProgram;