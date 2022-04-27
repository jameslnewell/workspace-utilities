# @jameslnewell/workspace-utilities

![checks](https://github.com/jameslnewell/workspace-utilities/actions/workflows/checks.yml/badge.svg) ![release](https://github.com/jameslnewell/workspace-utilities/actions/workflows/release.yml/badge.svg)

Utilities for finding and filtering `yarn`/`pnpm`/`npm` workspaces.

## Usage

```ts
import {Project, createIsWorkspaceChangedFilter, getDependents} from '@jameslnewell/workspace-utilities'

const since = 'master'
const project = await Project.read(process.cwd());

const isWorkspaceChanged = await createIsWorkspaceChangedFilter({project, since});
const changedWorkspaces = project.workspaces.filter(isWorkspaceChanged)

const changedWorkspacesAndTheirDependents = Array.from(new Set([
  ...changedWorkspaces,
  ...changedWorkspaces.map(changedWorkspace => getDependents(changedWorkspace, {project, recursive: true})).flat()
]))

changedWorkspacesAndTheirDependents.map(console.log)
```
