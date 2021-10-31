import { thisExpression } from "@babel/types"
import { utilPromise } from "./custom-utils"
const {execFile} = utilPromise

/**
 * @overview - File System Operations and The Operations Queue:
 * 
 * All operations that affect the file system, or that have post-program effects, should be processed by the Operation Queue. The Ops-Q processes every external action, e.g.: making files and directories, and makes sure it's completed. But if there is an error of failure, the Ops-Q is disigned to automatically handle it, if it's recoverable. The entire program is run inside of an Ops-Q, so wheen a SIGINT (or simlar EVENT) is received, it will stop itself and clean up everything it was doing. Every Op added to the Ops-Q should have: - base execution locic, - error handling, and - program abort logic (e.g.: SIGINT)
 * 
 * So it should be able to try, retry, and cancel, abort and undo itself. For co-dependant multi-step Ops, and Ops-Batch can be created from multiple Ops, but each Op still needs all of their own logic. If a prereqisite Op fails in the Ops-Q fails, the other Ops that depend on it should be aborted. But in an Ops-Batch, a prerequisite Op can have a Fallback-Op in case it fails. A Fallback-Op should have the same output as the original Op, or have multiple Ops in a Fallback-Ops Set, or "FlOps Set", if it is functionally different. All Ops that depended on a failed Op will become an "XOp".
 * 
 * 
*/


/** @summary a debugging tool that lists all input and output and environment settings */
export type TraceBack = (...x: unknown[]) => Trace | TraceStep 

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

export type TraceStep = {
  lastInput: Input
  nextInput: Input
  output: Output
  localEnvirinment: EnvSettings
  globalEvnironment?: OpsQueueEnvSettings
} & TraceInstanceInfo

type TraceInstancePipeline = {
  isPipeline: boolean
  isFallback: false
  isOp: false
}

type TraceInstanceOp = {
  isOp: boolean
  isPipeline: false
  isFallback: false
}

type TraceInstanceFlOp = {
  isFallback: boolean
  isPipeline: false
  isOp: false
}

export type TraceInstanceInfo = TraceInstanceOp | TraceInstancePipeline | TraceInstanceFlOp


/** */
export type Input = Array<unknown>

export interface Output { 
  exitCode: number
  error: Error
  errorMessage: string
  pipe: Input
  debugBackTrace?: Trace
}


/** */
export interface EnvSettings {
  useDebug?: boolean
  useShell: boolean
  description?: string
}

export interface OpsQueueEnvSettings extends EnvSettings {
  useNestingDebug: boolean
}


/** @summary the Op itself, normally NOT called directly */
export type Op = (...args:OpArgs) => Promise<Output>

/** @summary the thing an Op wraps to call */
export type Operation = (...input: unknown[]) => unknown

/** @summary args for an Op */
export type OpArgs = readonly [func: Function, env: EnvSettings, input: Input]

/** @summary what an Op returns, the data from the wrapped Operation is usually in an async Promise */
export type OpResult = Promise<Output> | Output

/** @summary what an OpCurrier returns, used for calling an Op after giving it all of its args */
export type OpCaller = (input: Input) => OpResult

/** @summary returns an OpCaller, use this to give all of the args to the Op and then use the OpCaller when you're ready to run the Operation */
export type OpCurrier = (func: Function, env: EnvSettings) => OpCaller
//type OpCurrierPreset = (...args:OpArgs) => OpCaller

/** @summary used to hold all of the OpCallers or OpPipelines */
type OpsQueue = Array<QueueableOpLike>

/**
 * @summary Used to hold all of the Fallback OpCallers or OpPipelines.
 *  - NOTE: ALL fallbacks MUST return the SAME data as the ORIGINAL failed Op!
 */
type FlOpsQueue = WeakMap<OpCaller | QueueableOpsPipeline, QueueableOpLike[]>

/** @summary a wrapper to make an OpsPipeline able to be added to another OpsPipeline's OpsQueue */
type QueueableOpsPipeline = (input: Input) => OpResult

/** @summary a callable Op-like function to be used inside of a pipeline */
type QueueableOpLike = QueueableOpsPipeline | OpCaller

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
  start(...x: unknown[]): OpResult
  lock(...x: unknown[]): ImmutablePipeline
}

/** @summary a normal mutable pipeline that hasn't been used yet */
export interface Pipeline<T> extends Omit<ImmutablePipeline, "isMutable"> {
  isMutable: boolean
  pipe?(...x: unknown[]): T
  fallback?(...x: unknown[]): T
}



/**
 * @description - An Op is a neat little wrapper function for error handling.
 * @param func 
 * @param input 
 * @param env 
 * @returns { 
 *  exitCode: number, 
 *  error: Error,
 *  errmsg: string,
 *  pipe: unknown
 * }
 */
const op: Op = async (func: Function, env: EnvSettings, input: Input): Promise<Output> => 
{
  const output: Output = {
    exitCode: 0,
    error: Error("Not a real error: This is just the default error value, before it is set by a real error, if one occures."),
    errorMessage: "",
    pipe: []
  }

  try {
    // try the function operation:
    output.pipe = await func(...input)
  }
  catch (e) {
    try {
      // if a shell fuction failed, in a Bourne-like POSIX-compatible shell, capture its error code using the shell environment variable:
      if (env.useShell){
        // use Bourne-like shell variable to get last command's exit code:
        const shellErrorCode = await execFile("echo $?")
        
        if (shellErrorCode) {
          output.exitCode = Number.parseInt(shellErrorCode.stdout)
        }
      } 
      else {
        /** @todo - figure out how to make more useful error codes. */
        // non-zero means error:
        output.exitCode = 1
      }
    } 
    catch (e){
      // in case the shell caused an error:
      /** @todo - figure out how to make more useful error codes. */
      output.exitCode = 1
    } 
    finally {
      output.error = e as Error
      output.errorMessage += String(output.pipe)
      
      console.error(`ERROR! Failed job: "${env.description}"
      Error message from failed function:
      ${output.errorMessage}`)
    }
  } 
  finally {
    return output
  }
}


// function to save the settings of an Op to be called later:
const OpCurry: OpCurrier = (func: Function, env: EnvSettings): OpCaller => {
  return (input: Input): OpResult => {
    return op(func, env, input)
  }
}



/**
 * @todo Sematic chaining with:
 *  -  .conduet()  to convert to another format the next Op uses.
 *  -  .parallel(...Ops[])  to execute multiple Ops simultaineously when they all make part of the input for the next Op.
 * @todo Add debuggers.
 * @todo Add compat for Ops with preset input.
 */
export class OpsPipeline implements Pipeline<OpsPipeline> {
  isMutable = true 
  private queue: OpsQueue = []
  private fallbackOps: FlOpsQueue = new WeakMap()
  private trace: Trace
  private lastSetOpIndex: number = -1
  private isPipelineFlagSet: WeakSet<QueueableOpsPipeline> = new WeakSet()
  private readonly env: OpsQueueEnvSettings

  constructor(description: string, env?: Omit<EnvSettings | OpsQueueEnvSettings, "description">){
    // set the environment settings changed from the defaults.
    this.env = Object.freeze(Object.assign({ 
      useShell: false, 
      useDebug: false, 
      useNestingDebug: false 
    }, {description}, env))

    // initialise the trace:
    this.trace = {
      pipelineInputs: [],
      pipelineOutputs: [],
      pipelineInstanceInfo: [],
      enqueueChildDescriptions: [],
      enqueueLocalEnvirinments: [],
      enqueueInstanceInfo: [],
      nestedTraces: [],
      globalEvnironment: this.env
    }
  }

  /**
   * @summary used to submit an entire OpsPipeline as a more complicated Op to another OpsPipeline
   * @example 
   * const OpPL = new OpsPipeline(env)
   *  .pipe(fnDoStuff, "stuff")
   *  .pipe(
   *    new OpsPipeline(differentEnv)
   *     .pipe(fnComplicatedStuff, "do this...")
   *     .pipe(fnEvenMoreStuff, "do that...")
   *     // you DON'T call  .start()  here, thats done by the containing pipeline,
   *     // by using  .nest()  only INTERNALLY to make it a compatible format for the containing pipeline
   *  )
   */
  private nest(): QueueableOpsPipeline {
    return async (input: Input) => {
      return this.start(input)
    }
  }

  /** 
   * @summary returns a queueable version of a function or pipeline.
   * - NOTE: also enables Tracing of Operation type, whether Op or Pipeline.
  */
  private formatOp(operation: Operation | OpsPipeline, env: EnvSettings): OpCaller | QueueableOpsPipeline | undefined {
    // check if an OpsPipeline is being added to the OpsQueue:
    if (operation instanceof OpsPipeline) {
      const queueOpsPl = operation.nest()
      this.isPipelineFlagSet.add(queueOpsPl)
      return queueOpsPl
    } 
    // otherwise, treat it as an Op:
    else if (typeof operation === "function"){
      // create Op and then add it to the queue:
      // also add general env settings that weren't overriden by the more specific env.
      return OpCurry(operation, env)
    }
  }

  /** 
   * @description Set all of the Operations to do, along with their descriptions and their more specific envirimoent setttings.
   *  It supports chaining.
   *  - __NOTE__: There __*should*__ always be a useful description for an Operation.
   * @example 
   * const OpPL = new OpsPipeline()
   *  .pipe(fnDoStuff, "stuff")
   *  .pipe(fnMoreStuff, "more stuff")
   *  .pipe(fnFinalStuff, "finishing stuff", specialEnv)
   *  .start()
   * @example 
   * const OpPL = new OpsPipeline(env)
   *  .pipe(fnDoStuff)
   *  .start(initDataInput)
   */
  // pipe?(operation: OpsPipeline): this
  // pipe?(operation: Operation, description: string, envExtras?: Omit<EnvSettings, "description">): this
  pipe?(operation: Operation | OpsPipeline, description: string, envExtras?: Omit<EnvSettings, "description">): this {
    if (!this.isMutable) return this //  throw Error(`Attempted to add fallback Operation to a locked Pipeline.`)
    
    // Op's environment:
    const env: EnvSettings = {...this.env, description, ...envExtras}
    
    // is a function, and isn't a pipeline:
    const isOp = typeof operation === "function"
    // is a pipeline, and isn't a function:
    const isPipeline = operation instanceof OpsPipeline
    
    // add to the queue.
    if (isPipeline || isOp){
      
      // check if an OpsPipeline is being added to the OpsQueue:
      // otherwise, treat it as an Op:
      // create Op and then add it to the queue:
      // also add general env settings that weren't overriden by the more specific env.
      const callableOpLike = this.formatOp(operation, env)
      
      // enqueue it if its valid:
      if (callableOpLike) {
        this.queue.push(callableOpLike)
        
        // increment the counter, since a new Op is being processed:
        this.lastSetOpIndex++
      }
    }
    
    // add some tracing info:
    this.trace.enqueueChildDescriptions.push(description)
    this.trace.enqueueLocalEnvirinments.push(env)
    this.trace.enqueueInstanceInfo.push({
      isOp,
      isPipeline,
      isFallback: false
    } as TraceInstanceInfo)

    // return is used for chaining:
    return this
  }
  
  /** 
   * @description Set the fallback Operation(s) to use as a fail-safe, in case the initial Operation fails.
   *  Can be another Operation or an entire Operation Pipeline.
   *  - __NOTE__: The fallbacks will only work as a fail-safe if the RETURN VAULES are the SAME as the original Operation, or they return data that STILL USABLE by the NEXT Operation.
   * @example 
   * const OpPL = new OpsPipeline()
   *  .pipe(fnRiskyCouldFail, "caution statement")
   *  .fallback(fnLessRiskyStuff, "umm... well, this should work...")
   *  .start()
   * @example 
   * const OpPL = new OpsPipeline(env)
   *  .pipe(fnDangerousStuff, "caution")
   *  .fallback(
   *    new OpsPipeline(differentEnv)
   *     .pipe(fnSaferStuff, "do this instead...")
   *     .pipe(fnMoreSaferStuff, "doing this also...")
   *     // you DON'T call  .start()  here, thats done by the containing pipeline.
   *  )
   *  .start(initDataInput)
   * @example 
   * const OpPL = new OpsPipeline()
   *  .pipe(fnRiskyCouldFail, "caution statement")
   *  .fallback(fnLessRiskyStuff, "umm... well, this should work...")
   *  .pipe(fnDangerousStuff, "more caution")
   *  .fallback(
   *    new OpsPipeline(differentEnv)
   *     .pipe(fnSaferStuff, "do this instead...")
   *     .pipe(fnMoreSaferStuff, "doing this also...")
   *     .pipe(fnConvertToFormat, "it DID work!")
   *     // you DON'T call  .start()  here, thats done by the containing pipeline.
   *  )
   *  .pipe(fnDoAnyways, "just doing my thing...")
   *  .start(initDataInput)
   * @fails If the pipeline has already been locked, it will throw an error.
   * @fails fallback without preceeding Op.
   * - NOTE: There cannot __*EVER*__ be a fallback before any Ops were defined.
   *  As it will not actually be called!
   * @example
   * // do NOT do this:
   * const OpPL = new OpsPipeline(env) // there should ALWAYS be an Op before a fallback!
   *  .fallback( // <- uh oh... 
   *    new OpsPipeline(differentEnv) // <- NOT executed
   *     .pipe(fnSaferStuff, "do this instead...") // <- also NOT executed
   *     .pipe(fnMoreSaferStuff, "doing this also...") // <- still NOT executed
   *  )
   *  .start(input) // <- THIS WILL NOT DO ANYTHING!
   */
  // fallback?(fallback: OpsPipeline): this
  // fallback?(fallback: Operation, description: string, envExtras?: Omit<EnvSettings, "description">): this
  fallback?(fallback: OpsPipeline | Operation, description: string, envExtras?: Omit<EnvSettings, "description">): this {
    if (!this.isMutable) return this //  throw Error(`Attempted to add fallback Operation to a locked Pipeline.`)
    if (this.queue.length > 0 && this.lastSetOpIndex >= 0 && this.lastSetOpIndex < this.queue.length) return this //  throw Error(`Attempted to add fallback Operation without a setting a preceeding Operation in the Pipeline.`)
    
    // Op's environment:
    const env: EnvSettings = {...this.env, description, ...envExtras}
    
    // is a function, and isn't a pipeline:
    const isOp = typeof fallback === "function"
    // is a pipeline, and isn't a function:
    const isPipeline = fallback instanceof OpsPipeline
    
    // add to the FlOps queue.
    if (isPipeline || isOp){
      // convert to valid Op-like:
      // check if an FlOpsPipeline is being added to the FlOpsQueue.
      // otherwise, treat it as an FlOp.
      // create FlOp and then add it to the queue.
      // also add general env settings that weren't overriden by the more specific env.
      const enqueueable = this.formatOp(fallback, env)
  
      // enqueue if valid:
      if (enqueueable) {
        
        // the Op to make a fallback for:
        const targetForFailsafe = this.queue[this.lastSetOpIndex]

        // the array of FlOps for the target Op:
        const flOpsList: QueueableOpLike[] | undefined = this.fallbackOps.get(targetForFailsafe)

        // it therre is already an array, append to it:
        if (flOpsList) {
          // add FlOp to array of fallbacks for the target Op:
          flOpsList.push(enqueueable)
        }
        // create an array to append to:
        else {
          // create an array of FlOps for the target Op:
          // then add FlOp to array of fallbacks for the target Op,
          // optional chaining is used to satify TypeScript, instaed of using an "as Type" expression.
          this.fallbackOps.set(targetForFailsafe, []).get(targetForFailsafe)?.push(enqueueable)
        }
      }
    }

    
    // add some tracing info:
    this.trace.enqueueChildDescriptions.push(description)
    this.trace.enqueueLocalEnvirinments.push(env)
    this.trace.enqueueInstanceInfo.push({
      isOp,
      isPipeline,
      isFallback: true
    } as TraceInstanceInfo)

    // return used for chaining:
    return this
  }

  /**
   * @summary Make the pipeline IMMUTABLE.
   * @returns the pipeline WITHOUT a  .pipe()  ,  .fallback()  , or a modifiable OpsQueue.
   */
  lock(): ImmutablePipeline {
    // prevent any more Ops from being added to the pipeline
    // by either 1): removing all Op adding functions from the pipeline
    delete this.pipe
    delete this.fallback
    // or 2): preventing the OpsQueue and FlOpsQueue from being appended at either the Op adding methods's side, or the Array-like holders themselves.
    this.isMutable = false
    Object.freeze(this.queue) // looking into using  Object.freeze()
    
    // return the unmodifiable object, use for calling  .start()  later on:
    return this as ImmutablePipeline
  }

  /** 
   * @summary Takes an Array of arguments to give to the Operation being piped to in the Pipeline 
   */
  async start(input: Input): Promise<Output> {
    // prevent any more Ops from being added to the pipeline
    // by removing all Op adding functions from the pipeline,
    // and preventing the OpsQueue and FlOpsQueue from being appended at either the Op adding methods's side, or the Array-like holders themselves.
    this.lock()

    // returns final output, or input for parent pipeline if this is a nested Op
    let pipelineOutputValve: Output = {
      exitCode: 1,
      error: Error("Not a real error: Default preset."),
      errorMessage: "Operations Pipeline did change this default non-error message.",
      pipe: input
    }
    
    try {
      // loop through every Op in the Queue, and put it in the Pipeline:
      outsideLoopBlockLabel: for (const nextOp of this.queue) {
        
        // save output:
        const output = await nextOp(input)
        pipelineOutputValve.exitCode = output.exitCode
        
        if (this.env.useDebug) {
          // save trace info for Op:
          this.trace.pipelineOutputs.push(output)
          this.trace.pipelineInputs.push(input)
          
          // used to get TypeScript intellisence:
          type dbTraceKey = keyof Output;
          // save nested debug trace:
          if (this.env.useNestingDebug && "debugBackTrace" as dbTraceKey in output) {
            // as expression used to satisfy TypeScript:
            this.trace.nestedTraces?.push(output.debugBackTrace as Trace)
          }
        }
        
        // exited successfully:
        if (output.exitCode === 0) {
          // save to pipe to use later:
          input = output.pipe
          
          if (this.env.useDebug) {
            // save trace for a succesful Op:
            const isPipeline = this.isPipelineFlagSet.has(nextOp)
            
            this.trace.pipelineInstanceInfo.push({
              isFallback: false,
              isOp: !isPipeline,
              isPipeline
            } as TraceInstanceInfo)
          }
        }
        // use FlOps, it there's an entry:
        else if (this.fallbackOps.has(nextOp)) {
          // counter for array index:
          let flIndex = 0

          // fallback Ops:
          const flOpsQueue = this.fallbackOps.get(nextOp) as QueueableOpLike[]

          // try each FlOp in the list of fallback Ops to try, to see if it is successful:
          for (const nextFlOp of flOpsQueue) {
            // save output from the next fallback to try to see if it succeeds:
            const flOutput = await nextFlOp(input)
            pipelineOutputValve.exitCode = flOutput.exitCode
            
            if (this.env.useDebug) {
              // save trace info for FlOp:
              this.trace.pipelineInputs.push(input)
              this.trace.pipelineOutputs.push(flOutput)
            }

            // use FlOp fallback if it exited successfully:
            if (flOutput.exitCode === 0) {
              
              if (this.env.useDebug) {
                // save trace for a succesful Op:
                const isPipeline = this.isPipelineFlagSet.has(nextFlOp)
                this.trace.pipelineInstanceInfo.push({
                  isFallback: true,
                  isOp: !isPipeline,
                  isPipeline
                } as TraceInstanceInfo)
              }

              // save to pipe to use later:
              input = output.pipe

              // leave loop since the fallback worked:
              break
            }
            // if NONE of the fallbacks were successful, error out on the last index:
            else if (flIndex === flOpsQueue.length - 1) {
              // give up on the fallback and entire queue, and error out:
              break outsideLoopBlockLabel
              flOutput
            }
          }
        }
        else {
          // give up on the queue, and error out:
          break
        }
      }
      // nothing errored out:
      // a value of 0 means no errors.
      pipelineOutputValve.exitCode = 0
      pipelineOutputValve.errorMessage = "Not an real error: Successfully finished without any unmanageable errors."
    }
    catch (e) {
      // set error:
      if (e instanceof Error) pipelineOutputValve.error = e
      else pipelineOutputValve.errorMessage = String(e)
      
      // non-zero value means an error occured
      pipelineOutputValve.exitCode = 1
    }
    finally {
      // save debugging trace:
      if (this.env.useDebug) pipelineOutputValve.debugBackTrace = this.trace
      pipelineOutputValve.pipe = input

      // return the finished output:
      return pipelineOutputValve
    }
  }
}
