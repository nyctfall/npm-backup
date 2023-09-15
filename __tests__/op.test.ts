/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable require-yield */
import { describe, test, expect } from "@jest/globals"
import { op, OpsPipeline } from "../src/op-queue-pipeline"
import type { Input, Operation, Output } from "../src/pipeline-types"
import { loStdFnV, loNonStdFnV, errStdFnV } from "../src/test-helper-presets"
import { exec, execSync } from "child_process"
import { promisify } from "util"
const execAsync = promisify(exec)

test("array compat", async () => {
  expect((await new OpsPipeline("").pipe(() => {}, "").start()).pipe).toEqual([undefined])
  expect((await new OpsPipeline("").pipe(a => a, "").start()).pipe).toEqual([undefined])
  expect((await new OpsPipeline("").pipe(() => [1], "").start()).pipe).toEqual([[1]])

  expect((await new OpsPipeline("").pipe(() => {}, "").start([1])).pipe).toEqual([undefined])
  expect((await new OpsPipeline("").pipe(a => a, "").start([1])).pipe).toEqual([[1]])
  expect((await new OpsPipeline("").pipe(() => [2], "").start([1])).pipe).toEqual([[2]])

  expect((await new OpsPipeline("").pipe(a => [...a, 2], "").start([1])).pipe).toEqual([[1, 2]])

  expect(
    (
      await new OpsPipeline("")
        .pipe(a => [...a, 2], "")
        .pipe(a => [...a, 3], "")
        .start([1])
    ).pipe
  ).toEqual([[1, 2, 3]])
})

// The Op:
describe("The async/await function wrapper `Op`, a singular `Operation` in put in the wrapper function.", () => {
  describe("`Op` should return an `Output` object (TS interface type).", () => {
    test("flow-through/loop-back arrow function.", async () => {
      await expect(op((...args: unknown[]) => args, [true])).resolves.toStrictEqual({
        error: Error(),
        errorMsg: "",
        exitCode: 0,
        pipe: [[true]]
      } as Output)
    })

    test("flow-through/loop-back async arrow function.", async () => {
      await expect(op(async (...args: unknown[]) => args, [true])).resolves.toStrictEqual({
        error: Error(),
        errorMsg: "",
        exitCode: 0,
        pipe: [[true]]
      } as Output)
    })

    test("flow-through/loop-back function statement.", async () => {
      await expect(
        op(
          function (...args: unknown[]) {
            return args
          },
          [true]
        )
      ).resolves.toStrictEqual({
        error: Error(),
        errorMsg: "",
        exitCode: 0,
        pipe: [[true]]
      } as Output)
    })

    test("flow-through/loop-back async function statement.", async () => {
      await expect(
        op(
          async function (...args: unknown[]) {
            return args
          },
          [true]
        )
      ).resolves.toStrictEqual({
        error: Error(),
        errorMsg: "",
        exitCode: 0,
        pipe: [[true]]
      } as Output)
    })

    describe("The `Op` wrapper is NOT compatible with Generator or AsyncGenerator functions", () => {
      describe("The `Op` should return an output-like object, excluding `.pipe` property.", () => {
        test("generator function statement.", async () => {
          await expect(
            op(
              function* (...args: unknown[]) {
                return args
              },
              [true]
            )
          ).resolves.toStrictEqual(
            expect.objectContaining({
              error: Error(),
              errorMsg: "",
              exitCode: 0
            } as Omit<Output, "pipe">)
          )
        })

        test("async generator function statement.", async () => {
          await expect(
            op(
              async function* (...args: unknown[]) {
                return args
              },
              [true]
            )
          ).resolves.toStrictEqual(
            expect.objectContaining({
              error: Error(),
              errorMsg: "",
              exitCode: 0
            } as Omit<Output, "pipe">)
          )
        })
      })

      describe("The `Op` should NOT return a valid `.pipe` property (type Array<any>).", () => {
        test("generator function statement.", async () => {
          await expect(
            op(
              function* (...args: unknown[]) {
                return args
              },
              [true]
            )
          ).resolves.not.toHaveProperty("pipe" as keyof Output, [true])
        })

        test("async generator function statement.", async () => {
          await expect(
            op(
              async function* (...args: unknown[]) {
                return args
              },
              [true]
            )
          ).resolves.not.toHaveProperty("pipe" as keyof Output, [true])
        })
      })
    })
  })

  describe("The `Op` should catch all Errors thrown by the wrapped `Operation`.", () => {
    describe("`Op` should return the Error by putting it in the `.error` property of the `Output`.", () => {
      test("arrow function.", async () => {
        const error = new Error("Test Error")
        await expect(
          op(() => {
            throw error
          }, [])
        ).resolves.toHaveProperty("error" as keyof Output, error)
      })

      test("async arrow function.", async () => {
        const error = new Error("Test Error")
        await expect(
          op(async () => {
            throw error
          }, [])
        ).resolves.toHaveProperty("error" as keyof Output, error)
      })

      test("function statement.", async () => {
        const error = new Error("Test Error")
        await expect(
          op(function () {
            throw error
          }, [])
        ).resolves.toHaveProperty("error" as keyof Output, error)
      })

      test("async function statement.", async () => {
        const error = new Error("Test Error")
        await expect(
          op(async function () {
            throw error
          }, [])
        ).resolves.toHaveProperty("error" as keyof Output, error)
      })

      describe("Should return default preset Error, when the thrown error is NOT an instanceof the Error type object.", () => {
        test("arrow function.", async () => {
          await expect(
            op(() => {
              throw "not an Error() object"
            }, [])
          ).resolves.toStrictEqual(
            expect.objectContaining({
              error: Error()
            })
          )
        })

        test("async arrow function.", async () => {
          await expect(
            op(async () => {
              throw "not an Error() object"
            }, [])
          ).resolves.toStrictEqual(
            expect.objectContaining({
              error: Error()
            })
          )
        })
      })
    })

    describe("`Op` should return a non-zero `Output.exitCode` on Error.", () => {
      test("arrow function.", async () => {
        await expect(
          op(() => {
            throw Error()
          }, [])
        ).resolves.not.toHaveProperty("exitCode" as keyof Output, 0)
      })

      test("async arrow function.", async () => {
        await expect(
          op(async () => {
            throw Error()
          }, [])
        ).resolves.not.toHaveProperty("exitCode" as keyof Output, 0)
      })

      test("function statement.", async () => {
        await expect(
          op(function () {
            throw Error()
          }, [])
        ).resolves.not.toHaveProperty("exitCode" as keyof Output, 0)
      })

      test("async function statement.", async () => {
        await expect(
          op(async function () {
            throw Error()
          }, [])
        ).resolves.not.toHaveProperty("exitCode" as keyof Output, 0)
      })
    })

    describe("`Op` should change behavior according to te `env` setttings.", () => {
      describe("`env.useShell` set to true in `env` setttings, should use Bourne-like shell `$?` variable in the `code` or `status` property on the Error thrown by the Node.js child_process.", () => {
        test.todo(
          "Make compatibility for all of the different Error properties Node.js child_process sets on the thrown errors, so far `.code` is used for `exec`, and `.status` is used for `execSync`."
        )

        test("arrow function.", async () => {
          await expect(op(() => execSync("exit 255"), [undefined], { useShell: true })).resolves.toStrictEqual({
            pipe: [],
            error: Error(),
            exitCode: 255,
            errorMsg:
              'ERROR! Error type: Error\nName of the Operation that failed: "No Description"\nError exit code: 255\nError output: Error'
          } as Output)
        })

        test("async arrow function.", async () => {
          await expect(
            op(async () => await execAsync("exit 255"), [undefined], { useShell: true })
          ).resolves.toStrictEqual({
            pipe: [],
            error: Error(),
            exitCode: 255,
            errorMsg:
              'ERROR! Error type: Error\nName of the Operation that failed: "No Description"\nError exit code: 255\nError output: Error'
          } as Output)
        })
      })

      describe("`env.useDebug` on thrown Error.", () => {
        // spy on calls to `console.error()`
        const consoleErrorSpy = jest.spyOn(global.console, "error")

        // setup Mock fn of `console.log()` and `console.error()`
        beforeEach(() => {
          consoleErrorSpy.mockReset()
        })

        afterAll(() => {
          consoleErrorSpy.mockRestore()
        })

        test('arrow function, also calls Jest mock fn for `.spyOn(global.console, "error")`.', async () => {
          const errorMsg =
            'ERROR! Error type: Error\nName of the Operation that failed: "No Description"\nError exit code: 1\nError output: Error'
          await expect(
            op(
              () => {
                throw Error()
              },
              [undefined],
              { useDebug: true }
            )
          ).resolves.toStrictEqual({
            pipe: [],
            error: Error(),
            exitCode: 1,
            errorMsg
          } as Output)
          expect(consoleErrorSpy).toHaveBeenCalled()
          expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
          expect(consoleErrorSpy).toHaveBeenCalledWith(errorMsg)
        })

        test('async arrow function, also calls Jest mock fn for `.spyOn(global.console, "error")`.', async () => {
          const errorMsg =
            'ERROR! Error type: Error\nName of the Operation that failed: "No Description"\nError exit code: 1\nError output: Error'
          await expect(
            op(
              () => {
                throw Error()
              },
              [undefined],
              { useDebug: true }
            )
          ).resolves.toStrictEqual({
            pipe: [],
            error: Error(),
            exitCode: 1,
            errorMsg
          } as Output)
          expect(consoleErrorSpy).toHaveBeenCalled()
          expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
          expect(consoleErrorSpy).toHaveBeenCalledWith(errorMsg)
        })
      })

      describe("`env.description` on thrown Error.", () => {
        const error = new Error("err-msg")
        const errorMsg =
          'ERROR! Error type: Error\nName of the Operation that failed: "fn"\nError exit code: 1\nError output: Error: err-msg'

        test("arrow function", async () => {
          await expect(
            op(
              () => {
                throw error
              },
              [],
              { description: "fn" }
            )
          ).resolves.toStrictEqual({
            error,
            pipe: [],
            exitCode: 1,
            errorMsg
          } as Output)
        })

        test("async arrow function", async () => {
          await expect(
            op(
              async () => {
                throw error
              },
              [],
              { description: "fn" }
            )
          ).resolves.toStrictEqual({
            error,
            pipe: [],
            exitCode: 1,
            errorMsg
          } as Output)
        })
      })
    })
  })
})

test.todo("Make fuzz testing for ALL types of settings.")

describe('`Op` should return an `Output` object, "same-y-ness" test.', () => {
  test.each(loStdFnV)("Fuzzing: %#: %p.", async (fn, argv, result) => {
    // test Op that returns the
    const output = await op(fn, argv)

    // test same contents of array:
    expect(output).toStrictEqual(result)
  })
})

describe('`Op` should return an `Output` object, "loopback" test.', () => {
  test.each(loStdFnV)("Fuzzing: %#: %p.", async (fn, argv, result) => {
    // test Op that returns the
    const output = await op(fn, [argv], { useLoopback: true })

    // test exact SAME array object is returned:
    expect(output).toStrictEqual({ ...result, pipe: output.pipe })
    expect(output.pipe[0]).toBe(argv)
  })
})

describe("`Op` should return an `Output` object, GeneratorFunction test.", () => {
  test.each(loNonStdFnV)("Fuzzing: %#: %p.", async (...args) => {
    const [fn, argv, result, done] = args

    // test Op that returns valid output:
    const output = await op(fn as Operation, argv as Input)

    // test contents of output pipe:
    expect(output.pipe).toBeInstanceOf(Array)
    // ensure it is an iterable:
    expect(output.pipe[0]).toBeInstanceOf(Object)
    expect((output.pipe[0] as unknown)?.toString()).toMatch(/.*Generator.*/)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((output.pipe[0] as any).next).toBeInstanceOf(Function)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((output.pipe[0] as any).throw).toBeInstanceOf(Function)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((output.pipe[0] as any).return).toBeInstanceOf(Function)
    // test iterator:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(await (output.pipe[0] as any).next()).toStrictEqual({
      value: result.pipe,
      done
    })
    // check the yielded iterator is now done:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(await (output.pipe[0] as any).next()).toStrictEqual({
      value: undefined,
      done: true
    })

    // check other output values:
    expect({
      error: output.error,
      errorMsg: output.errorMsg,
      exitCode: output.exitCode
    }).toStrictEqual({
      error: result.error,
      errorMsg: result.errorMsg,
      exitCode: result.exitCode
    })
  })
})

describe('`Op` should catch ALL thrown errors, Error "loopback".', () => {
  test.each(errStdFnV)("Fuzzing: %#: %p.", async (fn, argv, result) => {
    // test Op that returns the
    const output = await op(fn, argv)

    // test returned error responce:
    expect(output).toStrictEqual(result)

    // test exact SAME array object is returned:
    expect(output.error).toBe(result.error) // todo
  })
})
