/**
 * Operating System information utilities
 * Provides OS detection and system-specific guidance
 */

export type OSType = "windows" | "macos" | "linux" | "unknown";

/**
 * Detect the current operating system
 * Works in both Tauri and browser environments
 */
export const detectOS = (): OSType => {
  // In Tauri environment, try to use Tauri OS plugin if available
  if (typeof window !== "undefined" && "__TAURI__" in window) {
    // Tauri provides navigator.platform with specific values
    const platform = (navigator.platform ?? "").toLowerCase();

    if (platform.startsWith("win")) {
      return "windows";
    }
    if (platform.startsWith("mac")) {
      return "macos";
    }
    if (platform.startsWith("linux")) {
      return "linux";
    }
  }

  // Fallback: Use navigator.userAgent for browser environment
  if (typeof navigator !== "undefined") {
    const userAgent = (navigator.userAgent ?? "").toLowerCase();

    if (userAgent.includes("windows")) {
      return "windows";
    }
    if (userAgent.includes("mac")) {
      return "macos";
    }
    if (userAgent.includes("linux")) {
      return "linux";
    }
  }

  return "unknown";
};

/**
 * Get human-readable OS name
 */
export const getOSDisplayName = (os: OSType): string => {
  switch (os) {
    case "windows":
      return "Windows";
    case "macos":
      return "macOS";
    case "linux":
      return "Linux";
    default:
      return "Unknown OS";
  }
};

/**
 * Get OS-specific system prompt enhancement
 * This enhancement is always active and cannot be disabled by users
 */
export const getOSInfoEnhancementPrompt = (): string => {
  const os = detectOS();
  const osName = getOSDisplayName(os);

  const basePrompt = `## 🖥️ Operating System Information

You are running on **${osName}**.`;

  // Windows-specific guidance
  if (os === "windows") {
    return (
      basePrompt +
      `

### Windows-Specific Notes:

- **Configuration Directory**: Application configuration and data are stored in the user's home directory at \`.bamboo\` (e.g., \`C:\\Users\\[Username]\\.bamboo\`)
  - Note: When accessing this directory programmatically, use the expanded path rather than the ~ shorthand

- **Home Directory Paths with Tilde (~)**: On Windows, a leading tilde (~) in file paths is NOT automatically expanded to the user's home directory by most Windows-native APIs and tools. When you encounter paths starting with ~, ~/, or ~\\, you MUST replace them with the Windows absolute path before using them.
  - Example: \`~/Documents/file.txt\` should be expanded to \`C:\\Users\\[Username]\\Documents\\file.txt\`
  - Use tools to get the actual home directory path when needed
  - Note: This applies to leading tilde only. Windows short paths like \`C:\\PROGRA~1\\\` are valid and should NOT be modified
  - Some Windows shells (PowerShell, Git Bash, WSL) may support ~ in specific contexts, but Windows-native paths/APIs generally do not

- **Path Separators**: Windows uses backslashes (\\) as path separators, but forward slashes (/) are also accepted in most contexts
- **Case Insensitivity**: Windows file paths are case-insensitive (file.txt and FILE.TXT refer to the same file)
- **Drive Letters**: Windows paths typically start with a drive letter (C:\\, D:\\, etc.)`
    );
  }

  // macOS-specific guidance
  if (os === "macos") {
    return (
      basePrompt +
      `

### macOS-Specific Notes:

- **Configuration Directory**: Application configuration and data are stored in \`~/.bamboo\` (expands to \`/Users/[Username]/.bamboo\`)

- **File Paths**: macOS uses Unix-style paths with forward slashes (/)
- **Home Directory**: The tilde (~) expands to /Users/[Username]
- **Case Sensitivity**: macOS file system may be case-sensitive or case-insensitive depending on format (APFS is case-insensitive by default)`
    );
  }

  // Linux-specific guidance
  if (os === "linux") {
    return (
      basePrompt +
      `

### Linux-Specific Notes:

- **Configuration Directory**: Application configuration and data are stored in \`~/.bamboo\` (expands to \`/home/[username]/.bamboo\`)

- **File Paths**: Linux uses Unix-style paths with forward slashes (/)
- **Home Directory**: The tilde (~) expands to /home/[username]
- **Case Sensitivity**: Linux file systems are case-sensitive (File.txt and file.txt are different files)`
    );
  }

  return basePrompt;
};
