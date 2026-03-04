import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectOS,
  getOSDisplayName,
  getOSInfoEnhancementPrompt,
} from "../osInfoUtils";

describe("osInfoUtils", () => {
  beforeEach(() => {
    // Reset navigator and window mocks before each test
    vi.restoreAllMocks();
    // Clean up any __TAURI__ marker
    if (typeof window !== "undefined") {
      delete (window as any).__TAURI__;
    }
  });

  describe("detectOS", () => {
    it("detects Windows from platform string in Tauri environment", () => {
      // Set up Tauri environment
      (window as any).__TAURI__ = {};

      Object.defineProperty(window, "navigator", {
        value: { platform: "Win32", userAgent: "Mozilla/5.0 (Windows NT 10.0)" },
        writable: true,
        configurable: true,
      });

      const os = detectOS();
      expect(os).toBe("windows");
    });

    it("detects macOS from platform string in Tauri environment", () => {
      // Set up Tauri environment
      (window as any).__TAURI__ = {};

      Object.defineProperty(window, "navigator", {
        value: { platform: "MacIntel", userAgent: "Mozilla/5.0 (Macintosh)" },
        writable: true,
        configurable: true,
      });

      const os = detectOS();
      expect(os).toBe("macos");
    });

    it("detects Linux from platform string in Tauri environment", () => {
      // Set up Tauri environment
      (window as any).__TAURI__ = {};

      Object.defineProperty(window, "navigator", {
        value: { platform: "Linux x86_64", userAgent: "Mozilla/5.0 (Linux)" },
        writable: true,
        configurable: true,
      });

      const os = detectOS();
      expect(os).toBe("linux");
    });

    it("detects Windows from userAgent when platform is generic", () => {
      Object.defineProperty(window, "navigator", {
        value: {
          platform: "Generic",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        writable: true,
        configurable: true,
      });

      const os = detectOS();
      expect(os).toBe("windows");
    });

    it("detects macOS from userAgent when platform is generic", () => {
      Object.defineProperty(window, "navigator", {
        value: {
          platform: "Generic",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        },
        writable: true,
        configurable: true,
      });

      const os = detectOS();
      expect(os).toBe("macos");
    });

    it("detects Linux from userAgent when platform is generic", () => {
      Object.defineProperty(window, "navigator", {
        value: {
          platform: "Generic",
          userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
        },
        writable: true,
        configurable: true,
      });

      const os = detectOS();
      expect(os).toBe("linux");
    });

    it("returns unknown when OS cannot be detected", () => {
      Object.defineProperty(window, "navigator", {
        value: {
          platform: "Unknown",
          userAgent: "Mozilla/5.0 (Unknown OS)",
        },
        writable: true,
        configurable: true,
      });

      const os = detectOS();
      expect(os).toBe("unknown");
    });

    it("returns unknown when navigator.platform is null or undefined", () => {
      Object.defineProperty(window, "navigator", {
        value: {
          platform: null,
          userAgent: "Mozilla/5.0",
        },
        writable: true,
        configurable: true,
      });

      const os = detectOS();
      expect(os).toBe("unknown");
    });

    it("returns unknown when navigator.userAgent is null or undefined", () => {
      Object.defineProperty(window, "navigator", {
        value: {
          platform: "Unknown",
          userAgent: null,
        },
        writable: true,
        configurable: true,
      });

      const os = detectOS();
      expect(os).toBe("unknown");
    });

    it("returns unknown when navigator is undefined", () => {
      Object.defineProperty(window, "navigator", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const os = detectOS();
      expect(os).toBe("unknown");
    });
  });

  describe("getOSDisplayName", () => {
    it("returns Windows for windows OS type", () => {
      expect(getOSDisplayName("windows")).toBe("Windows");
    });

    it("returns macOS for macos OS type", () => {
      expect(getOSDisplayName("macos")).toBe("macOS");
    });

    it("returns Linux for linux OS type", () => {
      expect(getOSDisplayName("linux")).toBe("Linux");
    });

    it("returns Unknown OS for unknown OS type", () => {
      expect(getOSDisplayName("unknown")).toBe("Unknown OS");
    });
  });

  describe("getOSInfoEnhancementPrompt", () => {
    it("includes OS name in the prompt", () => {
      const prompt = getOSInfoEnhancementPrompt();
      expect(prompt).toContain("## 🖥️ Operating System Information");
      expect(prompt).toContain("You are running on");
    });

    it("includes Windows-specific tilde guidance when OS is Windows", () => {
      // Mock Windows environment
      Object.defineProperty(window, "navigator", {
        value: { platform: "Win32", userAgent: "Windows" },
        writable: true,
        configurable: true,
      });

      const prompt = getOSInfoEnhancementPrompt();
      expect(prompt).toContain("Windows");
      // Check for configuration directory info
      expect(prompt).toContain("Configuration Directory");
      expect(prompt).toContain(".bamboo");
      expect(prompt).toContain("C:\\Users\\[Username]");
      // Check for improved guidance about home directory paths
      expect(prompt).toContain("Home Directory Paths with Tilde (~)");
      expect(prompt).toContain("NOT automatically expanded");
      expect(prompt).toContain("you MUST replace them with the Windows absolute path");
      expect(prompt).toContain("C:\\Users\\[Username]");
      expect(prompt).toContain("Drive Letters");
      // Check for improved guidance about short paths
      expect(prompt).toContain("leading tilde only");
      expect(prompt).toContain("PROGRA~1");
    });

    it("includes macOS-specific guidance when OS is macOS", () => {
      // Mock macOS environment
      Object.defineProperty(window, "navigator", {
        value: { platform: "MacIntel", userAgent: "Macintosh" },
        writable: true,
        configurable: true,
      });

      const prompt = getOSInfoEnhancementPrompt();
      expect(prompt).toContain("macOS");
      // Check for configuration directory info
      expect(prompt).toContain("Configuration Directory");
      expect(prompt).toContain("~/.bamboo");
      expect(prompt).toContain("/Users/[Username]/.bamboo");
      expect(prompt).toContain("Unix-style paths");
      expect(prompt).toContain("Case Sensitivity");
    });

    it("includes Linux-specific guidance when OS is Linux", () => {
      // Mock Linux environment
      Object.defineProperty(window, "navigator", {
        value: { platform: "Linux x86_64", userAgent: "Linux" },
        writable: true,
        configurable: true,
      });

      const prompt = getOSInfoEnhancementPrompt();
      expect(prompt).toContain("Linux");
      // Check for configuration directory info
      expect(prompt).toContain("Configuration Directory");
      expect(prompt).toContain("~/.bamboo");
      expect(prompt).toContain("/home/[username]/.bamboo");
      expect(prompt).toContain("Unix-style paths");
      expect(prompt).toContain("case-sensitive");
    });

    it("returns basic prompt for unknown OS", () => {
      // Mock unknown environment
      Object.defineProperty(window, "navigator", {
        value: { platform: "Unknown", userAgent: "Unknown" },
        writable: true,
        configurable: true,
      });

      const prompt = getOSInfoEnhancementPrompt();
      expect(prompt).toContain("Unknown OS");
      expect(prompt).not.toContain("Specific Notes");
    });
  });
});
