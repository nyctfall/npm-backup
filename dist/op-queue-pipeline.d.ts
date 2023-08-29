export * from "./pipeline-types";
import type { Input, Output, Operation, Op, OpCurrier, Pipeline, ImmutablePipeline, TraceBack, EnvSettings, OpsQueueEnvSettings } from "./pipeline-types";
/**
 * @description - An Op is a neat little wrapper function for error handling.
 * @param fn the function to wrap in the Op
 * @param input the array of arguments given to the function, each index is spread to the function's parameter:  `func(...input[])` .
 * @param environment
 * @returns {Promise<Output>}
 */
export declare const op: Op;
export declare const opCurry: OpCurrier;
/**
 * @todo Sematic chaining with:
 *  -  .conduet()  to convert to another format the next Op uses.
 *  -  .parallel(...Ops[])  to execute multiple Ops simultaineously when they all make part of the input for the next Op.
 *  -  .abort()  to stop an OpsPipeline from continuing, (a clean exit after receiving a SIGINT).
 * @todo Add debuggers.
 * @todo Add compat for Ops with preset input.
 */
export declare class OpsPipeline /** @TODO <Input Type, Output Type> *//** @TODO <Input Type, Output Type> */  implements Pipeline<OpsPipeline> {
    isMutable: boolean;
    private queue;
    private fallbackOps;
    private trace?;
    private isPipelineFlagSet;
    private env;
    constructor(description: string, env?: Omit<OpsQueueEnvSettings, "description">);
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
    private nest;
    /**
     * @summary returns a queueable version of a function or pipeline.
     * - NOTE: also enables Tracing of Operation type, whether Op or Pipeline.
    */
    private formatOp;
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
    pipe(operation: Operation, description: string, envExtras?: Omit<EnvSettings, "description">): this;
    pipe(operation: OpsPipeline): this;
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
    fallback(fallback: Operation, description: string, envExtras?: Omit<EnvSettings, "description">): this;
    fallback(fallback: OpsPipeline): this;
    /**
     * @summary Make the pipeline IMMUTABLE. Makes `.pipe` and `.fallback` undefined on the object itself, so it will not call the methods on the prototype chain. It also uses `Object.freeze()` to make the pipeline queues immutable.
     * @returns the pipeline WITHOUT the `.pipe()` or `.fallback()` functions first in the prototype chain or a modifiable OpsQueue.
     */
    lock(): ImmutablePipeline;
    /**
     * @summary Returns the debugging trace.
     */
    traceback(): ReturnType<TraceBack> | undefined;
    /**
     * @summary Takes an Array of arguments to give to the Operation being piped to in the Pipeline
     */
    start(...input: Input): Promise<Output>;
}
