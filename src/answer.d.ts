export * from "./prompt-answer"

/**
 * @debrief - This module creates the yes or no answer object.
 */

// returned answer object:
export interface Answer {
  isYes: boolean
  isNo: boolean
  isDefault: boolean
}

// default answer setting:
// toYes and toNo should be MUTUALLY EXCLUSIVE when setting defaults!
interface SetDefaultAnswerYes {
  readonly toYes: boolean
  readonly toNo?: false | never
}

interface SetDefaultAnswerNo {
  readonly toYes?: false | never
  readonly toNo: boolean
}

export type SetDefaultAnswer = SetDefaultAnswerYes | SetDefaultAnswerNo

// reads whether toYes and toNo should be true or false:
export interface ReadDefaultAnswer {
  readonly toYes: boolean
  readonly toNo: boolean
}
