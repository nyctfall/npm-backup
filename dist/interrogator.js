"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controverter = exports.Affirmer = exports.Confirmer = void 0;
const custom_utils_1 = require("./custom-utils");
/**
 * @debrief - This module coerces user responces to a yes or no answer object.
 */
// user input interpreter for confirmation:
class Confirmer {
    #_defaultAnswer;
    /** @todo */
    //readonly #_userResTypePrompt: UserResTypePrompt
    /** @todo */
    constructor({ toYes = false, toNo = false } = { toYes: false, toNo: false }) {
        this.#_defaultAnswer = { toYes, toNo };
    }
    // use defaults to find or coerce user responce to an answer:
    interpret(responce) {
        // initialize to default reply:
        const answerInfo = {
            // if default answer = "yes" is true, then answer is "yes" = true:
            // if default answer = "yes" is false, then answer is "yes" = false:
            isYes: this.#_defaultAnswer.toYes,
            // if default answer = "yes" is true, then default answer is "no" = false:
            // if default answer = "yes" is false, then default answer is "no" = true:
            isNo: this.#_defaultAnswer.toNo,
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
/** @todo */
// coerce user responce to questions, defaults to yes:
exports.Affirmer = new Confirmer({ toYes: true });
/** @todo */
// coerce user responce to questions, defaults to no:
exports.Controverter = new Confirmer({ toNo: true });
//# sourceMappingURL=interrogator.js.map