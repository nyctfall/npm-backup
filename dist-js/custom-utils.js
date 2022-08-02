"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utilPromise = exports.execfile = exports.asyncForEach = exports.AsyncReadline = void 0;
const Readline = require("readline");
const process_1 = require("process");
const child_process_1 = require("child_process");
const util_1 = require("util");
/**
 * @debrief - This is a module for all custom or modified utilities used in the program.
 */
/**
 * @todo - I don't know how to get this class to not throw typing errors in TS...
 */
class AsyncInterface extends Readline.Interface {
    // constructor(input: NodeJS.ReadableStream, output?: NodeJS.WritableStream, completer?: Readline.Completer | Readline.AsyncCompleter, terminal?: boolean){
    constructor(options) {
        // super(input, output, completer, terminal)
        super(options);
    }
    // override non-async method:
    question(query) {
        // return created promise for awaiting user responce asynchonously:
        return new Promise((resolve) => {
            // use normal readline.question() method:
            super.question(query, (responce) => {
                // resolve promise with user input to return from promise:
                resolve(responce);
            });
        });
    }
}
/**
 * @debrief - This is for the user interaction, getting input, responces, etc.
 * in an Promise and async/await compatible way.
 */
// function createAsyncInterface(options: Readline.ReadLineOptions): Readline.Interface;
// function createAsyncInterface(input: NodeJS.ReadableStream, output?: NodeJS.WritableStream, completer?: Readline.Completer | Readline.AsyncCompleter, terminal?: boolean): Readline.Interface;
// function createAsyncInterface(input: NodeJS.ReadableStream, output?: NodeJS.WritableStream, completer?: Readline.Completer | Readline.AsyncCompleter, terminal?: boolean) {
const createAsyncInterface = (options) => {
    const AsyncReadlineInterface = Readline.createInterface(options);
    // async/await compatible readline.question() function:
    // this returns the user's responce string.
    AsyncReadlineInterface.question = (query) => {
        // return created promise for awaiting user responce asynchonously:
        return new Promise((resolve) => {
            // use normal readline.question() method:
            AsyncReadlineInterface.question(query, (responce) => {
                // resolve promise with user input to return from promise:
                resolve(responce);
            });
        });
    };
    return AsyncReadlineInterface;
};
const rl = createAsyncInterface({
    input: process_1.stdin,
    output: process_1.stdout
});
exports.AsyncReadline = rl;
/**
 * @debrief - async generator for a for await...of loop to replace an Array forEach.
 */
const asyncForEach = async (array, asyncCallback, thisArg) => {
    // catch any promise errors:
    try {
        let index = 0;
        for (const value of array) {
            await asyncCallback.call(thisArg, value, index++, array);
        }
    }
    catch (e) {
        console.error(e);
    }
};
exports.asyncForEach = asyncForEach;
const asyncExecFile = (0, util_1.promisify)(child_process_1.execFile);
exports.execfile = asyncExecFile;
exports.utilPromise = {
    execFile: asyncExecFile
};
//# sourceMappingURL=custom-utils.js.map