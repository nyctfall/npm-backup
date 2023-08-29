"use strict";
/**
 * @fileoverview - User input sanitization types and functions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.argvSanitize = exports.argSanitize = exports.unsafeCLICharsRegex = void 0;
/**
 * Necessary characters for the CLI and NPM's CLI:
 * @example "\w" = "[A-Za-z0-9_]" = alpha-numeric and "_".
 * NPM uses: "@", "/", ".", "-".
 * NPM SemVer uses: "<", ">", "(", ")", "|", "~", "^", "+", "*"
 * CLI uses: "=", "?", " " (space),
 */
exports.unsafeCLICharsRegex = /[^\w@/.<>()|~^+*=? -]/gi;
// this sanitizes an arg for NPM:
const argSanitize = (rawArg) => {
    // just remove bad chars by replacing with empty string:
    // return sanitized string to string arg array:
    return rawArg.replace(exports.unsafeCLICharsRegex, "");
};
exports.argSanitize = argSanitize;
// this sanitizes an array of string args for NPM:
const argvSanitize = (rawArgv) => {
    // return empty array, since they're falsy just like null and undefined:
    if (!rawArgv)
        return rawArgv;
    // create a sanitized array of the string array:
    // for each string arg, return a sanitized string.
    const sanArgv = rawArgv.map(exports.argSanitize);
    // return sanitized arg array:
    return sanArgv;
};
exports.argvSanitize = argvSanitize;
//# sourceMappingURL=arg-parse-utils.js.map