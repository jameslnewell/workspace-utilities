# @jameslnewell/workspace-utilities

Utilities for finding and filtering `yarn` and `npm` workspaces.

## Usage

```ts
import {getDiff} from '@jameslnewell/git-utilities';
import {Project, getDependents} from '@jameslnewell/workspace-utilities';
import * as filters from '@jameslnewell/workspace-utilities/filters';

const diff = await getDiff();
const project = await Project.fromDirectory(process.cwd());

const changedWorkspaces = project.children.filter(filters.changed(diff));
const changedWorkspacesAndTheirDependents = Array.from(new Set([
  ...changedWorkspaces,
  ...changedWorkspaces.map(workspace => getDependents(workspace, {project}).flat()
]))
const workspacesThatRequireTesting = changedWorkspacesAndTheirDependents.filter(filters.script('test'))

console.log(workspacesToTest)
```
