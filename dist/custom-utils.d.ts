/// <reference types="node" />
/// <reference types="node" />
import * as Readline from "readline";
import { execFile as execFileCallback } from "child_process";
/**
 * @debrief - This is a module for all custom or modified utilities used in the program.
 */
/**
 * @todo - I don't know how to get this class to not throw typing errors in TS...
 */
declare class AsyncInterface extends Readline.Interface {
    constructor(options: Readline.ReadLineOptions);
    question(query: string): Promise<string>;
}
declare const rl: AsyncInterface;
/**
 * @debrief - async generator for a for await...of loop to replace an Array forEach.
 */
declare const asyncForEach: (array: Array<any>, asyncCallback: Function, thisArg?: object | undefined) => Promise<void>;
export { rl as AsyncReadline, asyncForEach };
declare const asyncExecFile: typeof execFileCallback.__promisify__;
export { asyncExecFile as execfile };
export declare const utilPromise: {
    execFile: typeof execFileCallback.__promisify__;
};
export declare type ExecFileResult = {
    stdout: string;
    stderr: string;
};
export declare type ExecFileAsyncResult = Promise<ExecFileResult>;
