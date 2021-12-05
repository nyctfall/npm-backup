"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FallbackOpQueuePipelineError = exports.OpQueuePipelineError = exports.DefaultPipelineError = exports.PipelineError = exports.DefaultOpError = exports.OpError = exports.SuccesfulNonError = exports.OperationError = exports.ExitCodeError = void 0;
/**
 * @summary The special Errors thrown by Operations (the wrapped functions), Ops, and Pipelines.
 * It has a  `code`  property added to the Error, so specific error codes can be used instead of just error messages.
 * @type ErrorCode: Should be an 32-bit integer.
 */
class ExitCodeError extends Error {
    constructor(messageOrExitCode, exitCode) {
        super();
        this.code = 1; // non-zero means error.
        // set msg and exit-code:
        if (typeof messageOrExitCode === "number")
            this.code = Number(messageOrExitCode) << 0; // bit-wise shift by 0 is used to make it a 32-bit integer, without changing the vaule... to much.
        else {
            if (messageOrExitCode)
                this.message = String(messageOrExitCode);
            if (exitCode)
                this.code = Number(exitCode) << 0; // bit-wise shift by 0 is used to make it a 32-bit integer, without changing the vaule... to much.
        }
        // set the name of the error type:
        this.name = `ExitCode${this.name}`;
    }
}
exports.ExitCodeError = ExitCodeError;
/**
 * @summary The special Errors thrown by Operation functions wrapped and run inside of the Ops and Pipelines.
 * - NOTE: Any Errors thrown by Operation functions should use the static method  `.extend()`  to extend this class to make a more useful an specific Error type if possible.
 */
// unused for now, may be extended by the functions an Op calls...
class OperationError extends ExitCodeError {
    constructor(messageOrExitCode, exitCodeAfterMessage) {
        super();
        this.code = 1; // non-zero means error.
        // set msg and exit-code:
        if (typeof messageOrExitCode === "number")
            this.code = Number(messageOrExitCode) << 0; // bit-wise shift by 0 is used to make it a 32-bit integer, without changing the vaule... to much.
        else {
            if (messageOrExitCode)
                this.message = String(messageOrExitCode);
            if (exitCodeAfterMessage)
                this.code = Number(exitCodeAfterMessage) << 0; // bit-wise shift by 0 is used to make it a 32-bit integer, without changing the vaule... to much.
        }
        // set the name of the error type:
        this.name = `Operation${this.name}`;
    }
    static extend(errorTypeName, defaultErrorCode, defaultErrorMessage) {
        return class CustomInternalOperationError extends OperationError {
            constructor(messageOrExitCode, exitCodeAfterMessage) {
                super(messageOrExitCode, exitCodeAfterMessage);
                this.code = defaultErrorCode ?? 1; // non-zero integer means error.
                this.message = defaultErrorMessage ?? "";
                // set the name of the error type:
                this.name = `${errorTypeName}`;
            }
        };
    }
}
exports.OperationError = OperationError;
/** @summary The special success Non-Error returned by the Ops and Pipelines, compatibility placeholder for where an error would be if one had occured. */
class SuccesfulNonError extends Error {
    constructor(message) {
        super(message ?? "This is NOT an error: It is just a compatibility placeholder after a successful exit.");
        this.name = `SuccessfulNon${this.name}`;
    }
}
exports.SuccesfulNonError = SuccesfulNonError;
/** @summary The special Errors returned by Ops. */
class OpError extends Error {
    constructor(message) {
        super(message);
        this.name = `Op${this.name}`;
    }
}
exports.OpError = OpError;
/** @summary The default preset Error used internally by Ops. */
class DefaultOpError extends OpError {
    constructor(message) {
        super(message ?? "Possible unknown internal problem: This is the default preset error. It should never be thrown or returned, unless something really bad inadvertantly happened internally.");
        this.name = `Default${this.name}`;
    }
}
exports.DefaultOpError = DefaultOpError;
/** @summary The special Errors returned by Pipelines. */
class PipelineError extends Error {
    constructor(message) {
        super(message);
        this.name = `Pipeline${this.name}`;
    }
}
exports.PipelineError = PipelineError;
/** @summary The default preset Error used internally by Pipelines. */
class DefaultPipelineError extends PipelineError {
    constructor(message) {
        super(message ?? "Possible unknown internal problem: This is the default preset error. It should never be thrown or returned, unless something really bad inadvertantly happened internally.");
        this.name = `Default${this.name}`;
    }
}
exports.DefaultPipelineError = DefaultPipelineError;
/** @summary The special Errors returned by the Op inside of a Pipeline failing unrecoverably. */
class OpQueuePipelineError extends PipelineError {
    constructor(message) {
        super(message);
        this.name = `OpQueue${this.name}`;
    }
}
exports.OpQueuePipelineError = OpQueuePipelineError;
/** @summary The special Errors returned by the fallback Ops inside of a Pipeline all failing, with no recovery possible after they all fail. */
class FallbackOpQueuePipelineError extends OpQueuePipelineError {
    constructor(message) {
        super(message);
        this.name = `Fallback${this.name}`;
    }
}
exports.FallbackOpQueuePipelineError = FallbackOpQueuePipelineError;
