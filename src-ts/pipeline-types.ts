/**
 * @fileoverview - The types used by the OpsQueue.
 * @exports
 */



/**
 * @typedef { Array<unknown> } Input 
 */
export type Input = unknown[]

/**
 * @typedef { Object } Output - The return value of any `Op` or `Pipeline`.
 * @property { number } exitCode - Uses the shell convension of a `0` meaning a succesful exit and a non-zero integer meaning an error occured.
 * @property { Error } Error - The Error object thrown.
 * @property { string } errorMsg - The formatted error message of the Error, made by an `Op` or `Pipeline`.
 * @property { Input } pipe - The value returned by the `Operation`.
 * @property { Trace } - debugBackTrace
 */
export interface Output { 
  exitCode: number
  error: Error
  errorMsg: ErrMsgHeader | ""
  pipe: Input
  debugBackTrace?: Trace
}


export type TraceBack = (startIndex?: number, endIndex?: number) => Trace | TraceStep 
export type TraceStep = {
  lastInput: Input
  nextInput: Input
  output: Output
  localEnvirinment: EnvSettings
  globalEvnironment?: OpsQueueEnvSettings
} & TraceInstanceInfo

type TraceInstancePipeline = {
  isPipeline: true
  isFallback: boolean
  isOp: false
}

type TraceInstanceOp = {
  isOp: true
  isPipeline: false
  isFallback: boolean
}

type TraceInstanceFlOp = (TraceInstanceOp | TraceInstancePipeline) & {
  isFallback: true
}

/**
 * @summary describes whether an `Op` or nested `Pipeline` was ran in the `Pipeline`, and whether it was a fallback from another `Operation` in a preceeding `Op` or `Pipeline`.
 * @typedef { Object } TraceInstanceInfo
 * @property { boolean } isOp
 * @property { boolean } isPipeline
 * @property { boolean } isFallback
 */
export type TraceInstanceInfo = TraceInstanceOp | TraceInstancePipeline | TraceInstanceFlOp

/** 
 * @summary a debugging tool that lists all input and output and environment settings 
 * @typedef { Object } Trace
 * @property { Array<Input> } pipelineInputs
 * @property { Array<Output> } pipelineOutputs
 * @property { Array<TraceInstanceInfo> } pipelineInstanceInfo
 */
export type Trace = {
  pipelineInputs: Input[]
  pipelineOutputs: Output[]
  pipelineInstanceInfo: TraceInstanceInfo[]
  enqueueChildDescriptions: string[]
  enqueueLocalEnvirinments: EnvSettings[]
  enqueueInstanceInfo: TraceInstanceInfo[]
  globalEvnironment: OpsQueueEnvSettings
  nestedTraces?: Trace[]
}


/** @summary the behavioral settings tfor the  `Op`  and the  `OpsPipeline` */
export interface EnvSettings {
  useDebug?: boolean
  useShell?: boolean
  description?: string
}

export interface OpsQueueEnvSettings extends EnvSettings {
  useNestingDebug?: boolean
}


/** 
 * @summary the Op itself, normally NOT called directly
 * @
 */
export type Op = (fn: Operation, input: Input, env?: EnvSettings) => Promise<Output>

/** 
 * @summary The thing an Op wraps to call with error handling and also supports async Functions.
 * - NOTE currently has litte to no support for Generators of AsyncGenerator Functions.
 * @returns An Array, or a value that will be put in an Array, in order to be piped.
 */
export type Operation = (...input: unknown[]) => unknown[] | unknown

/** @summary args for an Op */
export type OpArgs = Parameters<Op>

/** @summary what an Op returns, the data from the wrapped Operation is usually in an async Promise */
export type OpResult = Promise<Output> | Output

/** @summary what an OpCurrier returns, used for calling an Op after giving it all of its args */
export type OpCaller = (input: Input) => OpResult

/** @summary returns an OpCaller, use this to give all of the args to the Op and then use the OpCaller when you're ready to run the Operation */
export type OpCurrier = (fn: OpArgs[0], env?: OpArgs[2]) => OpCaller
//type OpCurrierPreset = (...args:OpArgs) => OpCaller

/** @summary used to hold all of the OpCallers or OpPipelines */
export type OpsQueue = Array<QueueableOpLike>

/**
 * @summary Used to hold all of the Fallback OpCallers or OpPipelines.
 *  - NOTE: ALL fallbacks MUST return the SAME data as the ORIGINAL failed Op!
 */
export type FlOpsQueue = WeakMap<OpCaller | QueueableOpsPipeline, QueueableOpLike[]>

/** @summary a wrapper to make an OpsPipeline able to be added to another OpsPipeline's OpsQueue */
export type QueueableOpsPipeline = (input: Input) => OpResult

/** @summary a callable Op-like function to be used inside of a pipeline */
export type QueueableOpLike = QueueableOpsPipeline | OpCaller

// /** @summary used to hold all of the previous OpCaller's or OpPipeline's input args and the returned output data */
// type OpsQueueValve = Array<ValveEntry>

// /** @summary used to hold one OpCaller's or OpPipeline's returned output data and its input args */
// type ValveEntry = {
//   output: Output
//   lastInput: Input
// }


/** @summary a pipeline that has already been set, and does NOT have  .pipe()  or  .fallback()  methods that change it. */
export interface ImmutablePipeline {
  isMutable: false
  traceback(...arg0: unknown[]): ReturnType<TraceBack> | undefined
  start(...arg0: unknown[]): OpResult
  lock(...arg0: unknown[]): ImmutablePipeline
}

/** @summary a normal mutable pipeline that doesn't have any Ops yet, and hence can't use fallback Ops */
export interface EmptyPipeline<T> extends Omit<ImmutablePipeline, "isMutable"> {
  isMutable: boolean
  pipe(...arg0: unknown[]): T
}

/** @summary a normal mutable pipeline that has at least one Op, and can use fallback Ops */
export interface Pipeline<T> extends EmptyPipeline<T> {
  fallback(...arg0: unknown[]): T
}
  

/** @summary USE THE COMMENTED TYPES TO CONFIRM STYLE: */
// type SOpt = "s"|""
// type SpaceOpt = " "|""
// type FlOpt = `Fallback${SpaceOpt}` | ""
// type OpOpt = `${"Operation"|"Op"}${SOpt}${SpaceOpt}` | ""
// type PlOpt = `Pipeline${SOpt}` | ""
type ErrMsgHeaderDescriptionSource = string // & `${FlOpt}${OpOpt}${PlOpt}`
type Br = "\n" //| "\r\n"
/** @summary end of style types. */
type ErrMsgHeaderType = `ERROR! Error type: ${Error["name"]|""}${Br}`
type ErrMsgHeaderDescription = `Name of the ${ErrMsgHeaderDescriptionSource} that failed: "${(EnvSettings["description"] & string)|""}"${Br}`
type ErrMsgHeaderErrNo = `Error exit code: ${Output["exitCode"]}${Br}`
type ErrMsgHeaderMsgExt = `Error output: ${ReturnType<Error["toString"]>|""}${string|""}`
type ErrMsgHeader = `${ErrMsgHeaderType}${ErrMsgHeaderDescription}${ErrMsgHeaderErrNo}${ErrMsgHeaderMsgExt}`

