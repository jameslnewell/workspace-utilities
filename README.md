# @jameslnewell/workspace-utilities

Utilities for finding and filtering `yarn`/`pnpm`/`npm` workspaces.

## Usage

```ts
import {Project, createIsWorkspaceChangedFilter, getDependents} from '@jameslnewell/workspace-utilities'

const since = 'master'
const project = await Project.read(process.cwd());

const isWorkspaceChanged = await createIsWorkspaceChangedFilter({project, since});
const changedChildWorkspaces = project.workspaces.filter(isWorkspaceChanged)

const changedWorkspacesAndTheirDependents = Array.from(new Set([
  ...changedChildWorkspaces,
  ...getDependents(changedChildWorkspaces, {project})
]))

changedWorkspacesAndTheirDependents.map(console.log)
```
