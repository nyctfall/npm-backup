"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = require("readline");
const process_1 = require("process");
// this is for the user interaction, getting input, responces, etc.
// in an Promise and async/await compatible way.
const rl = (0, readline_1.createInterface)({
    input: process_1.stdin,
    output: process_1.stdout
});
// async/await compatible readline.question() function:
// this returns the user's responce string.
const promiseQuestion = (question) => {
    // return created promise for awaiting user responce asynchonously:
    return new Promise((resolve) => {
        // use normal readline.question() method:
        rl.question(question, (responce) => {
            // resolve promise with user input to return from promise:
            resolve(responce);
        });
    });
};
rl.question = promiseQuestion;
exports.default = rl;
