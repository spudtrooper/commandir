# commandir

A library to add scripts to [commander](https://www.npmjs.com/package/commander) to add commands/actions to a hierarchy of scripts.

## Goals

Add some order to randomly scattered whose directory srtucture actually makes sensea as a stop-gap.

Stage of project | Use this?  | Why?
---------------- | ---------- | ----
Start            | **NO**     | Don't start off lazy
Middle           | Maybe      | Ephemeral scripts work and re-organizing them is a waste of time
End              | **NO**     | Don't end off lazy

## Usage

Add this to the end of an existing use of commander:

```js
import { program } from "commander";

program.description("something");

....

program.parse(process.argv);
```

===>

```js
import { program } from "commander";
import commandir from "./<path to this>"; // TODO: package it correctly

program.description("something");

....

const root = __dirname + "/..";
commandir(program, root, {
  maxDepth: 2,
  exclude: ["scripts"],
  excludeFollow: ["node_modules", "dist"],
});

program.parse(process.argv);
```

or create a new one:

```js
import { program } from "commander";
import commandir from "./<path to this>"; // TODO: package it correctly

program.description("example usage");

const root = __dirname + "/..";
commandir(program, root, {
  maxDepth: 2,
  exclude: ["scripts"],
  excludeFollow: ["node_modules", "dist"],
});

program.parse(process.argv);
```

You'll get commands and actions for all scripts under `root`.
