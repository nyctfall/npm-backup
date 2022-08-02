export * from "./prompt-answer";
/**
 * @debrief - This module creates the yes or no answer object.
 */
export interface Answer {
    isYes: boolean;
    isNo: boolean;
    isDefault: boolean;
}
interface SetDefaultAnswerYes {
    readonly toYes: boolean;
    readonly toNo?: false | never;
}
interface SetDefaultAnswerNo {
    readonly toYes?: false | never;
    readonly toNo: boolean;
}
export declare type SetDefaultAnswer = SetDefaultAnswerYes | SetDefaultAnswerNo;
export interface ReadDefaultAnswer {
    readonly toYes: boolean;
    readonly toNo: boolean;
}
