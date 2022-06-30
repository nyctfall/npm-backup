/**
 * @fileoverview - User input sanitization types and functions.
 */

/**
 * Necessary characters for the CLI and NPM's CLI:
 * @example "\w" = "[A-Za-z0-9_]" = alpha-numeric and "_".
 * NPM uses: "@", "/", ".", "-".
 * NPM SemVer uses: "<", ">", "(", ")", "|", "~", "^", "+", "*"
 * CLI uses: "=", "?", " " (space),  
 */
export const unsafeCLICharsRegex = /[^\w@/.<>()|~^+*=? -]/gi

// this sanitizes an arg for NPM:
export const argSanitize = (rawArg: string): string => {
  // just remove bad chars by replacing with empty string:
  // return sanitized string to string arg array:
  return rawArg.replace(unsafeCLICharsRegex, "");
}

// this sanitizes an array of string args for NPM:
export const argvSanitize = (rawArgv: string[]): string[] => {
  // create a sanitized array of the string array:
  // for each string arg, return a sanitized string.
  const sanArgv: string[] = rawArgv.map(argSanitize);
  
  // return sanitized arg array:
  return sanArgv;
}