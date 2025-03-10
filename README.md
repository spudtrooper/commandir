# commandir

A library to add scripts to [commander](https://www.npmjs.com/package/commander) to add commands/actions to a hierarchy of scripts.

## Motivation

If you have scripts like this and continue to make it worse:

```
foo/run.sh
foo/something.sh
foo/bar/scripts/hello.sh
```

You'll get "free" organization with commander like:

```
% ./commandir

Commands:
  foo           [3 script]

% ./commandir foo

Commands:
  run           foo/run.sh
  something     foo/something.sh
  bar           [1 script]

% ./commandir foo run

... runs foo/run.sh

% ./commandir foo run help

... shows contents of foo/run.sh ...

```

...

## Example

```bash
yarn ts-node src/example.ts help
```


See [https://github.com/spudtrooper/commandir/blob/main/src/lib.ts#L20](this comment) for more details.

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
