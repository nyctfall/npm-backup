/**
 * @debrief - This module blueprints the design of a yes or no question.
 */

// answer prompt for how the user should respond to a question:
/**
 * @example:
 *  `${Question}? (Yes/No)` - Full words use in prompt.
 *  `${Question}? (YES/no)` or `${Question}? (yes/NO)` - Upper-case default option.
 *  `${Question}? (Yes/no)` or `${Question}? (yes/No)` - Capital default option.
 *  `${Question}? (Y/N)` or `${Question}? (y/n)` - Short-hand.
 *  `${Question}? (Y/n)` or `${Question}? (y/N)` - Upper-case default option in short-hand.
 */

// helper type for string that aren't all lowercase,
// but are Capitalized or all Uppercase.
type UpperOrCaps<T extends string> = Uppercase<T> | Capitalize<T>

// "yes" answers:
type LongYes = "yes"
type ShortYes = "y"

// optional yes:
// long optional yes:
type LongOptionalYes = Lowercase<LongYes>

// shorthand optional yes:
type ShortOptionalYes = Lowercase<ShortYes>

// default yes:
// long default yes:
type LongDefaultYes = UpperOrCaps<LongYes>

// shorthand default yes:
type ShortDefaultYes = UpperOrCaps<ShortYes>

// combined optional yes:
export type PromptOptionalYes = LongOptionalYes | ShortOptionalYes

// combined default yes:
export type PromptDefaultYes = LongDefaultYes | ShortDefaultYes

// combined long yes:
export type PromptLongYes = LongDefaultYes | LongOptionalYes

// combined short yes:
export type PromptShortYes = ShortDefaultYes | ShortOptionalYes

// combined yes choice:
export type PromptYes = PromptOptionalYes | PromptDefaultYes | PromptLongYes | PromptShortYes

// "no" answers:
type LongNo = "no"
type ShortNo = "n"

// optional no:
// long optional no:
type LongOptionalNo = Lowercase<LongNo>

// shorthand optional no:
type ShortOptionalNo = Lowercase<ShortNo>

// default no:
// long default no:
type PromptLongDefaultNo = UpperOrCaps<LongNo>

// shorthand default no:
type PromptShortDefaultNo = UpperOrCaps<ShortNo>

// combined optional no:
export type PromptOptionalNo = LongOptionalNo | ShortOptionalNo

// combined default no:
export type PromptDefaultNo = PromptLongDefaultNo | PromptShortDefaultNo

// combined long no:
export type PromptLongNo = PromptLongDefaultNo | LongOptionalNo

// combined short no:
export type PromptShortNo = PromptShortDefaultNo | ShortOptionalNo

// combined no choice:
export type PromptNo = PromptDefaultNo | PromptOptionalNo | PromptLongNo | PromptShortNo

// helper types:
type PromptDivider = "/" //| "|" | "\\"
type PromptDelimiter = ":" //| "" | "-" | "—" | "–"
type Question = `${string}?`
type OrderedPrompt<
  LeftChoice extends string,
  RightChoice extends string
> = `${Question} (${LeftChoice}${PromptDivider}${RightChoice})${PromptDelimiter}`
type UnorderedPrompt<Choice1 extends string, Choice2 extends string> =
  | OrderedPrompt<Choice1, Choice2>
  | OrderedPrompt<Choice2, Choice1>

export type PromptAnswerLong = UnorderedPrompt<PromptLongNo, PromptLongYes>

export type PromptAnswerShort = UnorderedPrompt<PromptShortYes, PromptShortNo>

export type PromptAnswerDefault =
  | UnorderedPrompt<PromptDefaultYes, PromptOptionalNo>
  | UnorderedPrompt<PromptDefaultNo, PromptOptionalYes>

/**
 * @todo - Default should come before optional choice in __Proper versions of type...
 * @todo also: fix type to be proper by default,
 * @todo and: make catch-all types non-default.
 */
export type PromptAnswerDefault__Proper =
  | OrderedPrompt<PromptDefaultYes, PromptOptionalNo>
  | OrderedPrompt<PromptDefaultNo, PromptOptionalYes>

export type PromptAnswerOptional = UnorderedPrompt<PromptOptionalNo, PromptOptionalYes>

export type PromptAnswerAllVersions = PromptAnswerDefault | PromptAnswerOptional | PromptAnswerLong | PromptAnswerShort

export type PromptAnswer =
  | (PromptAnswerLong & PromptAnswerDefault)
  | (PromptAnswerShort & PromptAnswerDefault)
  | (PromptAnswerLong & PromptAnswerOptional)
  | (PromptAnswerShort & PromptAnswerOptional)
