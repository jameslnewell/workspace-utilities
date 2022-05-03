// getWorkspaces({
//   root,
//   diff,
//   dependents,
//   dependencies,
// }: ProjectGetWorkspacesOptions = {}): Workspace[] {
//   let workspaces = this.#workspaces;

//   if (root) {
//     workspaces.push(this.#root);
//   }

//   if (diff) {
//     const changedFiles = Object.keys(diff);
//     workspaces = workspaces.filter((workspace) => {
//       for (const changedFile of changedFiles) {
//         if (changedFile.startsWith(`${workspace.directory}${path.sep}`)) {
//           return true;
//         }
//       }
//       return false;
//     });
//   }

//   const combined = new Set(workspaces);

//   if (dependencies) {
//     for (const workspace of workspaces) {
//       const dependencyWorkspaces = this.getDependencies(workspace, {
//         recursive: dependencies === "recursive",
//       });
//       for (const depedencyWorkspace of dependencyWorkspaces) {
//         combined.add(depedencyWorkspace);
//       }
//     }
//   }

//   if (dependents) {
//     for (const workspace of workspaces) {
//       const depedentWorkspaces = this.getDependents(workspace, {
//         recursive: dependents === "recursive",
//       });
//       for (const depedentWorkspace of depedentWorkspaces) {
//         combined.add(depedentWorkspace);
//       }
//     }
//   }

//   return Array.from(combined);
// }

export default {};
