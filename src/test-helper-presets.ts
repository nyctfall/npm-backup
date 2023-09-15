/* eslint-disable require-yield */
import type { Input, Output, Operation, Trace, OpsQueueEnvSettings } from "./pipeline-types"

type TestV = [fn: Operation, argv: Input, output: Output][]

// default Output data maker:
const defOut = (
  { error = Error(), errorMsg = "", exitCode = 0, pipe = [] }: Partial<Output> = {
    error: Error(),
    errorMsg: "",
    exitCode: 0,
    pipe: []
  }
): Output => {
  return Object.freeze({ error, errorMsg, exitCode, pipe })
}

// default input and pipe array, that is immutable:
const pipeSuccessDefault: Output["pipe"] = Object.freeze([undefined]) as Input
const pipeFailureDefault: Output["pipe"] = Object.freeze([]) as unknown as Input

// default Error, immutable:
const errorDefault: Output["error"] = Object.freeze(new Error())

// default error message:
const errorMsgSuccessDefault: Output["errorMsg"] = ""
const errorMsgFailureDefault: Output["errorMsg"] = `ERROR! Error type: Error
Name of the Operation that failed: "No Description"
Error exit code: 1
Error output: Error`

// default exit code:
const exitCodeSuccessDefault: Output["exitCode"] = 0
const exitCodeFailureDefault: Output["exitCode"] = 1

// OpsPipeline Environment default, immutable:
const pipelineEnvDefault: OpsQueueEnvSettings = Object.freeze({
  useLoopback: false,
  useDebug: false,
  useNestingDebug: false,
  useShell: false,
  description: ""
})

// default nestedTrace, immutable:
const traceDefault: Trace = Object.freeze({
  pipelineInputs: [],
  pipelineOutputs: [],
  pipelineInstanceInfo: [],
  enqueueChildDescriptions: [],
  enqueueLocalEnvironments: [],
  enqueueInstanceInfo: [],
  globalEnvironment: pipelineEnvDefault
  // nestedTraces: undefined
})

const loArrow: Operation = (...args: unknown[]) => args

const loAsyncArrow: Operation = async (...args: unknown[]) => args

const loFn: Operation = function (...args: unknown[]) {
  return args
}

const loAsyncFn: Operation = async function (...args: unknown[]) {
  return args
}

const loGenFnRet: Operation = function* (...args: unknown[]) {
  return args
}

const loAsyncGenFnRet: Operation = async function* (...args: unknown[]) {
  return args
}

const loGenFnYield: Operation = function* (...args: unknown[]) {
  yield args
}

const loAsyncGenFnYield: Operation = async function* (...args: unknown[]) {
  yield args
}

// the `.each` table used for flow-through (or loop-back) tests, (.toStrictEqual but not .toBe):
const loStdFnV: TestV = [
  [loFn, pipeSuccessDefault, defOut({ pipe: [pipeSuccessDefault] })],
  [loArrow, pipeSuccessDefault, defOut({ pipe: [pipeSuccessDefault] })],
  [loAsyncFn, pipeSuccessDefault, defOut({ pipe: [pipeSuccessDefault] })],
  [loAsyncArrow, pipeSuccessDefault, defOut({ pipe: [pipeSuccessDefault] })]
]

// loop-back table for unsupported function types, like GeneratorsFunctions:
const loNonStdFnV = [
  [loGenFnRet, pipeSuccessDefault, defOut({ pipe: pipeSuccessDefault }), true],
  [loGenFnYield, pipeSuccessDefault, defOut({ pipe: pipeSuccessDefault }), false],
  [loAsyncGenFnRet, pipeSuccessDefault, defOut({ pipe: pipeSuccessDefault }), true],
  [loAsyncGenFnYield, pipeSuccessDefault, defOut({ pipe: pipeSuccessDefault }), false]
] as const

const errArrow: Operation = () => {
  throw errorDefault
}

const errAsyncArrow: Operation = async () => {
  throw errorDefault
}

const errFn: Operation = function () {
  throw errorDefault
}

const errAsyncFn: Operation = async function () {
  throw errorDefault
}

// the `.each` table used for Error catching tests:
const errStdFnV: TestV = [
  [
    errFn,
    pipeSuccessDefault,
    defOut({
      error: errorDefault,
      exitCode: 1,
      errorMsg: errorMsgFailureDefault
    })
  ],
  [
    errArrow,
    pipeSuccessDefault,
    defOut({
      error: errorDefault,
      exitCode: 1,
      errorMsg: errorMsgFailureDefault
    })
  ],
  [
    errAsyncFn,
    pipeSuccessDefault,
    defOut({
      error: errorDefault,
      exitCode: 1,
      errorMsg: errorMsgFailureDefault
    })
  ],
  [
    errAsyncArrow,
    pipeSuccessDefault,
    defOut({
      error: errorDefault,
      exitCode: 1,
      errorMsg: errorMsgFailureDefault
    })
  ]
]

export {
  defOut, // <- default output maker.
  pipeSuccessDefault as pipeSuccessDefault,
  pipeFailureDefault,
  errorMsgSuccessDefault as errorMsgSuccessDefault,
  errorMsgFailureDefault,
  exitCodeSuccessDefault as exitCodeSuccessDefault,
  exitCodeFailureDefault,
  errorDefault,
  pipelineEnvDefault,
  traceDefault, // <- defaults.
  loStdFnV,
  loNonStdFnV,
  errStdFnV, // <- test.each table.
  loFn,
  loArrow,
  loAsyncFn,
  loAsyncArrow, // <- standard.
  loGenFnRet,
  loGenFnYield,
  loAsyncGenFnRet,
  loAsyncGenFnYield // <- non-standard.
}
