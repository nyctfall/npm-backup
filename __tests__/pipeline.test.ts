import { describe, test, expect } from "@jest/globals"
import { OpsPipeline } from "../src-ts/op-queue-pipeline"
import type { Output, OpsQueueEnvSettings, Trace } from "../src-ts/pipeline-types"
import { errStdFnV, loStdFnV } from "../src-ts/test-helper-presets"
// import { exec } from "child_process"
// import { promisify } from "util"
// const execAsync = promisify(exec)



// The Ops Pipeline:
describe("The `Op` chaining Pipeline class, it calls `OpCurriers` that then call `Ops` that wrap the `Operation` functions, it then sends the `Output.pipe` of each `Op` as the `Input` (type Array<unknown>) to the next `Op`.", () => {
  describe("Empty OpsPipeline, `OpsQueue` is an empty array (no `.pipe()` was called).", () => {
    test("Default environment settings, with empty-string `OpsPipeline.env.description`, and empty Array `.start([])` argument. And the array should flow-through like a loopback, that is, it should return the input as `Output.pipe`.", async () => {
      const input: never[] = []
      const pl = new OpsPipeline("")
      const outputTest: Output = await pl.start(input)

      expect(outputTest).toStrictEqual(expect.objectContaining({
        exitCode: 0,
        pipe: input,
        error: Error(),
        errorMsg: ""
      } as Output as Record<string,any>))
      expect(outputTest).toHaveProperty("pipe" as keyof Output, input)
      expect(outputTest.pipe).toBe(input)
      expect(outputTest.pipe).toEqual(input)
      expect(outputTest.pipe).toStrictEqual(input)

      expect(pl.traceback()).toBeUndefined()
    })

    test("`.useShell` environment settings...", async () => {
      const input: never[] = []
      const pl = new OpsPipeline("", {useShell: true})
      const outputTest = await pl.start(input)

      expect(outputTest).toStrictEqual(expect.objectContaining({
        exitCode: 0,
        pipe: input,
        error: Error(),
        errorMsg: ""
      } as Output as Record<string,any>))
      expect(outputTest).toHaveProperty("pipe" as keyof Output, input)
      expect(outputTest.pipe).toBe(input)
      expect(outputTest.pipe).toEqual(input)
      expect(outputTest.pipe).toStrictEqual(input)

      expect(pl.traceback()).toBeUndefined()
    })

    test("`description` environment settings...", async () => {
      const input: never[] = []
      const pl = new OpsPipeline("Pl-desc")
      const outputTest = await pl.start(input)

      expect(outputTest).toStrictEqual(expect.objectContaining({
        exitCode: 0,
        pipe: input,
        error: Error(),
        errorMsg: ""
      } as Output as Record<string,any>))
      expect(outputTest).toHaveProperty("pipe" as keyof Output, input)
      expect(outputTest.pipe).toBe(input)
      expect(outputTest.pipe).toEqual(input)
      expect(outputTest.pipe).toStrictEqual(input)

      expect(pl.traceback()).toBeUndefined()
    })

    test("`useDebug` environment settings...", async () => {
      const input: never[] = []
      const pl = new OpsPipeline("", {useDebug: true})
      const outputTest = await pl.start(input)
      
      expect(outputTest).toStrictEqual(expect.objectContaining({
        exitCode: 0,
        pipe: input,
        error: Error(),
        errorMsg: ""
      } as Output as Record<string,any>))
      expect(outputTest).toHaveProperty("pipe" as keyof Output, input)
      expect(outputTest.pipe).toBe(input)
      expect(outputTest.pipe).toEqual(input)
      expect(outputTest.pipe).toStrictEqual(input)

      const tb = pl.traceback()

      expect(tb).toEqual(expect.objectContaining({
        globalEvnironment: {
          description: "", 
          useDebug: true, 
          useNestingDebug: false, 
          useShell: false
        },
        enqueueChildDescriptions: [],
        enqueueInstanceInfo: [],
        enqueueLocalEnvirinments: [],
        pipelineInputs: [],
        pipelineInstanceInfo: [],
        pipelineOutputs: [],
      } as Trace))
      
      expect(tb).not.toHaveProperty("nestedTraces" as keyof Trace)
    })
    
    test("`useNestingDebug` environment settings...", async () => {
      const input: never[] = []
      const pl = new OpsPipeline("", { useNestingDebug: true })
      const outputTest = await pl.start(input)
      
      expect(outputTest).toStrictEqual(expect.objectContaining({
        exitCode: 0,
        pipe: input,
        error: Error(),
        errorMsg: ""
      } as Output as Record<string,any>))
      expect(outputTest).toHaveProperty("pipe" as keyof Output, input)
      expect(outputTest.pipe).toBe(input)
      expect(outputTest.pipe).toEqual(input)
      expect(outputTest.pipe).toStrictEqual(input)
      
      const tb = pl.traceback()
      
      expect(tb).toEqual(expect.objectContaining({
        globalEvnironment: {
          description: "", 
          useShell: false, 
          useDebug: true, 
          useNestingDebug: true
        },
        enqueueChildDescriptions: [],
        enqueueInstanceInfo: [],
        enqueueLocalEnvirinments: [],
        pipelineInputs: [],
        pipelineInstanceInfo: [],
        pipelineOutputs: [],
        nestedTraces: []
      } as Trace))
    })
    
    describe("introspection into the `private` TS properties of an empty OpsPipeline.", () => {
      test("Default environment settings...", async () => {
        const input: never[] = []
        const pl: OpsPipeline = new OpsPipeline("")

        expect(pl).toBeDefined()
        expect(pl).toBeInstanceOf(OpsPipeline)
        expect(pl).toHaveProperty("constructor" as keyof OpsPipeline, OpsPipeline)
        
        // props should all be the defaults:
        expect(pl).toHaveProperty("isMutable" as keyof OpsPipeline, true)
        expect(pl).toHaveProperty("queue" as keyof OpsPipeline, [])
        expect(pl).toHaveProperty("fallbackOps" as keyof OpsPipeline, new WeakMap())
        expect(pl).toHaveProperty("isPipelineFlagSet" as keyof OpsPipeline, new WeakSet())
        expect(pl).toHaveProperty("env" as keyof OpsPipeline, { 
          useShell: false, 
          useDebug: false, 
          useNestingDebug: false, 
          description: "" 
        } as OpsQueueEnvSettings)
        
        // there should be not Trace object, if it wasn't requested in the env settings:
        expect(pl).not.toHaveProperty("trace" as keyof OpsPipeline)
        
        // methods:
        expect(Object.getPrototypeOf(pl).pipe).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).lock).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).nest).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).start).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).fallback).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).formatOp).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).traceback).toBeInstanceOf(Function)
        // should NOT have own prop methods:
        expect(Object.getOwnPropertyNames(pl)).not.toContain("pipe" as keyof OpsPipeline)
        expect(Object.getOwnPropertyNames(pl)).not.toContain("fallback" as keyof OpsPipeline)
        
        const outputTest: Output = await pl.start(input)
        
        expect(outputTest).toStrictEqual(expect.objectContaining({
          exitCode: 0,
          pipe: input,
          error: Error(),
          errorMsg: ""
        } as Output as Record<string,any>))
        
        expect(outputTest).toHaveProperty("pipe" as keyof Output, input)
        expect(outputTest.pipe).toBe(input)
        expect(outputTest.pipe).toEqual(input)
        expect(outputTest.pipe).toStrictEqual(input)
        
        // Pipeline should be locked:
        expect(pl).toHaveProperty("isMutable" as keyof OpsPipeline, false)
        
        // // this is caused by the Pipeline locking feature, it may be removed in the future:
        // expect(pl.pipe).toBeUndefined()
        // expect(pl.fallback).toBeUndefined()
        
        // // should NOT have methods first is prototype chain, but instead have the masking `undefined` props:
        // expect(Object.getOwnPropertyNames(pl)).toContain("pipe" as keyof OpsPipeline)
        // expect(Object.getOwnPropertyNames(pl)).toContain("fallback" as keyof OpsPipeline)
        
        // prototype methods are still there:
        expect(Object.getPrototypeOf(pl).pipe).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).fallback).toBeInstanceOf(Function)

        expect(pl.traceback()).toBeUndefined()
      })

      test("`useShell` environment settings...", async () => {
        const input: never[] = []
        const pl: OpsPipeline = new OpsPipeline("", {useShell: true})

        expect(pl).toBeDefined()
        expect(pl).toBeInstanceOf(OpsPipeline)
        expect(pl).toHaveProperty("constructor" as keyof OpsPipeline, OpsPipeline)
        
        // props should all be the defaults:
        expect(pl).toHaveProperty("isMutable" as keyof OpsPipeline, true)
        expect(pl).toHaveProperty("queue" as keyof OpsPipeline, [])
        expect(pl).toHaveProperty("fallbackOps" as keyof OpsPipeline, new WeakMap())
        expect(pl).toHaveProperty("isPipelineFlagSet" as keyof OpsPipeline, new WeakSet())
        expect(pl).toHaveProperty("env" as keyof OpsPipeline, { 
          useShell: true, 
          useDebug: false, 
          useNestingDebug: false, 
          description: "" 
        } as OpsQueueEnvSettings)
        
        // there should be not Trace object, if it wasn't requested in the env settings:
        expect(pl).not.toHaveProperty("trace" as keyof OpsPipeline)
        
        // methods:
        expect(Object.getPrototypeOf(pl).pipe).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).lock).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).nest).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).start).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).fallback).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).formatOp).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).traceback).toBeInstanceOf(Function)
        // should NOT have own prop methods:
        expect(Object.getOwnPropertyNames(pl)).not.toContain("pipe" as keyof OpsPipeline)
        expect(Object.getOwnPropertyNames(pl)).not.toContain("fallback" as keyof OpsPipeline)
        
        const outputTest: Output = await pl.start(input)
        
        expect(outputTest).toStrictEqual(expect.objectContaining({
          exitCode: 0,
          pipe: input,
          error: Error(),
          errorMsg: ""
        } as Output as Record<string,any>))
        
        expect(outputTest).toHaveProperty("pipe" as keyof Output, input)
        expect(outputTest.pipe).toBe(input)
        expect(outputTest.pipe).toEqual(input)
        expect(outputTest.pipe).toStrictEqual(input)
        
        // Pipeline should be locked:
        expect(pl).toHaveProperty("isMutable" as keyof OpsPipeline, false)
        
        // // this is caused by the Pipeline locking feature, it may be removed in the future:
        // expect(pl.pipe).toBeUndefined()
        // expect(pl.fallback).toBeUndefined()
        
        // // should NOT have methods first is prototype chain, but instead have the masking `undefined` props:
        // expect(Object.getOwnPropertyNames(pl)).toContain("pipe" as keyof OpsPipeline)
        // expect(Object.getOwnPropertyNames(pl)).toContain("fallback" as keyof OpsPipeline)
        
        // prototype methods are still there:
        expect(Object.getPrototypeOf(pl).pipe).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).fallback).toBeInstanceOf(Function)

        expect(pl.traceback()).toBeUndefined()
      })

      test("`description` environment settings...", async () => {
        const input: never[] = []
        const pl: OpsPipeline = new OpsPipeline("pl-desc")

        expect(pl).toBeDefined()
        expect(pl).toBeInstanceOf(OpsPipeline)
        expect(pl).toHaveProperty("constructor" as keyof OpsPipeline, OpsPipeline)
        
        // props should all be the defaults:
        expect(pl).toHaveProperty("isMutable" as keyof OpsPipeline, true)
        expect(pl).toHaveProperty("queue" as keyof OpsPipeline, [])
        expect(pl).toHaveProperty("fallbackOps" as keyof OpsPipeline, new WeakMap())
        expect(pl).toHaveProperty("isPipelineFlagSet" as keyof OpsPipeline, new WeakSet())
        expect(pl).toHaveProperty("env" as keyof OpsPipeline, { 
          useDebug: false, 
          useShell: false, 
          useNestingDebug: false, 
          description: "pl-desc" 
        } as OpsQueueEnvSettings)
        
        // there should be not Trace object, if it wasn't requested in the env settings:
        expect(pl).not.toHaveProperty("trace" as keyof OpsPipeline)
        
        // methods:
        expect(Object.getPrototypeOf(pl).pipe).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).lock).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).nest).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).start).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).fallback).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).formatOp).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).traceback).toBeInstanceOf(Function)
        // should NOT have own prop methods:
        expect(Object.getOwnPropertyNames(pl)).not.toContain("pipe" as keyof OpsPipeline)
        expect(Object.getOwnPropertyNames(pl)).not.toContain("fallback" as keyof OpsPipeline)
        
        const outputTest: Output = await pl.start(input)
        
        expect(outputTest).toStrictEqual(expect.objectContaining({
          exitCode: 0,
          pipe: input,
          error: Error(),
          errorMsg: ""
        } as Output as Record<string,any>))
        
        expect(outputTest).toHaveProperty("pipe" as keyof Output, input)
        expect(outputTest.pipe).toBe(input)
        expect(outputTest.pipe).toEqual(input)
        expect(outputTest.pipe).toStrictEqual(input)
        
        // Pipeline should be locked:
        expect(pl).toHaveProperty("isMutable" as keyof OpsPipeline, false)
        
        // // this is caused by the Pipeline locking feature, it may be removed in the future:
        // expect(pl.pipe).toBeUndefined()
        // expect(pl.fallback).toBeUndefined()
        
        // // should NOT have methods first is prototype chain, but instead have the masking `undefined` props:
        // expect(Object.getOwnPropertyNames(pl)).toContain("pipe" as keyof OpsPipeline)
        // expect(Object.getOwnPropertyNames(pl)).toContain("fallback" as keyof OpsPipeline)
        
        // prototype methods are still there:
        expect(Object.getPrototypeOf(pl).pipe).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).fallback).toBeInstanceOf(Function)
        
        expect(pl.traceback()).toBeUndefined
      })

      test("`useDebug` environment settings...", async () => {
        const input: never[] = []
        const pl: OpsPipeline = new OpsPipeline("", {useDebug: true})
  
        expect(pl).toBeDefined()
        expect(pl).toBeInstanceOf(OpsPipeline)
        expect(pl).toHaveProperty("constructor" as keyof OpsPipeline, OpsPipeline)
        
        // props should all be the defaults:
        expect(pl).toHaveProperty("isMutable" as keyof OpsPipeline, true)
        expect(pl).toHaveProperty("queue" as keyof OpsPipeline, [])
        expect(pl).toHaveProperty("fallbackOps" as keyof OpsPipeline, new WeakMap())
        expect(pl).toHaveProperty("isPipelineFlagSet" as keyof OpsPipeline, new WeakSet())
        expect(pl).toHaveProperty("env" as keyof OpsPipeline, { 
          useDebug: true, 
          useShell: false, 
          useNestingDebug: false, 
          description: "" 
        } as OpsQueueEnvSettings)
        
        // there should be not Trace object, if it wasn't requested in the env settings:
        expect(pl).toHaveProperty("trace" as keyof OpsPipeline)
        
        // methods:
        expect(Object.getPrototypeOf(pl).pipe).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).lock).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).nest).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).start).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).fallback).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).formatOp).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).traceback).toBeInstanceOf(Function)
        // should NOT have own prop methods:
        expect(Object.getOwnPropertyNames(pl)).not.toContain("pipe" as keyof OpsPipeline)
        expect(Object.getOwnPropertyNames(pl)).not.toContain("fallback" as keyof OpsPipeline)
        
        const outputTest: Output = await pl.start(input)
        
        expect(outputTest).toStrictEqual(expect.objectContaining({
          exitCode: 0,
          pipe: input,
          error: Error(),
          errorMsg: ""
        } as Output as Record<string,any>))
        
        expect(outputTest).toHaveProperty("pipe" as keyof Output, input)
        expect(outputTest.pipe).toBe(input)
        expect(outputTest.pipe).toEqual(input)
        expect(outputTest.pipe).toStrictEqual(input)
        
        // Pipeline should be locked:
        expect(pl).toHaveProperty("isMutable" as keyof OpsPipeline, false)
        
        // // this is caused by the Pipeline locking feature, it may be removed in the future:
        // expect(pl.pipe).toBeUndefined()
        // expect(pl.fallback).toBeUndefined()
        
        // // should NOT have methods first is prototype chain, but instead have the masking `undefined` props:
        // expect(Object.getOwnPropertyNames(pl)).toContain("pipe" as keyof OpsPipeline)
        // expect(Object.getOwnPropertyNames(pl)).toContain("fallback" as keyof OpsPipeline)
        
        // prototype methods are still there:
        expect(Object.getPrototypeOf(pl).pipe).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).fallback).toBeInstanceOf(Function)
  
        const tb = pl.traceback()
  
        expect(tb).toEqual(expect.objectContaining({
          globalEvnironment: {
            description: "", 
            useDebug: true, 
            useNestingDebug: false, 
            useShell: false
          },
          enqueueChildDescriptions: [],
          enqueueInstanceInfo: [],
          enqueueLocalEnvirinments: [],
          pipelineInputs: [],
          pipelineInstanceInfo: [],
          pipelineOutputs: [],
        } as Trace))
        
        expect(tb).not.toHaveProperty("nestedTraces" as keyof Trace)
      })

      test("`useNestingDebug` environment settings...", async () => {
        const input: never[] = []
        const pl: OpsPipeline = new OpsPipeline("", {useNestingDebug: true})
  
        expect(pl).toBeDefined()
        expect(pl).toBeInstanceOf(OpsPipeline)
        expect(pl).toHaveProperty("constructor" as keyof OpsPipeline, OpsPipeline)
        
        // props should all be the defaults:
        expect(pl).toHaveProperty("isMutable" as keyof OpsPipeline, true)
        expect(pl).toHaveProperty("queue" as keyof OpsPipeline, [])
        expect(pl).toHaveProperty("fallbackOps" as keyof OpsPipeline, new WeakMap())
        expect(pl).toHaveProperty("isPipelineFlagSet" as keyof OpsPipeline, new WeakSet())
        expect(pl).toHaveProperty("env" as keyof OpsPipeline, { 
          useDebug: true, 
          useNestingDebug: true, 
          useShell: false, 
          description: "" 
        } as OpsQueueEnvSettings)
        
        // there should be not Trace object, if it wasn't requested in the env settings:
        expect(pl).toHaveProperty("trace" as keyof OpsPipeline)
        
        // methods:
        expect(Object.getPrototypeOf(pl).pipe).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).lock).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).nest).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).start).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).fallback).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).formatOp).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).traceback).toBeInstanceOf(Function)
        // should NOT have own prop methods:
        expect(Object.getOwnPropertyNames(pl)).not.toContain("pipe" as keyof OpsPipeline)
        expect(Object.getOwnPropertyNames(pl)).not.toContain("fallback" as keyof OpsPipeline)
        
        const outputTest: Output = await pl.start(input)
        
        expect(outputTest).toStrictEqual(expect.objectContaining({
          exitCode: 0,
          pipe: input,
          error: Error(),
          errorMsg: ""
        } as Output as Record<string,any>))
        
        expect(outputTest).toHaveProperty("pipe" as keyof Output, input)
        expect(outputTest.pipe).toBe(input)
        expect(outputTest.pipe).toEqual(input)
        expect(outputTest.pipe).toStrictEqual(input)
        
        // Pipeline should be locked:
        expect(pl).toHaveProperty("isMutable" as keyof OpsPipeline, false)
        
        // // this is caused by the Pipeline locking feature, it may be removed in the future:
        // expect(pl.pipe).toBeUndefined()
        // expect(pl.fallback).toBeUndefined()
        
        // // should NOT have methods first is prototype chain, but instead have the masking `undefined` props:
        // expect(Object.getOwnPropertyNames(pl)).toContain("pipe" as keyof OpsPipeline)
        // expect(Object.getOwnPropertyNames(pl)).toContain("fallback" as keyof OpsPipeline)
        
        // prototype methods are still there:
        expect(Object.getPrototypeOf(pl).pipe).toBeInstanceOf(Function)
        expect(Object.getPrototypeOf(pl).fallback).toBeInstanceOf(Function)
  
        const tb = pl.traceback()
  
        expect(tb).toHaveProperty("nestedTraces" as keyof Trace)
        expect(tb).toEqual({
          globalEvnironment: {
            description: "", 
            useDebug: true, 
            useNestingDebug: true, 
            useShell: false
          },
          enqueueChildDescriptions: [],
          enqueueInstanceInfo: [],
          enqueueLocalEnvirinments: [],
          pipelineInputs: [],
          pipelineInstanceInfo: [],
          pipelineOutputs: [],
          nestedTraces: []
        } as Trace)
      })
    })
  })

  describe("One Op in Pipeline.", () => {
    test.todo("Use `test.each` to `Fuzz` test OpsPipeline with EVERY combination of Operations that might suceed of fail.")
    
    test.todo("`useNestedDebug` environment settings...")
    
    describe("Sucessful Op:", () => {
      test.each(loStdFnV)("Fuzzing: %#: %p", async (fn, input, output) => {
        const result: Output = await new OpsPipeline("").pipe(fn, "").start(input)

        expect(result).toStrictEqual(output)
      })
    })

    describe("Failing Op:", () => {
      test.each(errStdFnV)("Fuzzing: %#: %p", async (fn, input, output) => {
        const result: Output = await new OpsPipeline("").pipe(fn, "").start(input)

        expect(result).toStrictEqual({
          ...output,
          error: Error("ERROR: Operations Pipeline had an unrecoverable failure: The main Operation failed, and there was no fallback Operation for it."),
          errorMsg: `ERROR! Error type: Error
Name of the Operation Pipeline that failed: \"\"
Error exit code: 1
Error output:  ERROR! Error type: Error
Name of the Operation that failed: \"\"
Error exit code: 1
Error output: Error`,
            pipe: [undefined]
          })
      })
    })
  })

  describe("Two Ops.", () => {
    
    test.todo("Use `test.each` to `Fuzz` test OpsPipeline with EVERY combination of Operations that might suceed of fail.")

    describe("One Op, with One fallback Op in Pipeline.", () => {
      describe("Sucessful Main Op, unused fallback Op:", () => {
        
        const mock = jest.fn()
        
        test.each(loStdFnV)("Fuzzing: %#: %p", async (...args) => {
          const [,input, output] = args

          const result: Output = await new OpsPipeline("").pipe(()=>"Main Op","").fallback(mock, "").start(input)

          expect(result).toStrictEqual({
            ...output,
            pipe: ["Main Op"]
          })

          expect(mock).not.toBeCalled()
        })
      })

      describe("Failing Main Op, sucessful fallback Op:", () => {
        test.each(errStdFnV)("Fuzzing: %#: %p", async (fn, input, output) => {
          const pl = new OpsPipeline("Failing main Op, sucessful FlOp.")
          const result: Output = await pl.pipe(fn, "Op").fallback(()=>"FlOp", "Fl-Op").start(["input", input])

          expect(result).toStrictEqual({
            ...output,
            errorMsg: "",
            exitCode: 0,
            pipe: ["FlOp"]
          })
        })
      })
      
      describe("Failing Main Op, failing fallback Op:", () => {
        test.each(errStdFnV)("Fuzzing: %#: %p", async (fn, input, output) => {
          const result: Output = await new OpsPipeline("PL").pipe(fn,"Op").fallback(fn, "FlOp").start(input)

          expect(result).toStrictEqual({
            ...output,
            error: Error("ERROR: Operations Pipeline had an unrecoverable failure: The main Operation failed, and every fallback Operation for it also failed."),
            errorMsg: `ERROR! Error type: Error
Name of the Operation Pipeline that failed: \"PL\"
Error exit code: 1
Error output:  ERROR! Error type: Error
Name of the Operation that failed: \"FlOp\"
Error exit code: 1
Error output: Error`,
            pipe: input
          })
        })
      })
    })

    describe("One Op, piped into another Op.", () => {
      describe("Sucessful main Op, piped into another sucessful main Op:", () => {
        const mock = jest.fn(() => "return 1")
        const mock2 = jest.fn((str) => `return ${str.replace("return", "received")} 2`)

        afterEach(() => {
          mock.mockClear()
          mock2.mockClear()
        })

        test.each(loStdFnV)("Fuzzing: %#: %p", async (...args) => {

          const [, input, output] = args
          const result: Output = await new OpsPipeline("PL").pipe(mock,"Op-1").pipe(mock2, "Op-2").start(input)

          expect(result).toStrictEqual({
            ...output,
            pipe: ["return received 1 2"]
          })
          expect(mock).toBeCalledTimes(1)
          expect(mock2).toBeCalledTimes(1)
        })
      })
    })

    describe("One Nested Pipeline, that has two Ops:", () => {

      test.todo("Use `test.each` to `Fuzz` test OpsPipeline with EVERY combination of Operations that might suceed of fail.")

      describe("Nested Pipeline: Sucessful Main Op, unused fallback Op:", () => {
        const mock = jest.fn()
        
        test.each(loStdFnV)("Fuzzing: %#: %p", async (...args) => {
          const [, input, output] = args

          const result: Output = await new OpsPipeline("").pipe(
            new OpsPipeline("")
             .pipe(()=>"Main Op","")
             .fallback(mock, "")
          ).start(input)

          expect(result).toStrictEqual({
            ...output,
            pipe: ["Main Op"]
          })
          expect(mock).not.toBeCalled()
        })
      })

      describe("Nested Pipeline: Failing Main Op, sucessful fallback Op:", () => {
        test.each(errStdFnV)("Fuzzing: %#: %p", async (fn, input, output) => {
          const result: Output = await new OpsPipeline("").pipe(
            new OpsPipeline("")
            .pipe(fn, "")
            .fallback(()=>"FlOp", "")
          ).start(input)

          expect(result).toStrictEqual({
            ...output,
            pipe: ["FlOp"],
            errorMsg: "",
            exitCode: 0
          })
        })
      })
      
      describe("Nested Pipeline: Failing Main Op, failing fallback Op:", () => {
        test.each(errStdFnV)("Fuzzing: %#: %p", async (fn, input, output) => {
          const result: Output = await new OpsPipeline("").pipe(
            new OpsPipeline("")
             .pipe(fn,"")
             .fallback(fn, "")
          ).start(input)

          expect(result).toStrictEqual({
            ...output,
            errorMsg: `ERROR! Error type: Error
Name of the Operation Pipeline that failed: \"\"
Error exit code: 1
Error output:  ERROR! Error type: Error
Name of the Operation Pipeline that failed: \"\"
Error exit code: 1
Error output:  ERROR! Error type: Error
Name of the Operation that failed: \"\"
Error exit code: 1
Error output: Error`,
            error: Error("ERROR: Operations Pipeline had an unrecoverable failure: The main Operation failed, and there was no fallback Operation for it."),
            pipe: input
          })
        })
      })

      describe("One Op, piped into another Op.", () => {
        describe("Nested pipeline sucessful main Op, piped into another sucessful main Op:", () => {
          const mock = jest.fn(() => "return 1")
          const mock2 = jest.fn((str) => `return ${str.replace("return", "received")} 2`)
  
          afterEach(() => {
            mock.mockClear()
            mock2.mockClear()
          })
  
          test.each(loStdFnV)("Fuzzing: %#: %p", async (...args) => {
  
            const [, input, output] = args
            const pl = new OpsPipeline("Nested-PL").pipe(mock,"Op-1").pipe(mock2, "Op-2")
            const result: Output = await new OpsPipeline("PL").pipe(pl).start(input)
  
            expect(result).toStrictEqual({
              ...output,
              pipe: ["return received 1 2"]
            })
            expect(mock).toBeCalledTimes(1)
            expect(mock2).toBeCalledTimes(1)
          })
        })
      })
    })
  })
})



describe("TODOs that aren't even close to being done...", () => {
  test.todo("Convert TS `private` props the ESNEXT #privateClassFields...")

  test.todo("CustomError (type of `Output.error` is base type `Error`) integration...")

  test.todo("`Op` should format `Output.errorMsg`...")

  test.todo("`Op` and `OpsPipeline` with \"Fuzzing\" testing (for `env`, `Operations`, and Errors) using Jest \"Mock\" functions...")

  test.todo("`Op` with interupting the `Operation` with Node.js `EventEmitters`...")

  test.todo("`OpsPipeline` with interupting (with Node.js `EventEmitters`) to abort any further `Ops` from being called, and exit cleanly...")
})
  