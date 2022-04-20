# @jameslnewell/workspace-utilities

Utilities for finding and filtering `yarn`/`pnpm`/`npm` workspaces.

## Usage

```js
import {Project, excludeRoot, includeDiff, includeDependents} from '@jameslnewell/workspace-utilities'

const project = await Project.read(process.cwd());
const childWorkspaces = await excludeRoot(project.workspaces, {project})
const changedWorkspaces = await filterByDiff(childWorkspaces, {since: 'master'})
const changedWorkspacesAndTheirDependents = await includeDependents(changedWorkspaces, {project})

changedWorkspacesAndTheirDependents.map(console.log)

```
