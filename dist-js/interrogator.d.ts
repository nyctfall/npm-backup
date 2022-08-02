import { SetDefaultAnswer, Answer } from "./answer";
export { Answer } from "./answer";
/**
 * @debrief - This module coerces user responces to a yes or no answer object.
 */
export declare class Confirmer {
    #private;
    /** @todo */
    /** @todo */
    constructor({ toYes, toNo }?: SetDefaultAnswer);
    interpret(responce: string): Answer;
    /** @todo */
    ask(question: string): Promise<Answer>;
}
/** @todo */
export declare const Affirmer: Confirmer;
/** @todo */
export declare const Controverter: Confirmer;
