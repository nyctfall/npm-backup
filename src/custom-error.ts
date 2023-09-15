/**
 * @summary should be an 32-bit integer.
 * @typedef {number & integer} ErrorCode
 */
type ErrorCode = number

/**
 * @summary The special Errors thrown by Operations (the wrapped functions), Ops, and Pipelines.
 * It has a  `code`  property added to the Error, so specific error codes can be used instead of just error messages.
 * @type ErrorCode: Should be an 32-bit integer.
 */
export class ExitCodeError extends Error {
  code: ErrorCode = 1 // non-zero means error.

  constructor(messageOrExitCode?: string | number, exitCode?: number) {
    super()

    // set msg and exit-code:
    if (typeof messageOrExitCode === "number") this.code = Number(messageOrExitCode) << 0
    // bit-wise shift by 0 is used to make it a 32-bit integer, without changing the value... to much.
    else {
      if (messageOrExitCode) this.message = String(messageOrExitCode)
      if (exitCode) this.code = Number(exitCode) << 0 // bit-wise shift by 0 is used to make it a 32-bit integer, without changing the value... to much.
    }

    // set the name of the error type:
    this.name = `ExitCode${this.name}`
  }
}

/**
 * @summary The special Errors thrown by Operation functions wrapped and run inside of the Ops and Pipelines.
 * - NOTE: Any Errors thrown by Operation functions should use the static method  `.extend()`  to extend this class to make a more useful an specific Error type if possible.
 */
// unused for now, may be extended by the functions an Op calls...
export class OperationError extends ExitCodeError {
  code: ErrorCode = 1 // non-zero means error.

  constructor(messageOrExitCode?: string | number, exitCodeAfterMessage?: number) {
    super()

    // set msg and exit-code:
    if (typeof messageOrExitCode === "number") this.code = Number(messageOrExitCode) << 0
    // bit-wise shift by 0 is used to make it a 32-bit integer, without changing the value... to much.
    else {
      if (messageOrExitCode) this.message = String(messageOrExitCode)
      if (exitCodeAfterMessage) this.code = Number(exitCodeAfterMessage) << 0 // bit-wise shift by 0 is used to make it a 32-bit integer, without changing the value... to much.
    }

    // set the name of the error type:
    this.name = `Operation${this.name}`
  }

  static extend(errorTypeName: string | `${string}Error`, defaultErrorCode?: number, defaultErrorMessage?: string) {
    return class CustomInternalOperationError extends OperationError {
      code: ErrorCode = defaultErrorCode ?? 1 // non-zero integer means error.
      message: string = defaultErrorMessage ?? ""

      constructor(messageOrExitCode?: string | number, exitCodeAfterMessage?: number) {
        super(messageOrExitCode, exitCodeAfterMessage)

        // set the name of the error type:
        this.name = `${errorTypeName}`
      }
    }
  }
}

/** @summary The special success Non-Error returned by the Ops and Pipelines, compatibility placeholder for where an error would be if one had occurred. */
export class SuccessfulNonError extends Error {
  constructor(message: string) {
    super(message ?? "This is NOT an error: It is just a compatibility placeholder after a successful exit.")
    this.name = `SuccessfulNon${this.name}`
  }
}

/** @summary The special Errors returned by Ops. */
export class OpError extends Error {
  constructor(message: string) {
    super(message)
    this.name = `Op${this.name}`
  }
}

/** @summary The default preset Error used internally by Ops. */
export class DefaultOpError extends OpError {
  constructor(message?: string) {
    super(
      message ??
        "Possible unknown internal problem: This is the default preset error. It should never be thrown or returned, unless something really bad inadvertently happened internally."
    )
    this.name = `Default${this.name}`
  }
}

/** @summary The special Errors returned by Pipelines. */
export class PipelineError extends Error {
  constructor(message: string) {
    super(message)
    this.name = `Pipeline${this.name}`
  }
}

/** @summary The default preset Error used internally by Pipelines. */
export class DefaultPipelineError extends PipelineError {
  constructor(message: string) {
    super(
      message ??
        "Possible unknown internal problem: This is the default preset error. It should never be thrown or returned, unless something really bad inadvertently happened internally."
    )
    this.name = `Default${this.name}`
  }
}

/** @summary The special Errors returned by the Op inside of a Pipeline failing unrecoverable. */
export class OpQueuePipelineError extends PipelineError {
  constructor(message: string) {
    super(message)
    this.name = `OpQueue${this.name}`
  }
}

/** @summary The special Errors returned by the fallback Ops inside of a Pipeline all failing, with no recovery possible after they all fail. */
export class FallbackOpQueuePipelineError extends OpQueuePipelineError {
  constructor(message: string) {
    super(message)
    this.name = `Fallback${this.name}`
  }
}
