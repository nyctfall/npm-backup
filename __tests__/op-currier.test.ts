import { describe, test, expect } from "@jest/globals"
import { op, opCurry } from "../src/op-queue-pipeline"
import type { Output } from "../src/pipeline-types"

// The OpCurrier:
describe("The `Op` Currier function that returns a callable function that then calls an `Op` with the `fn` argument as the function for the `Op` to wrap.", () => {
  test("`OpCurrier` is equivalent to calling `Op`", async () => {
    await expect(opCurry((...a: unknown[]) => a)([true])).resolves.toStrictEqual(
      await op((...a: unknown[]) => a, [true])
    )
  })

  describe("`OpCurrier` uses same error handling as calling `Op` directly", () => {
    describe("Error object stays the same.", () => {
      test("arrow function.", async () => {
        const error = new Error("Test Error")
        await expect(
          opCurry(() => {
            throw error
          })([])
        ).resolves.toHaveProperty("error" as keyof Output, error)
      })

      test("async arrow function.", async () => {
        const error = new Error("Test Error")
        await expect(
          opCurry(async () => {
            throw error
          })([])
        ).resolves.toHaveProperty("error" as keyof Output, error)
      })
    })

    describe("Error code stays the same.", () => {
      test("arrow functions.", async () => {
        await expect(
          op(() => {
            throw Error()
          }, [])
        ).resolves.toHaveProperty(
          "exitCode" as keyof Output,
          (
            await opCurry(() => {
              throw Error()
            })([])
          ).exitCode
        )
      })

      test("async arrow functions.", async () => {
        await expect(
          op(async () => {
            throw Error()
          }, [])
        ).resolves.toHaveProperty(
          "exitCode" as keyof Output,
          (
            await opCurry(async () => {
              throw Error()
            })([])
          ).exitCode
        )
      })
    })
  })
})
