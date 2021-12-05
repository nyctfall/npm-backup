"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Confirmer__defaultAnswer;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controverter = exports.Affirmer = exports.Confirmer = void 0;
const custom_utils_1 = require("./custom-utils");
/**
 * @debrief - This module coerces user responces to a yes or no answer object.
 */
// user input interpreter for confirmation:
class Confirmer {
    /** @todo */
    //readonly #_userResTypePrompt: UserResTypePrompt
    /** @todo */
    constructor({ toYes = false, toNo = false } = { toYes: false, toNo: false }) {
        _Confirmer__defaultAnswer.set(this, void 0);
        __classPrivateFieldSet(this, _Confirmer__defaultAnswer, { toYes, toNo }, "f");
    }
    // use defaults to find or coerce user responce to an answer:
    interpret(responce) {
        // initialize to default reply:
        const answerInfo = {
            // if default answer = "yes" is true, then answer is "yes" = true:
            // if default answer = "yes" is false, then answer is "yes" = false:
            isYes: __classPrivateFieldGet(this, _Confirmer__defaultAnswer, "f").toYes,
            // if default answer = "yes" is true, then default answer is "no" = false:
            // if default answer = "yes" is false, then default answer is "no" = true:
            isNo: __classPrivateFieldGet(this, _Confirmer__defaultAnswer, "f").toNo,
            // user responce wasn't "yes" or "no":
            isDefault: true
        };
        // check if the responce is yes:
        if (responce.match(/^ *y(?:es)?/i)) {
            answerInfo.isDefault = false;
            answerInfo.isYes = true;
        }
        // check if the responce is no:
        else if (responce.match(/^ *no?/i)) {
            answerInfo.isDefault = false;
            answerInfo.isNo = true;
        }
        return answerInfo;
    }
    /** @todo */
    async ask(question) {
        const responce = await custom_utils_1.AsyncReadline.question(question);
        return this.interpret(responce);
    }
}
exports.Confirmer = Confirmer;
_Confirmer__defaultAnswer = new WeakMap();
/** @todo */
// coerce user responce to questions, defaults to yes:
exports.Affirmer = new Confirmer({ toYes: true });
/** @todo */
// coerce user responce to questions, defaults to no:
exports.Controverter = new Confirmer({ toNo: true });
