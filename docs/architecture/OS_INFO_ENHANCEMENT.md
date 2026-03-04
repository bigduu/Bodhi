# Operating System Information Enhancement

## Overview

The Operating System (OS) Information Enhancement is a **mandatory system prompt enhancement** that automatically detects the current operating system and provides OS-specific guidance to the AI assistant. This enhancement is always active and cannot be disabled by users.

## Location

- **Implementation**: `bodhi/src/shared/utils/osInfoUtils.ts`
- **Tests**: `bodhi/src/shared/utils/__tests__/osInfoUtils.test.ts`
- **Integration**: `bodhi/src/shared/utils/systemPromptEnhancement.ts`

## Features

### 1. Automatic OS Detection

The system automatically detects the current operating system:

- **Windows**: Detected via `Win32` platform or "Windows" in userAgent
- **macOS**: Detected via `MacIntel` platform or "Macintosh" in userAgent
- **Linux**: Detected via `Linux` platform or "Linux" in userAgent
- **Unknown**: Fallback when OS cannot be determined

### 2. OS-Specific Guidance

Each operating system receives tailored guidance:

#### Windows-Specific Notes 🪟

**Critical: Tilde (~) Path Expansion**

```markdown
- **File Paths with Tilde (~)**: On Windows, the tilde character (~) in file paths
  is NOT automatically expanded to the user's home directory. When you encounter
  file paths containing ~, you MUST replace them with the Windows absolute path
  before using them.

  - Example: `~/Documents/file.txt` should be expanded to `C:\Users\[Username]\Documents\file.txt`
  - Use tools to get the actual home directory path when needed
  - Never use ~ directly in Windows file operations
```

**Additional Windows Guidance**:
- Path separators (backslashes `\` vs forward slashes `/`)
- Case insensitivity (file.txt and FILE.TXT are the same)
- Drive letters (C:\, D:\, etc.)

#### macOS-Specific Notes 🍎

```markdown
- Unix-style paths with forward slashes (/)
- Home directory: tilde (~) expands to /Users/[Username]
- Case sensitivity depends on file system format (APFS is case-insensitive by default)
```

#### Linux-Specific Notes 🐧

```markdown
- Unix-style paths with forward slashes (/)
- Home directory: tilde (~) expands to /home/[username]
- Case-sensitive file systems (File.txt and file.txt are different)
```

### 3. Integration with Enhancement Pipeline

The OS information enhancement is **always the first item** in the system prompt enhancement pipeline:

```
Base Prompt
  ↓
+ OS Information Enhancement (MANDATORY - Always First)
  ↓
+ User Enhancement (Optional)
  ↓
+ Mermaid Enhancement (Optional, enabled by default)
  ↓
+ Todo Enhancement (Optional, enabled by default)
  ↓
+ Workspace Context (Optional)
  ↓
= Final Effective System Prompt
```

## API Reference

### `detectOS(): OSType`

Detects the current operating system.

**Returns**: `"windows"` | `"macos"` | `"linux"` | `"unknown"`

**Example**:
```typescript
import { detectOS } from '@/shared/utils/osInfoUtils';

const os = detectOS();
console.log(os); // "windows" | "macos" | "linux" | "unknown"
```

### `getOSDisplayName(os: OSType): string`

Gets a human-readable name for the OS type.

**Parameters**:
- `os`: The OS type returned by `detectOS()`

**Returns**: Human-readable OS name

**Example**:
```typescript
import { getOSDisplayName } from '@/shared/utils/osInfoUtils';

getOSDisplayName("windows"); // "Windows"
getOSDisplayName("macos");   // "macOS"
getOSDisplayName("linux");   // "Linux"
```

### `getOSInfoEnhancementPrompt(): string`

Generates the OS-specific system prompt enhancement.

**Returns**: Complete enhancement prompt with OS detection and OS-specific guidance

**Example**:
```typescript
import { getOSInfoEnhancementPrompt } from '@/shared/utils/osInfoUtils';

const prompt = getOSInfoEnhancementPrompt();
// On Windows:
// "## 🖥️ Operating System Information
//
//  You are running on **Windows**.
//
//  ### Windows-Specific Notes:
//  [Windows-specific guidance...]"
```

## Testing

The OS information enhancement has comprehensive test coverage:

**Test File**: `bodhi/src/shared/utils/__tests__/osInfoUtils.test.ts`

**Test Coverage**:
- ✅ OS detection from platform string (Windows, macOS, Linux)
- ✅ OS detection from userAgent when platform is generic
- ✅ Unknown OS detection fallback
- ✅ OS display name mapping
- ✅ OS-specific guidance generation
- ✅ Windows tilde (~) path guidance
- ✅ macOS-specific guidance
- ✅ Linux-specific guidance

**Run Tests**:
```bash
cd bodhi
npm run test:run src/shared/utils/__tests__/osInfoUtils.test.ts
```

## Implementation Details

### OS Detection Strategy

The detection uses a layered approach:

1. **Tauri Environment**: Uses `navigator.platform` first (more reliable)
2. **Browser Environment**: Falls back to `navigator.userAgent`
3. **Unknown**: Returns "unknown" if detection fails

### Why This Enhancement is Mandatory

This enhancement is **always included** and **cannot be disabled** because:

1. **File System Safety**: Prevents path-related errors on Windows
2. **Cross-Platform Compatibility**: Ensures AI generates OS-appropriate commands
3. **User Experience**: Provides accurate OS-specific guidance automatically
4. **Error Prevention**: Avoids common pitfalls (e.g., using `~` on Windows)
5. **Configuration Discovery**: Helps AI locate configuration files in `~/.bamboo`

### Configuration Directory Information

All OS-specific guidance now includes the location of the application configuration directory:

- **Windows**: `.bamboo` in user's home (e.g., `C:\Users\[Username]\.bamboo`)
- **macOS**: `~/.bamboo` (expands to `/Users/[Username]/.bamboo`)
- **Linux**: `~/.bamboo` (expands to `/home/[username]/.bamboo`)

This ensures the AI knows where to find configuration files, workflows, and other application data regardless of the operating system.

### Windows Tilde (~) Issue

On Windows, the tilde character is **not automatically expanded** by many tools and APIs. This causes errors when AI generates paths like `~/Documents/file.txt` for Windows users.

**Solution**: The enhancement instructs the AI to:
1. Detect tilde in file paths
2. Replace with Windows absolute path (e.g., `C:\Users\[Username]\...`)
3. Use tools to get the actual home directory when needed

## Integration Example

The OS information enhancement is automatically integrated into the system prompt enhancement pipeline:

```typescript
import { getEffectiveSystemPrompt } from '@/shared/utils/systemPromptEnhancement';

const basePrompt = "You are a helpful coding assistant.";
const workspacePath = "/Users/alice/myproject";

const effectivePrompt = getEffectiveSystemPrompt(basePrompt, workspacePath);

// effectivePrompt now includes:
// 1. Base prompt
// 2. OS Information Enhancement (always first)
// 3. User enhancement (if configured)
// 4. Mermaid enhancement (if enabled)
// 5. Todo enhancement (if enabled)
// 6. Workspace context (if provided)
```

## Future Enhancements

Potential improvements for future versions:

1. **More OS Details**: Include OS version, architecture (x64/ARM64)
2. **Shell Detection**: Detect PowerShell vs CMD vs Bash on Windows
3. **Package Manager**: Detect npm/yarn/pnpm, apt/brew/choco
4. **Environment Variables**: Include relevant PATH information
5. **Language Locale**: Detect system language and locale settings

## Related Documentation

- [System Prompt Enhancement System](./SYSTEM_PROMPT_ENHANCEMENT.md) (if exists)
- [Mermaid Enhancement](./MERMAID_ENHANCEMENT.md) (if exists)
- [Todo Enhancement](./TODO_ENHANCEMENT.md) (if exists)

## Changelog

### 2026-03-04 (Configuration Directory Addition)
- 📁 **Configuration Directory**: Added `.bamboo` config directory location to all OS-specific guidance
  - Windows: Shows `C:\Users\[Username]\.bamboo` with warning about ~ expansion
  - macOS: Shows `~/.bamboo` with expansion to `/Users/[Username]/.bamboo`
  - Linux: Shows `~/.bamboo` with expansion to `/home/[username]/.bamboo`
- 🎯 **AI Discovery**: Ensures AI always knows where to find configuration files
- ✅ **Tests Updated**: All tests verify configuration directory information is included

### 2026-03-04 (Post-Codex Review)
- 🔒 **Security**: Added safe null/undefined checks for navigator properties
- 🎯 **Accuracy**: Improved Windows tilde (~) guidance to be more precise
  - Clarified that only **leading tilde** needs expansion (e.g., `~/`, `~\`)
  - Added explicit note that Windows short paths (e.g., `C:\PROGRA~1\`) should NOT be modified
  - Mentioned shell-specific tilde support (PowerShell, Git Bash, WSL)
- 🌍 **Cross-Platform**: Updated workspace context hint to be OS-agnostic (removed hardcoded `~/.bamboo`)
- ✅ **Testing**: Enhanced test coverage
  - Added explicit Tauri environment tests (set `window.__TAURI__`)
  - Added edge case tests for missing/null navigator properties
  - Improved mock robustness with `configurable: true`
- 🧹 **Code Quality**: Removed unused imports (TypeScript strict mode compliance)

### 2026-03-04 (Initial)
- ✨ Initial implementation
- ✅ Added OS detection for Windows, macOS, Linux
- ✅ Added Windows-specific tilde (~) path guidance
- ✅ Integrated into enhancement pipeline as first item
- ✅ Comprehensive test coverage (16 tests)
- ✅ User cannot disable this enhancement
