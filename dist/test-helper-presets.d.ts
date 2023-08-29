import type { Input, Output, Operation, Trace, OpsQueueEnvSettings } from "./pipeline-types";
declare type TestV = [fn: Operation, argv: Input, output: Output][];
declare const defOut: ({ error, errorMsg, exitCode, pipe }?: Partial<Output>) => Readonly<{
    error: Error;
    errorMsg: "" | `ERROR! Error type: ${string}\nName of the ${string} that failed: "${string}"\nError exit code: ${number}\nError output: ${string}${string}`;
    exitCode: number;
    pipe: Input;
}>;
declare const pipeSucessDefault: Output["pipe"];
declare const pipeFailureDefault: Output["pipe"];
declare const errorDefault: Output["error"];
declare const errorMsgSucessDefault: Output["errorMsg"];
declare const errorMsgFailureDefault: Output["errorMsg"];
declare const exitCodeSucessDefault: Output["exitCode"];
declare const exitCodeFailureDefault: Output["exitCode"];
declare const pipelineEnvDefault: OpsQueueEnvSettings;
declare const traceDefault: Trace;
declare const loArrow: Operation;
declare const loAsyncArrow: Operation;
declare const loFn: Operation;
declare const loAsyncFn: Operation;
declare const loGenFnRet: Operation;
declare const loAsyncGenFnRet: Operation;
declare const loGenFnYield: Operation;
declare const loAsyncGenFnYield: Operation;
declare const loStdFnV: TestV;
declare const loNonStdFnV: (boolean | Input | Operation | Readonly<{
    error: Error;
    errorMsg: "" | `ERROR! Error type: ${string}\nName of the ${string} that failed: "${string}"\nError exit code: ${number}\nError output: ${string}${string}`;
    exitCode: number;
    pipe: Input;
}>)[][];
declare const errStdFnV: TestV;
export { defOut, // <- default output maker.
pipeSucessDefault, pipeFailureDefault, errorMsgSucessDefault, errorMsgFailureDefault, exitCodeSucessDefault, exitCodeFailureDefault, errorDefault, pipelineEnvDefault, traceDefault, // <- defaults.
loStdFnV, loNonStdFnV, errStdFnV, // <- test.each table.
loFn, loArrow, loAsyncFn, loAsyncArrow, // <- standard.
loGenFnRet, loGenFnYield, loAsyncGenFnRet, loAsyncGenFnYield };
