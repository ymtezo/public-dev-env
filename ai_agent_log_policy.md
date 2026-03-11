# AI Agent Action Log Policy

## Objective
To ensure transparency and control over AI agent actions, specifically focusing on file system mutations, providing real-time feedback and the ability to revert changes.

## 1. Real-time Notification (Popup)
- **Every mutation action** must trigger a user-facing notification/popup.
- The notification should include:
    - **Action Type**: Create, Modify, Delete, Rename.
    - **Target Path**: The full path of the file/directory affected.
    - **Summary of Change**: A brief description of what was changed (e.g., number of lines added/removed, specific configuration update).

## 2. History & Logging (File-Centric)
- The agent must maintain a persistent history of all actions.
- Logs focus on **file state transitions**:
    - **Creation**: Metadata and initial content hash.
    - **Modification**: Diff or backup of previous state.
    - **Deletion**: Backup of the deleted file (stored in a `.backup` or temporary directory).

## 3. Revert Mechanism (The "Undo" Button)
- Every notification and history entry must provide a **"Revert" (Rollback) button**.
- **Rollback functionalities**:
    - **Undo Delete**: Restore the file from backup.
    - **Undo Edit**: Revert file content to the state immediately preceding the change.
    - **Undo Create**: Delete the newly created file.
- Support for sequential rollbacks (LIFO order).

## 4. Execution Workflow
1. **Pre-action**: Record current state / Create backup.
2. **Action**: Execute the file operation.
3. **Post-action**:
    - Log completion status.
    - Trigger the **Popup** with the "Revert" button.
    - Update the **History** file.
