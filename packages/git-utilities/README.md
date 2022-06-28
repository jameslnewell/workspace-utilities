# @jameslnewell/git-utilities

Utilities for working with `git`.

## Usage

```ts
import { getMergeBase, getDiff } from "@jameslnewell/git-utilities";

const since = await getMergeBase("main", "my-branch");
const diff = await getDiff({ since });
```
