// describe.skip(".getWorkspaces()", () => {
//   describe("root", () => {
//     const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);

//     test("does not include the root workspace by default ", () => {
//       const workspaces = project.getWorkspaces();
//       expect(workspaces).not.toContain(project.root);
//     });

//     test("does not include the root workspace when false ", () => {
//       const workspaces = project.getWorkspaces({ root: false });
//       expect(workspaces).not.toContain(project.root);
//     });

//     test("does include the root workspace when true ", () => {
//       const workspaces = project.getWorkspaces({ root: true });
//       expect(workspaces).toContainEqual(project.root);
//     });
//   });

//   describe("diff", () => {
//     const diff = { [fooFile]: "M" };
//     const changedWorkspace = fooWorkspace;
//     const unchangedWorkspace = barWorkspace;
//     const project = new Project(rootWorkspace, [
//       changedWorkspace,
//       unchangedWorkspace,
//     ]);

//     test("does include unchanged workspaces when an argument for diff is not provided", () => {
//       const workspaces = project.getWorkspaces();
//       expect(workspaces).toContainEqual(unchangedWorkspace);
//       expect(workspaces).toContainEqual(changedWorkspace);
//     });

//     test("does not include unchanged workspaces when an argument for diff is provided", () => {
//       const workspaces = project.getWorkspaces({
//         diff,
//       });
//       expect(workspaces).not.toContain(unchangedWorkspace);
//     });

//     test("does include changed workspaces when an argument for diff is provided", () => {
//       const workspaces = project.getWorkspaces({
//         diff,
//       });
//       expect(workspaces).toContainEqual(changedWorkspace);
//     });
//   });

//   describe("dependencies", () => {
//     test("does not include dependencies when an argument for dependencies is provided and dependencies do not exist", () => {
//       const diff = { [fooFile]: "M" };
//       const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);
//       const workspaces = project.getWorkspaces({
//         diff,
//         dependencies: true,
//       });
//       expect(workspaces).not.toContain(barWorkspace);
//     });
//     test("does include dependencies when an argument for dependencies is provided and dependencies exist", () => {
//       const diff = { [fooFile]: "M" };
//       const fooWorkspace = new Workspace(fooFile, {
//         ...fooJSON,
//         dependencies: {
//           bar: "^4.17.0",
//         },
//       });
//       const barWorkspace = new Workspace(barFile, {
//         ...barJSON,
//         version: "4.20.0",
//       });
//       const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);
//       const workspaces = project.getWorkspaces({
//         diff,
//         dependencies: true,
//       });
//       expect(workspaces).toContainEqual(barWorkspace);
//     });
//   });

//   describe("dependents", () => {
//     test("does not include dependents when an argument for dependents is provided and dependents do not exist", () => {
//       const diff = { [barFile]: "M" };
//       const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);
//       const workspaces = project.getWorkspaces({
//         diff,
//         dependents: true,
//       });
//       expect(workspaces).not.toContain(fooWorkspace);
//     });
//     test("does include dependents when an argument for dependents is provided and dependents exist", () => {
//       const diff = { [barFile]: "M" };
//       const fooWorkspace = new Workspace(fooFile, {
//         ...fooJSON,
//         dependencies: {
//           bar: "^4.17.0",
//         },
//       });
//       const barWorkspace = new Workspace(barFile, {
//         ...barJSON,
//         version: "4.20.0",
//       });
//       const project = new Project(rootWorkspace, [fooWorkspace, barWorkspace]);
//       const workspaces = project.getWorkspaces({
//         diff,
//         dependents: true,
//       });
//       expect(workspaces).toContainEqual(fooWorkspace);
//     });
//   });
// });

export default {};
