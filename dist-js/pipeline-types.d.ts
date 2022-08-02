/**
 * @fileoverview - The types used by the OpsQueue.
 * @exports
 */
/**
 * @typedef { Array<unknown> } Input
 */
export declare type Input = unknown[];
/**
 * @typedef { Object } Output - The return value of any `Op` or `Pipeline`.
 * @property { number } exitCode - Uses the shell convension of a `0` meaning a succesful exit and a non-zero integer meaning an error occured.
 * @property { Error } Error - The Error object thrown.
 * @property { string } errorMsg - The formatted error message of the Error, made by an `Op` or `Pipeline`.
 * @property { Input } pipe - The value returned by the `Operation`.
 * @property { Trace } - debugBackTrace
 */
export interface Output {
    exitCode: number;
    error: Error;
    errorMsg: ErrMsgHeader | "";
    pipe: Input;
    debugBackTrace?: Trace;
}
export declare type TraceBack = (startIndex?: number, endIndex?: number) => Trace | TraceStep;
export declare type TraceStep = {
    lastInput: Input;
    nextInput: Input;
    output: Output;
    localEnvirinment: EnvSettings;
    globalEvnironment?: OpsQueueEnvSettings;
} & TraceInstanceInfo;
declare type TraceInstancePipeline = {
    isPipeline: true;
    isFallback: boolean;
    isOp: false;
};
declare type TraceInstanceOp = {
    isOp: true;
    isPipeline: false;
    isFallback: boolean;
};
declare type TraceInstanceFlOp = (TraceInstanceOp | TraceInstancePipeline) & {
    isFallback: true;
};
/**
 * @summary describes whether an `Op` or nested `Pipeline` was ran in the `Pipeline`, and whether it was a fallback from another `Operation` in a preceeding `Op` or `Pipeline`.
 * @typedef { Object } TraceInstanceInfo
 * @property { boolean } isOp
 * @property { boolean } isPipeline
 * @property { boolean } isFallback
 */
export declare type TraceInstanceInfo = TraceInstanceOp | TraceInstancePipeline | TraceInstanceFlOp;
/**
 * @summary a debugging tool that lists all input and output and environment settings
 * @typedef { Object } Trace
 * @property { Array<Input> } pipelineInputs
 * @property { Array<Output> } pipelineOutputs
 * @property { Array<TraceInstanceInfo> } pipelineInstanceInfo
 */
export declare type Trace = {
    pipelineInputs: Input[];
    pipelineOutputs: Output[];
    pipelineInstanceInfo: TraceInstanceInfo[];
    enqueueChildDescriptions: string[];
    enqueueLocalEnvirinments: EnvSettings[];
    enqueueInstanceInfo: TraceInstanceInfo[];
    globalEvnironment: OpsQueueEnvSettings;
    nestedTraces?: Trace[];
};
/** @summary the behavioral settings for the  `Op`  and the  `OpsPipeline` */
export interface EnvSettings {
    useShell?: boolean;
    /** @todo */
    useSilent?: boolean;
    /** @todo */
    useLog?: boolean;
    useVerbose?: boolean;
    useDebug?: boolean;
    useLoopback?: boolean;
    description?: string;
}
export interface OpsQueueEnvSettings extends EnvSettings {
    /** @todo */
    useNestingSilent?: boolean;
    /** @todo */
    useNestingLog?: boolean;
    useNestingVerbose?: boolean;
    useNestingDebug?: boolean;
    useEmptyLoopback?: boolean;
}
/**
 * @summary the Op itself, normally NOT called directly
 * @
 */
export declare type Op = (fn: Operation, input: Input, env?: EnvSettings) => Promise<Output>;
/**
 * @summary The thing an Op wraps to call with error handling and also supports async Functions.
 * - NOTE currently has litte to no support for Generators of AsyncGenerator Functions.
 * @returns An Array, or a value that will be put in an Array, in order to be piped.
 */
export declare type Operation = (...input: any[]) => any[] | any;
/** @summary args for an Op */
export declare type OpArgs = Parameters<Op>;
/** @summary what an Op returns, the data from the wrapped Operation is usually in an async Promise */
export declare type OpResult = Promise<Output> | Output;
/** @summary what an OpCurrier returns, used for calling an Op after giving it all of its args */
export declare type OpCaller = (input: Input) => OpResult;
/** @summary returns an OpCaller, use this to give all of the args to the Op and then use the OpCaller when you're ready to run the Operation */
export declare type OpCurrier = (fn: OpArgs[0], env?: OpArgs[2]) => OpCaller;
/** @summary used to hold all of the OpCallers or OpPipelines */
export declare type OpsQueue = Array<QueueableOpLike>;
/**
 * @summary Used to hold all of the Fallback OpCallers or OpPipelines.
 *  - NOTE: ALL fallbacks MUST return the SAME data as the ORIGINAL failed Op!
 */
export declare type FlOpsQueue = WeakMap<OpCaller | QueueableOpsPipeline, QueueableOpLike[]>;
/** @summary a wrapper to make an OpsPipeline able to be added to another OpsPipeline's OpsQueue */
export declare type QueueableOpsPipeline = (input: Input) => OpResult;
/** @summary a callable Op-like function to be used inside of a pipeline */
export declare type QueueableOpLike = QueueableOpsPipeline | OpCaller;
/** @summary a pipeline that has already been set, and does NOT have  .pipe()  or  .fallback()  methods that change it. */
export interface ImmutablePipeline {
    isMutable: false;
    traceback(...arg0: unknown[]): ReturnType<TraceBack> | undefined;
    start(...arg0: any[]): OpResult;
    lock(...arg0: unknown[]): ImmutablePipeline;
}
/** @summary a normal mutable pipeline that doesn't have any Ops yet, and hence can't use fallback Ops */
export interface EmptyPipeline<T> extends Omit<ImmutablePipeline, "isMutable"> {
    isMutable: boolean;
    pipe(...arg0: unknown[]): T;
}
/** @summary a normal mutable pipeline that has at least one Op, and can use fallback Ops */
export interface Pipeline<T> extends EmptyPipeline<T> {
    fallback(...arg0: unknown[]): T;
}
/** @summary USE THE COMMENTED TYPES TO CONFIRM STYLE: */
declare type ErrMsgHeaderDescriptionSource = string;
declare type Br = "\n";
/** @summary end of style types. */
declare type ErrMsgHeaderType = `ERROR! Error type: ${Error["name"] | ""}${Br}`;
declare type ErrMsgHeaderDescription = `Name of the ${ErrMsgHeaderDescriptionSource} that failed: "${(EnvSettings["description"] & string) | ""}"${Br}`;
declare type ErrMsgHeaderErrNo = `Error exit code: ${Output["exitCode"]}${Br}`;
declare type ErrMsgHeaderMsgExt = `Error output: ${ReturnType<Error["toString"]> | ""}${string | ""}`;
declare type ErrMsgHeader = `${ErrMsgHeaderType}${ErrMsgHeaderDescription}${ErrMsgHeaderErrNo}${ErrMsgHeaderMsgExt}`;
export {};
