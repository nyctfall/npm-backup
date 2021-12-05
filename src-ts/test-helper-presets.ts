import type { Input, Output, Operation, Trace, OpsQueueEnvSettings } from "./pipeline-types"


type TestV = [fn: Operation, argv: Input, output: Output][]


// default Output data maker:
const defOut = ({ error = Error(), errorMsg = "", exitCode = 0, pipe = [] }: Partial<Output> = { error: Error(), errorMsg: "", exitCode: 0, pipe: [] }) => {
  return Object.freeze({ error, errorMsg, exitCode, pipe })
}


// default input and pipe array, that is immutable:
const pipeSucessDefault: Output["pipe"] = Object.freeze([undefined]) as Input
const pipeFailureDefault: Output["pipe"] = Object.freeze([]) as any as Input

// default Error, immutable:
const errorDefault: Output["error"] = Object.freeze(new Error())

// default error message:
const errorMsgSucessDefault: Output["errorMsg"] = ""
const errorMsgFailureDefault: Output["errorMsg"] = `ERROR! Error type: Error
Name of the Operation that failed: \"No Description\"
Error exit code: 1
Error output: Error`

// default exit code:
const exitCodeSucessDefault: Output["exitCode"] = 0
const exitCodeFailureDefault: Output["exitCode"] = 1

// OpsPipeline Evnironment default, immutable:
const pipelineEnvDefault: OpsQueueEnvSettings = Object.freeze({
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
  enqueueLocalEnvirinments: [],
  enqueueInstanceInfo: [],
  globalEvnironment: pipelineEnvDefault
  // nestedTraces: undefined
})



const loArrow: Operation = (...args: unknown[]) => args

const loAsyncArrow: Operation = async (...args: unknown[]) => args

const loFn: Operation = function(...args: unknown[]){
  return args
}

const loAsyncFn: Operation = async function(...args: unknown[]){
  return args
}

const loGenFnRet: Operation = function*(...args: unknown[]){
  return args
}

const loAsyncGenFnRet: Operation = async function*(...args: unknown[]){
  return args
}

const loGenFnYield: Operation = function*(...args: unknown[]){
  yield args
}

const loAsyncGenFnYield: Operation = async function*(...args: unknown[]){
  yield args
}

// the `.each` table used for flow-through (or loop-back) tests, (.toStrictEqual but not .toBe):
const loStdFnV: TestV = [
  [
    loFn, 
    pipeSucessDefault, 
    defOut({ pipe: pipeSucessDefault })
  ],
  [
    loArrow, 
    pipeSucessDefault, 
    defOut({ pipe: pipeSucessDefault })
  ],
  [
    loAsyncFn, 
    pipeSucessDefault, 
    defOut({ pipe: pipeSucessDefault })
  ],
  [
    loAsyncArrow, 
    pipeSucessDefault, 
    defOut({ pipe: pipeSucessDefault })
  ]
]

// loop-back table for unsupported function types, like GeneratorsFunctions:
const loNonStdFnV = [
  [
    loGenFnRet, 
    pipeSucessDefault, 
    defOut({ pipe: pipeSucessDefault }), 
    true
  ],
  [
    loGenFnYield, 
    pipeSucessDefault, 
    defOut({ pipe: pipeSucessDefault }), 
    false
  ],
  [
    loAsyncGenFnRet, 
    pipeSucessDefault, 
    defOut({ pipe: pipeSucessDefault }), 
    true
  ],
  [
    loAsyncGenFnYield, 
    pipeSucessDefault, 
    defOut({ pipe: pipeSucessDefault }), 
    false
  ]
]



const errArrow: Operation = () => {
  throw errorDefault
}

const errAsyncArrow: Operation = async () => {
  throw errorDefault
}

const errFn: Operation = function(){
  throw errorDefault
}

const errAsyncFn: Operation = async function(){
  throw errorDefault
}


// the `.each` table used for Error catching tests:
const errStdFnV: TestV = [
  [
    errFn, 
    pipeSucessDefault, 
    defOut({ error: errorDefault, exitCode: 1, errorMsg: errorMsgFailureDefault })
  ],
  [
    errArrow, 
    pipeSucessDefault, 
    defOut({ error: errorDefault, exitCode: 1, errorMsg: errorMsgFailureDefault })
  ],
  [
    errAsyncFn, 
    pipeSucessDefault, 
    defOut({ error: errorDefault, exitCode: 1, errorMsg: errorMsgFailureDefault })
  ],
  [
    errAsyncArrow, 
    pipeSucessDefault, 
    defOut({ error: errorDefault, exitCode: 1, errorMsg: errorMsgFailureDefault })
  ]
]



export {
  defOut, // <- default output maker.
  pipeSucessDefault, pipeFailureDefault, errorMsgSucessDefault, errorMsgFailureDefault, exitCodeSucessDefault, exitCodeFailureDefault, errorDefault, pipelineEnvDefault, traceDefault, // <- defaults.
  loStdFnV, loNonStdFnV, errStdFnV, // <- test.each table.
  loFn, loArrow, loAsyncFn, loAsyncArrow, // <- standard.
  loGenFnRet, loGenFnYield, loAsyncGenFnRet, loAsyncGenFnYield // <- non-standard.
}