import { AsyncReadline as rl } from "./custom-utils"
import type { ReadDefaultAnswer, SetDefaultAnswer, Answer /* , PromptAnswer */ } from "./answer"
/**
 * @debrief - This module coerces user responces to a yes or no answer object.
 */

// user input interpreter for confirmation:
export class Confirmer {
  readonly #_defaultAnswer: ReadDefaultAnswer
  /** @todo */
  //readonly #_userResTypePrompt: UserResTypePrompt

  /** @todo */
  constructor(
    { toYes = false, toNo = false }: SetDefaultAnswer = { toYes: false, toNo: false } /* userResTypePrompt: string */
  ) {
    this.#_defaultAnswer = { toYes, toNo }
  }

  // use defaults to find or coerce user responce to an answer:
  interpret(responce: string): Answer {
    // initialize to default reply:
    const answerInfo: Answer = {
      // if default answer = "yes" is true, then answer is "yes" = true:
      // if default answer = "yes" is false, then answer is "yes" = false:
      isYes: this.#_defaultAnswer.toYes,
      // if default answer = "yes" is true, then default answer is "no" = false:
      // if default answer = "yes" is false, then default answer is "no" = true:
      isNo: this.#_defaultAnswer.toNo,
      // user responce wasn't "yes" or "no":
      isDefault: true
    }

    // check if the responce is yes:
    if (responce.match(/^ *y(?:es)?/i)) {
      answerInfo.isDefault = false
      answerInfo.isYes = true
    }
    // check if the responce is no:
    else if (responce.match(/^ *no?/i)) {
      answerInfo.isDefault = false
      answerInfo.isNo = true
    }

    return answerInfo
  }

  /** @todo */
  async ask(question: string): Promise<Answer> {
    const responce = await rl.question(question)

    return this.interpret(responce)
  }
}

/** @todo */
// coerce user responce to questions, defaults to yes:
export const Affirmer = new Confirmer({ toYes: true })

/** @todo */
// coerce user responce to questions, defaults to no:
export const Controverter = new Confirmer({ toNo: true })
