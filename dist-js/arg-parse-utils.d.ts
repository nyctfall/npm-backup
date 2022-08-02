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
export declare const unsafeCLICharsRegex: RegExp;
export declare const argSanitize: (rawArg: string) => string;
export declare const argvSanitize: (rawArgv: string[]) => string[];
