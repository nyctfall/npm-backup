/**
 * @debrief - This module blueprints the design of a yes or no question.
 */
/**
 * @example:
 *  `${Question}? (Yes/No)` - Full words use in prompt.
 *  `${Question}? (YES/no)` or `${Question}? (yes/NO)` - Upper-case default option.
 *  `${Question}? (Yes/no)` or `${Question}? (yes/No)` - Capital default option.
 *  `${Question}? (Y/N)` or `${Question}? (y/n)` - Short-hand.
 *  `${Question}? (Y/n)` or `${Question}? (y/N)` - Upper-case default option in short-hand.
 */
declare type UpperOrCaps<T extends string> = Uppercase<T> | Capitalize<T>;
declare type LongYes = "yes";
declare type ShortYes = "y";
declare type LongOptionalYes = Lowercase<LongYes>;
declare type ShortOptionalYes = Lowercase<ShortYes>;
declare type LongDefaultYes = UpperOrCaps<LongYes>;
declare type ShortDefaultYes = UpperOrCaps<ShortYes>;
export declare type PromptOptionalYes = LongOptionalYes | ShortOptionalYes;
export declare type PromptDefaultYes = LongDefaultYes | ShortDefaultYes;
export declare type PromptLongYes = LongDefaultYes | LongOptionalYes;
export declare type PromptShortYes = ShortDefaultYes | ShortOptionalYes;
export declare type PromptYes = PromptOptionalYes | PromptDefaultYes | PromptLongYes | PromptShortYes;
declare type LongNo = "no";
declare type ShortNo = "n";
declare type LongOptionalNo = Lowercase<LongNo>;
declare type ShortOptionalNo = Lowercase<ShortNo>;
declare type PromptLongDefaultNo = UpperOrCaps<LongNo>;
declare type PromptShortDefaultNo = UpperOrCaps<ShortNo>;
export declare type PromptOptionalNo = LongOptionalNo | ShortOptionalNo;
export declare type PromptDefaultNo = PromptLongDefaultNo | PromptShortDefaultNo;
export declare type PromptLongNo = PromptLongDefaultNo | LongOptionalNo;
export declare type PromptShortNo = PromptShortDefaultNo | ShortOptionalNo;
export declare type PromptNo = PromptDefaultNo | PromptOptionalNo | PromptLongNo | PromptShortNo;
declare type PromptDivider = "/";
declare type PromptDelimiter = ":";
declare type Question = `${string}?`;
declare type OrderedPrompt<LeftChoice extends string, RightChoice extends string> = `${Question} (${LeftChoice}${PromptDivider}${RightChoice})${PromptDelimiter}`;
declare type UnorderedPrompt<Choice1 extends string, Choice2 extends string> = OrderedPrompt<Choice1, Choice2> | OrderedPrompt<Choice2, Choice1>;
export declare type PromptAnswerLong = UnorderedPrompt<PromptLongNo, PromptLongYes>;
export declare type PromptAnswerShort = UnorderedPrompt<PromptShortYes, PromptShortNo>;
export declare type PromptAnswerDefault = UnorderedPrompt<PromptDefaultYes, PromptOptionalNo> | UnorderedPrompt<PromptDefaultNo, PromptOptionalYes>;
/**
 * @todo - Default should come before optional choice in __Proper versions of type...
 * @todo also: fix type to be proper by default,
 * @todo and: make catch-all types non-default.
 */
export declare type PromptAnswerDefault__Proper = (OrderedPrompt<PromptDefaultYes, PromptOptionalNo>) | (OrderedPrompt<PromptDefaultNo, PromptOptionalYes>);
export declare type PromptAnswerOptional = UnorderedPrompt<PromptOptionalNo, PromptOptionalYes>;
export declare type PromptAnswerAllVersions = PromptAnswerDefault | PromptAnswerOptional | PromptAnswerLong | PromptAnswerShort;
export declare type PromptAnswer = (PromptAnswerLong & PromptAnswerDefault) | (PromptAnswerShort & PromptAnswerDefault) | (PromptAnswerLong & PromptAnswerOptional) | (PromptAnswerShort & PromptAnswerOptional);
export {};
