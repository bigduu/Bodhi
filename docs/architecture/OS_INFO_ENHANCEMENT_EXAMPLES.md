# OS Information Enhancement - Examples

This document shows the actual system prompt enhancements generated for each operating system.

## Windows Enhancement Example

```markdown
## 🖥️ Operating System Information

You are running on **Windows**.

### Windows-Specific Notes:

- **Configuration Directory**: Application configuration and data are stored in the user's home directory at `.bamboo` (e.g., `C:\Users\[Username]\.bamboo`)
  - Note: When accessing this directory programmatically, use the expanded path rather than the ~ shorthand

- **Home Directory Paths with Tilde (~)**: On Windows, a leading tilde (~) in file paths is NOT automatically expanded to the user's home directory by most Windows-native APIs and tools. When you encounter paths starting with ~, ~/, or ~\, you MUST replace them with the Windows absolute path before using them.
  - Example: `~/Documents/file.txt` should be expanded to `C:\Users\[Username]\Documents\file.txt`
  - Use tools to get the actual home directory path when needed
  - Note: This applies to leading tilde only. Windows short paths like `C:\PROGRA~1\` are valid and should NOT be modified
  - Some Windows shells (PowerShell, Git Bash, WSL) may support ~ in specific contexts, but Windows-native paths/APIs generally do not

- **Path Separators**: Windows uses backslashes (\) as path separators, but forward slashes (/) are also accepted in most contexts
- **Case Insensitivity**: Windows file paths are case-insensitive (file.txt and FILE.TXT refer to the same file)
- **Drive Letters**: Windows paths typically start with a drive letter (C:\, D:\, etc.)
```

## macOS Enhancement Example

```markdown
## 🖥️ Operating System Information

You are running on **macOS**.

### macOS-Specific Notes:

- **Configuration Directory**: Application configuration and data are stored in `~/.bamboo` (expands to `/Users/[Username]/.bamboo`)

- **File Paths**: macOS uses Unix-style paths with forward slashes (/)
- **Home Directory**: The tilde (~) expands to /Users/[Username]
- **Case Sensitivity**: macOS file system may be case-sensitive or case-insensitive depending on format (APFS is case-insensitive by default)
```

## Linux Enhancement Example

```markdown
## 🖥️ Operating System Information

You are running on **Linux**.

### Linux-Specific Notes:

- **Configuration Directory**: Application configuration and data are stored in `~/.bamboo` (expands to `/home/[username]/.bamboo`)

- **File Paths**: Linux uses Unix-style paths with forward slashes (/)
- **Home Directory**: The tilde (~) expands to /home/[username]
- **Case Sensitivity**: Linux file systems are case-sensitive (File.txt and file.txt are different files)
```

## Unknown OS Enhancement Example

```markdown
## 🖥️ Operating System Information

You are running on **Unknown OS**.
```

## Complete System Prompt Example (Windows)

When all enhancements are enabled on Windows, the final system prompt looks like this:

```markdown
[Base System Prompt]

## 🖥️ Operating System Information

You are running on **Windows**.

### Windows-Specific Notes:

- **Configuration Directory**: Application configuration and data are stored in the user's home directory at `.bamboo` (e.g., `C:\Users\[Username]\.bamboo`)
  - Note: When accessing this directory programmatically, use the expanded path rather than the ~ shorthand

- **Home Directory Paths with Tilde (~)**: On Windows, a leading tilde (~) in file paths is NOT automatically expanded to the user's home directory by most Windows-native APIs and tools. When you encounter paths starting with ~, ~/, or ~\, you MUST replace them with the Windows absolute path before using them.
  - Example: `~/Documents/file.txt` should be expanded to `C:\Users\[Username]\Documents\file.txt`
  - Use tools to get the actual home directory path when needed
  - Note: This applies to leading tilde only. Windows short paths like `C:\PROGRA~1\` are valid and should NOT be modified
  - Some Windows shells (PowerShell, Git Bash, WSL) may support ~ in specific contexts, but Windows-native paths/APIs generally do not

- **Path Separators**: Windows uses backslashes (\) as path separators, but forward slashes (/) are also accepted in most contexts
- **Case Insensitivity**: Windows file paths are case-insensitive (file.txt and FILE.TXT refer to the same file)
- **Drive Letters**: Windows paths typically start with a drive letter (C:\, D:\, etc.)

[User Enhancement - if configured]

## 📊 Visual Representation Guidelines

When explaining concepts, processes, relationships, or data structures, use Mermaid diagrams to enhance understanding...

## Task Checklist Guidelines

When the user request involves multiple steps, include a Markdown TODO list to outline the work...

Workspace path: C:\Users\Alice\MyProject
If you need to inspect files, check the workspace first, then check the bamboo data directory in the user's home directory (use OS-appropriate path format).
```

## Key Points

1. **Configuration Directory** is now prominently mentioned for all OSes
2. **Windows** gets special treatment:
   - Full path example: `C:\Users\[Username]\.bamboo`
   - Warning about ~ expansion
   - Clear distinction between leading tilde and short paths
3. **Unix-like systems** (macOS/Linux):
   - Both `~/.bamboo` and expanded path shown
   - Simpler guidance since ~ works as expected

## Testing

All OS-specific guidance is tested in:
- `bodhi/src/shared/utils/__tests__/osInfoUtils.test.ts`
- Tests verify that configuration directory information is included for all OSes
