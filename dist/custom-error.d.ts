/// <reference types="node" />
/**
 * @summary should be an 32-bit integer.
 * @typedef {number & integer} ErrorCode
 */
declare type ErrorCode = number;
/**
 * @summary The special Errors thrown by Operations (the wrapped functions), Ops, and Pipelines.
 * It has a  `code`  property added to the Error, so specific error codes can be used instead of just error messages.
 * @type ErrorCode: Should be an 32-bit integer.
 */
export declare class ExitCodeError extends Error {
    code: ErrorCode;
    constructor(messageOrExitCode?: string | number, exitCode?: number);
}
/**
 * @summary The special Errors thrown by Operation functions wrapped and run inside of the Ops and Pipelines.
 * - NOTE: Any Errors thrown by Operation functions should use the static method  `.extend()`  to extend this class to make a more useful an specific Error type if possible.
 */
export declare class OperationError extends ExitCodeError {
    code: ErrorCode;
    constructor(messageOrExitCode?: string | number, exitCodeAfterMessage?: number);
    static extend(errorTypeName: string | `${string}Error`, defaultErrorCode?: number, defaultErrorMessage?: string): {
        new (messageOrExitCode?: string | number, exitCodeAfterMessage?: number): {
            code: ErrorCode;
            message: string;
            name: string;
            stack?: string | undefined;
            cause?: Error | undefined;
        };
        extend(errorTypeName: string | `${string}Error`, defaultErrorCode?: number, defaultErrorMessage?: string): any;
        captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
        prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
        stackTraceLimit: number;
    };
}
/** @summary The special success Non-Error returned by the Ops and Pipelines, compatibility placeholder for where an error would be if one had occured. */
export declare class SuccesfulNonError extends Error {
    constructor(message: string);
}
/** @summary The special Errors returned by Ops. */
export declare class OpError extends Error {
    constructor(message: string);
}
/** @summary The default preset Error used internally by Ops. */
export declare class DefaultOpError extends OpError {
    constructor(message?: string);
}
/** @summary The special Errors returned by Pipelines. */
export declare class PipelineError extends Error {
    constructor(message: string);
}
/** @summary The default preset Error used internally by Pipelines. */
export declare class DefaultPipelineError extends PipelineError {
    constructor(message: string);
}
/** @summary The special Errors returned by the Op inside of a Pipeline failing unrecoverably. */
export declare class OpQueuePipelineError extends PipelineError {
    constructor(message: string);
}
/** @summary The special Errors returned by the fallback Ops inside of a Pipeline all failing, with no recovery possible after they all fail. */
export declare class FallbackOpQueuePipelineError extends OpQueuePipelineError {
    constructor(message: string);
}
export {};
