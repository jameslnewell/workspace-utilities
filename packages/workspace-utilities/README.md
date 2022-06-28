# @jameslnewell/workspace-utilities

Utilities for finding and filtering `yarn`/`npm` workspaces.

## Usage

```ts
import {Project, getDiff} from '@jameslnewell/workspace-utilities'

const workspaces = await getWorkspaces(
  await Project.fromDirectory(process.cwd()), 
  {
    since: 'master',
    includeDependents: 'recursive',
  }
);

workspaces.map(workspace => console.log(`${workspace.name}@${workspace.version}));
```
