/**
 * Input sanitization utilities
 * 
 * Provides functions to sanitize user inputs and prevent XSS attacks
 */

/**
 * Removes HTML tags from a string
 * 
 * @param input - The string to sanitize
 * @returns The sanitized string without HTML tags
 */
export function sanitizeText(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  // Remove HTML tags
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Escapes HTML entities in a string
 * 
 * @param input - The string to escape
 * @returns The escaped string with HTML entities
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return input.replace(/[&<>"'/]/g, (match) => htmlEscapes[match] || match);
}

/**
 * Sanitizes a string by removing HTML tags and trimming whitespace
 * 
 * @param input - The string to sanitize
 * @returns The sanitized and trimmed string
 */
export function sanitizeAndTrim(input: string): string {
  return sanitizeText(input).trim();
}

