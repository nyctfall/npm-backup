"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loAsyncGenFnYield = exports.loAsyncGenFnRet = exports.loGenFnYield = exports.loGenFnRet = exports.loAsyncArrow = exports.loAsyncFn = exports.loArrow = exports.loFn = exports.errStdFnV = exports.loNonStdFnV = exports.loStdFnV = exports.traceDefault = exports.pipelineEnvDefault = exports.errorDefault = exports.exitCodeFailureDefault = exports.exitCodeSucessDefault = exports.errorMsgFailureDefault = exports.errorMsgSucessDefault = exports.pipeFailureDefault = exports.pipeSucessDefault = exports.defOut = void 0;
// default Output data maker:
const defOut = ({ error = Error(), errorMsg = "", exitCode = 0, pipe = [] } = { error: Error(), errorMsg: "", exitCode: 0, pipe: [] }) => {
    return Object.freeze({ error, errorMsg, exitCode, pipe });
};
exports.defOut = defOut;
// default input and pipe array, that is immutable:
const pipeSucessDefault = Object.freeze([undefined]);
exports.pipeSucessDefault = pipeSucessDefault;
const pipeFailureDefault = Object.freeze([]);
exports.pipeFailureDefault = pipeFailureDefault;
// default Error, immutable:
const errorDefault = Object.freeze(new Error());
exports.errorDefault = errorDefault;
// default error message:
const errorMsgSucessDefault = "";
exports.errorMsgSucessDefault = errorMsgSucessDefault;
const errorMsgFailureDefault = `ERROR! Error type: Error
Name of the Operation that failed: \"No Description\"
Error exit code: 1
Error output: Error`;
exports.errorMsgFailureDefault = errorMsgFailureDefault;
// default exit code:
const exitCodeSucessDefault = 0;
exports.exitCodeSucessDefault = exitCodeSucessDefault;
const exitCodeFailureDefault = 1;
exports.exitCodeFailureDefault = exitCodeFailureDefault;
// OpsPipeline Evnironment default, immutable:
const pipelineEnvDefault = Object.freeze({
    useLoopback: false,
    useDebug: false,
    useNestingDebug: false,
    useShell: false,
    description: ""
});
exports.pipelineEnvDefault = pipelineEnvDefault;
// default nestedTrace, immutable:
const traceDefault = Object.freeze({
    pipelineInputs: [],
    pipelineOutputs: [],
    pipelineInstanceInfo: [],
    enqueueChildDescriptions: [],
    enqueueLocalEnvirinments: [],
    enqueueInstanceInfo: [],
    globalEvnironment: pipelineEnvDefault
    // nestedTraces: undefined
});
exports.traceDefault = traceDefault;
const loArrow = (...args) => args;
exports.loArrow = loArrow;
const loAsyncArrow = async (...args) => args;
exports.loAsyncArrow = loAsyncArrow;
const loFn = function (...args) {
    return args;
};
exports.loFn = loFn;
const loAsyncFn = async function (...args) {
    return args;
};
exports.loAsyncFn = loAsyncFn;
const loGenFnRet = function* (...args) {
    return args;
};
exports.loGenFnRet = loGenFnRet;
const loAsyncGenFnRet = async function* (...args) {
    return args;
};
exports.loAsyncGenFnRet = loAsyncGenFnRet;
const loGenFnYield = function* (...args) {
    yield args;
};
exports.loGenFnYield = loGenFnYield;
const loAsyncGenFnYield = async function* (...args) {
    yield args;
};
exports.loAsyncGenFnYield = loAsyncGenFnYield;
// the `.each` table used for flow-through (or loop-back) tests, (.toStrictEqual but not .toBe):
const loStdFnV = [
    [
        loFn,
        pipeSucessDefault,
        defOut({ pipe: [pipeSucessDefault] })
    ],
    [
        loArrow,
        pipeSucessDefault,
        defOut({ pipe: [pipeSucessDefault] })
    ],
    [
        loAsyncFn,
        pipeSucessDefault,
        defOut({ pipe: [pipeSucessDefault] })
    ],
    [
        loAsyncArrow,
        pipeSucessDefault,
        defOut({ pipe: [pipeSucessDefault] })
    ]
];
exports.loStdFnV = loStdFnV;
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
];
exports.loNonStdFnV = loNonStdFnV;
const errArrow = () => {
    throw errorDefault;
};
const errAsyncArrow = async () => {
    throw errorDefault;
};
const errFn = function () {
    throw errorDefault;
};
const errAsyncFn = async function () {
    throw errorDefault;
};
// the `.each` table used for Error catching tests:
const errStdFnV = [
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
];
exports.errStdFnV = errStdFnV;
//# sourceMappingURL=test-helper-presets.js.map