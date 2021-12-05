export * from "./pipeline-types"
import type { 
  Input, Output, 
  Operation, Op, OpCurrier, OpCaller, OpResult, Pipeline, ImmutablePipeline,
  OpsQueue, FlOpsQueue, QueueableOpLike, QueueableOpsPipeline, 
  Trace, TraceInstanceInfo, TraceBack, EnvSettings, OpsQueueEnvSettings, /* EmptyPipeline */
} from "./pipeline-types"

/** 
 * @fileoverview - File System Operations and The Operations Queue: *  * All operations that affect the file system, or that have post-program effects, should be processed by the Operation Queue. The Ops-Q processes every external action, e.g.: making files and directories, and makes sure it's completed. But if there is an error of failure, the Ops-Q is disigned to automatically handle it, if it's recoverable. The entire program is run inside of an Ops-Q, so wheen a SIGINT (or simlar EVENT) is received, it will stop itself and clean up everything it was doing. Every Op added to the Ops-Q should have: - base execution locic, - error handling, and - program abort logic (e.g.: SIGINT) *  * So it should be able to try, retry, and cancel, abort and undo itself. For co-dependant multi-step Ops, and Ops-Batch can be created from multiple Ops, but each Op still needs all of their own logic. If a prereqisite Op fails in the Ops-Q fails, the other Ops that depend on it should be aborted. But in an Ops-Batch, a prerequisite Op can have a Fallback-Op in case it fails. A Fallback-Op should have the same output as the original Op, or have multiple Ops in a Fallback-Ops Set, or "FlOps Set", if it is functionally different. All Ops that depended on a failed Op will become an "XOp". *  *  
 */  


const defDesc = "No Description"
/*
const defaultOutputErrMsg: Output["errorMsg"] = `ERROR! Error type: Error
Name of the Operation that failed: "${defDesc}"
Error exit code: 1
Error output:  `
*/
const defDbg = false
const defSh = false
/**
 * @description - An Op is a neat little wrapper function for error handling.
 * @param fn the function to wrap in the Op
 * @param input the array of arguments given to the function, each index is spread to the function's parameter:  `func(...input[])` .
 * @param environment 
 * @returns {Promise<Output>} 
 */
export const op: Op = async (fn: Operation, input: Input, { useShell = defSh, useDebug = defDbg, description = defDesc }: EnvSettings = { useShell: defSh, useDebug: defDbg , description: defDesc }): Promise<Output> => {
  
  // the return value:
  const output: Output = {
    exitCode: 1,
    error: Error(),
    errorMsg: "",
    pipe: []
  }
  
  try {
    // try the function operation:
    const result = await fn(...input)

    // save the output to the pipe, and make it an array if it is not an array:
    output.pipe = result instanceof Array ? result : [ result ]

    // it did not error, so it was successful:
    output.exitCode = 0
  }
  catch (e) {
    /** @todo - figure out how to make more useful error codes. */
    // non-zero means error:
    output.exitCode = 1
    
    // if a shell fuction failed, save the  `child_process`  Error exit code status:
    if (useShell && typeof e === "object" && e !== null) {
      if ("status" in e && typeof (e as {status: number}).status === "number") {
        output.exitCode = (e as Record<string,unknown> & {status: number}).status // as statement used to satisfy TS.
      }
      else if ("code" in e && typeof (e as {code: number}).code === "number") {
        output.exitCode = (e as Record<string,unknown> & {code: number}).code // as statement used to satisfy TS.
      }
    }

    // set Error object to thrown error:
    if (e instanceof Error) output.error = e
    
    // set err msg:
    output.errorMsg = 
`ERROR! Error type: ${output.error.name}
Name of the Operation that failed: "${description}"
Error exit code: ${output.exitCode}
Error output: ${output.error}`
    
    // output debug info:
    if (useDebug) console.error(output.errorMsg)
  } 
  finally {
    return output
  }
}


// function to save the settings of an Op to be called later:
export const opCurry: OpCurrier = (fn: Operation, env?: EnvSettings): OpCaller => {
  return (input: Input): OpResult => {
    return op(fn, input, env)
  }
}



/**
 * @todo Sematic chaining with:
 *  -  .conduet()  to convert to another format the next Op uses.
 *  -  .parallel(...Ops[])  to execute multiple Ops simultaineously when they all make part of the input for the next Op.
 *  -  .abort()  to stop an OpsPipeline from continuing, (a clean exit after receiving a SIGINT).
 * @todo Add debuggers.
 * @todo Add compat for Ops with preset input.
 */
export class OpsPipeline implements Pipeline<OpsPipeline> {
  isMutable = true 
  private queue: OpsQueue = []
  private fallbackOps: FlOpsQueue = new WeakMap()
  private trace?: Trace
  private isPipelineFlagSet: WeakSet<QueueableOpsPipeline> = new WeakSet()
  private readonly env: OpsQueueEnvSettings

  constructor(description: string, env?: Omit<OpsQueueEnvSettings, "description">){
    
    // set the environment settings changed from the defaults.
    // freeze the object to prevet it from being changed while the pipeline is running.
    this.env = Object.freeze(Object.assign({ 
      useShell: false, 
      useDebug: false, 
      useNestingDebug: false,
      description
    },
      env,
      (env && env.useNestingDebug && !env.useDebug /*is falsy*/ && {
        useDebug: env.useNestingDebug // <- Here to prevent bug where nested debug isn't collected because `useDebug` isn't also true.
      })
    ))

    // conditional is used to not save unused debug info:
    if (this.env.useDebug) {
      // initialise the trace:
      this.trace = {
        pipelineInputs: [],
        pipelineOutputs: [],
        pipelineInstanceInfo: [],
        enqueueChildDescriptions: [],
        enqueueLocalEnvirinments: [],
        enqueueInstanceInfo: [],
        globalEvnironment: this.env
      }
      // conditional is used to reduce unused debug info:
      if (this.env.useNestingDebug) this.trace.nestedTraces = []
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
    // prevent any more Ops from being added after the entire Pipeline is added to another Pipeline,
    // and return callable version.
    return async (input: Input) => {
      return this.lock().start(input)
    }
  }

  /** 
   * @summary returns a queueable version of a function or pipeline.
   * - NOTE: also enables Tracing of Operation type, whether Op or Pipeline.
  */
  private formatOp(operation: Operation | OpsPipeline, env: EnvSettings): OpCaller | QueueableOpsPipeline | undefined {
    // check if an OpsPipeline is being added to the OpsQueue:
    if (operation instanceof OpsPipeline) {
      // lock the pipeline and make it callable:
      const queueOpsPl = operation.nest()

      // used by the debugger:
      this.isPipelineFlagSet.add(queueOpsPl)
      
      return queueOpsPl
    } 
    // otherwise, treat it as an Op:
    else if (typeof operation === "function"){
      // create Op and then add it to the queue:
      // also add general env settings that weren't overriden by the more specific env.
      return opCurry(operation, env)
    }
    // do nothing if it can't be used in the pipeline...
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
  pipe(operation: OpsPipeline): this
  pipe(operation: Operation, description: string, envExtras?: Omit<EnvSettings, "description">): this
  pipe(operation: Operation | OpsPipeline, description?: string, envExtras?: Omit<EnvSettings, "description">): this {
    if (!this.isMutable) throw Error(`Attempted to add fallback Operation to a locked Pipeline.`) // return this
    
    // is a function, and isn't a pipeline:
    const isOp = typeof operation === "function"
    // is a pipeline, and isn't a function:
    const isPipeline = operation instanceof OpsPipeline
    
    // Op's environment:
    // and if the operation is a nested Pipeline, use the Pipeline's description.
    const env: EnvSettings = {
      ...this.env, 
      description: isPipeline ? operation.env.description : description, 
      ...envExtras
    }
    

    // add to the queue.
    if (isPipeline || isOp){
      
      // check if an OpsPipeline is being added to the OpsQueue:
      // otherwise, treat it as an Op:
      // create Op and then add it to the queue:
      // also add general env settings that weren't overriden by the more specific env.
      const callableOpLike = this.formatOp(operation, env)
      
      // enqueue it if its valid:
      if (callableOpLike) this.queue.push(callableOpLike)
    }
    
    // prevent unused debug info from being created:
    if (this.env.useDebug && this.trace && typeof this.trace === "object") {
      // add some tracing info:
      this.trace.enqueueChildDescriptions.push(description ?? (isPipeline ? (operation.env.description ?? "") : ""))
      this.trace.enqueueLocalEnvirinments.push(env)
      this.trace.enqueueInstanceInfo.push({
        isOp,
        isPipeline,
        isFallback: false
      } as TraceInstanceInfo)
    }

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
  fallback(fallback: OpsPipeline): this
  fallback(fallback: Operation, description: string, envExtras?: Omit<EnvSettings, "description">): this
  fallback(fallback: OpsPipeline | Operation, description?: string, envExtras?: Omit<EnvSettings, "description">): this {
    if (!this.isMutable) throw Error(`Attempted to add fallback Operation to a locked Pipeline.`) // return this
    if (this.queue.length < 1) return this //  throw Error(`Attempted to add fallback Operation without a setting a preceeding Operation in the Pipeline.`)
    
    // is a function, and isn't a pipeline:
    const isOp = typeof fallback === "function"
    // is a pipeline, and isn't a function:
    const isPipeline = fallback instanceof OpsPipeline
    
    // Op's environment:
    // and if the operation is a nested Pipeline, use the Pipeline's description.
    const env: EnvSettings = {
      ...this.env, 
      description: isPipeline ? fallback.env.description : description, 
      ...envExtras
    }

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
        
        // make a fallback for the last Op added to the pipeline's queue:
        const targetForFailsafe = this.queue[this.queue.length - 1]

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

    // prevent unused debug info from being created:
    if (this.env.useDebug && this.trace && typeof this.trace === "object") {
      // add some tracing info:
      this.trace.enqueueChildDescriptions.push(description ?? (isPipeline ? (fallback.env.description ?? "") : ""))
      this.trace.enqueueLocalEnvirinments.push(env)
      this.trace.enqueueInstanceInfo.push({
        isOp,
        isPipeline,
        isFallback: true
      } as TraceInstanceInfo)
    }

    // return used for chaining:
    return this
  }

  /**
   * @summary Make the pipeline IMMUTABLE. Makes `.pipe` and `.fallback` undefined on the object itself, so it will not call the methods on the prototype chain. It also uses `Object.freeze()` to make the pipeline queues immutable.
   * @returns the pipeline WITHOUT the `.pipe()` or `.fallback()` functions first in the prototype chain or a modifiable OpsQueue.
   */
  lock(): ImmutablePipeline {
    // prevent any more Ops from being added to the pipeline:
    // set the flag to false, which will prevent methods from adding to the pipeline:
    this.isMutable = false

    // and freeze the queues:
    Object.freeze(this.queue)
    Object.freeze(this.fallbackOps)

    // // the methods that add to the pipeline queue are on the `.prototype` or `__proto__`,
    // // so make properties irectly oin the object
    // this.pipe = undefined
    // this.fallback = undefined
    
    // return the unmodifiable object, use for calling  .start()  later on:
    return this as ImmutablePipeline
  }

  /**
   * @summary Returns the debugging trace.
   */
  traceback(): ReturnType<TraceBack> | undefined {
    
    return this.trace
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
    const pipelineOutputValve: Output = {
      exitCode: 1,
      error: Error(),//Error("Not a real error: Default preset."),
      errorMsg: "",//"Operations Pipeline did change this default non-error message.",
      pipe: input
    }
    
    //  try..catch  is used for two reasons:
    // 1): to use a  throw  statement to error out of loop after an Op reports unrecoverable failure an there's no fallback for it.
    // 2): just in case the Op throws, even though Ops should not throw any errors as they have a  try..catch  for themselves.
    try {
      // loop through every Op in the Queue, and put it in the Pipeline:
      for (const nextOp of this.queue) {
        
        // save output:
        const output = await nextOp(input)

        pipelineOutputValve.exitCode = output.exitCode
        
        if (this.env.useDebug && this.trace instanceof Object) {
          // save trace info for Op:
          this.trace.pipelineOutputs.push(output)
          this.trace.pipelineInputs.push(input)
          
          // used to get TypeScript intellisence:
          type dbTraceKey = keyof Output;
          // save nested debug trace:
          if (this.env.useNestingDebug && "debugBackTrace" as dbTraceKey in output) {
            // the  as Type  expression is used to satisfy TypeScript:
            this.trace.nestedTraces?.push(output.debugBackTrace as Trace)
          }
        }
        
        // exited successfully:
        if (output.exitCode === 0) {
          // save to pipe to use later:
          input = output.pipe
          
          if (this.env.useDebug && this.trace instanceof Object) {
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
            
            if (this.env.useDebug && this.trace && typeof this.trace === "object") {
              // save trace info for FlOp:
              this.trace.pipelineInputs.push(input)
              this.trace.pipelineOutputs.push(flOutput)
            }

            // use FlOp fallback if it exited successfully:
            if (flOutput.exitCode === 0) {
              
              if (this.env.useDebug && this.trace && typeof this.trace === "object") {
                // save trace for a succesful Op:
                const isPipeline = this.isPipelineFlagSet.has(nextFlOp)
                this.trace.pipelineInstanceInfo.push({
                  isFallback: true,
                  isOp: !isPipeline,
                  isPipeline
                } as TraceInstanceInfo)
              }

              // save to pipe to use later:
              input = flOutput.pipe

              // leave the fallback loop since the fallback worked, and return to the main Op loop:
              break
            }
            // if NONE of the fallbacks were successful, error out on the last index:
            else if (flIndex === flOpsQueue.length - 1) {
              // give up on the fallback and entire queue, and error out:
              pipelineOutputValve.errorMsg = flOutput.errorMsg
              throw new Error(`ERROR: Operations Pipeline had an unrecoverable failure: The main Operation failed, and every fallback Operation for it also failed.`) 
            }
          }
        }
        else {
          // give up on the queue, and error out:
          pipelineOutputValve.errorMsg = output.errorMsg
          throw new Error(`ERROR: Operations Pipeline had an unrecoverable failure: The main Operation failed, and there was no fallback Operation for it.`) 
        }
      }
      // nothing errored out:
      // a value of 0 means no errors.
      pipelineOutputValve.exitCode = 0
      // pipelineOutputValve.errorMsg = `Not an real error: Successfully finished Operations Pipeline: "${this.env.description}" without any unmanageable errors.`
    }
    catch (e) {
      // set error:
      if (e instanceof Error) pipelineOutputValve.error = e
      
      // non-zero value means an error occured
      pipelineOutputValve.exitCode = 1
      
      // set error message:
      pipelineOutputValve.errorMsg = 
`ERROR! Error type: ${pipelineOutputValve.error.name}
Name of the Operation Pipeline that failed: "${this.env.description}"
Error exit code: ${pipelineOutputValve.exitCode}
Error output:  ${pipelineOutputValve.errorMsg}`

      if (this.env.useDebug) console.error(pipelineOutputValve.errorMsg)
    }
    finally {
      // save debugging trace:
      if (this.env.useDebug && this.trace && typeof this.trace === "object") pipelineOutputValve.debugBackTrace = this.trace
      
      // save final output:
      pipelineOutputValve.pipe = input

      // return the finished output:
      return pipelineOutputValve
    }
  }
}
