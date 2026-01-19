/**
 * URL validation utilities
 * 
 * Validates URLs to ensure they are safe and properly formatted
 */

/**
 * Dangerous URL protocols that should be rejected
 */
const DANGEROUS_PROTOCOLS = [
  "javascript:",
  "data:",
  "file:",
  "vbscript:",
  "about:",
] as const;

/**
 * Validates a URL to ensure it's safe
 * 
 * @param url - URL string to validate
 * @returns Object with validation result
 */
export function validateUrl(url: string): {
  valid: boolean;
  error?: string;
  normalizedUrl?: string;
} {
  if (!url || typeof url !== "string") {
    return {
      valid: false,
      error: "URL is required",
    };
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl === "") {
    return {
      valid: false,
      error: "URL cannot be empty",
    };
  }

  // Check for dangerous protocols
  const lowerUrl = trimmedUrl.toLowerCase();
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (lowerUrl.startsWith(protocol)) {
      return {
        valid: false,
        error: `URL protocol ${protocol} is not allowed`,
      };
    }
  }

  // Try to parse the URL
  try {
    const parsedUrl = new URL(trimmedUrl);

    // Only allow http and https protocols
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return {
        valid: false,
        error: "Only http and https protocols are allowed",
      };
    }

    // Validate hostname is not empty
    if (!parsedUrl.hostname || parsedUrl.hostname.trim() === "") {
      return {
        valid: false,
        error: "URL must have a valid hostname",
      };
    }

    return {
      valid: true,
      normalizedUrl: parsedUrl.toString(),
    };
  } catch (error) {
    // If URL parsing fails, try adding https:// prefix
    if (!trimmedUrl.includes("://")) {
      try {
        const urlWithProtocol = `https://${trimmedUrl}`;
        const parsedUrl = new URL(urlWithProtocol);

        if (parsedUrl.hostname && parsedUrl.hostname.trim() !== "") {
          return {
            valid: true,
            normalizedUrl: parsedUrl.toString(),
          };
        }
      } catch {
        // Fall through to error
      }
    }

    return {
      valid: false,
      error: "Invalid URL format",
    };
  }
}

/**
 * Validates and normalizes a URL
 * 
 * @param url - URL string to validate and normalize
 * @returns Normalized URL or null if invalid
 */
export function validateAndNormalizeUrl(url: string): string | null {
  const result = validateUrl(url);
  return result.valid ? result.normalizedUrl ?? null : null;
}

