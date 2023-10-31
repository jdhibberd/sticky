### Debugging
- **Backend**:
  - Run the server in a VSCode terminal as normal.
  - Run `Debug: Attach to Node Process` in VSCode, and select the server process from the dropdown.
- **Frontend**:
  - Run the app in Google Chrome as normal.
  - Ensure the Developer Tools panel is visible.
  - Navigate to `Sources` and then expand the `webpack://` node from the tree on the left.
  - Under `src` you will have access to source TypeScript files, where you can set breakpoints.