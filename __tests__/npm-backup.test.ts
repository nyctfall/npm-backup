/**
 * @file Test all of the CLI functions using a CLI mock to ensure API stability.
 *
 * Tests NPM for any API changes.
 * Tests CLI output format stability.
 * Tests CLI's interactive mode.
 * Should primarily use snapshots for serializable data (e.g.: file trees, CLI output, etc.)
 */
import { describe, test } from "@jest/globals"
import * as cliMocker from "cli-mocker"

describe("Test NPM API stability", () => {
  describe("NPM show package info commands:", () => {
    test("NPM `view` command. (aliases: `v`, `show`, and `info`)", async () => {
      const pkgVStr = (await cliMocker.run("npm v left-pad", [])).outputs.join("")
      const pkgViewStr = (await cliMocker.run("npm view left-pad", [])).outputs.join("")
      const pkgShowStr = (await cliMocker.run("npm show left-pad", [])).outputs.join("")
      const pkgInfoStr = (await cliMocker.run("npm info left-pad", [])).outputs.join("")

      expect(pkgViewStr).toMatchSnapshot()

      expect(pkgViewStr).toEqual(pkgVStr)
      expect(pkgViewStr).toEqual(pkgInfoStr)
      expect(pkgViewStr).toEqual(pkgShowStr)
    })

    test("NPM `view --json` command. (aliases: `v`, `show`, and `info`)", async () => {
      const pkgVJSON = (await cliMocker.run("npm v --json left-pad", [])).outputs.join("")
      const pkgViewJSON = (await cliMocker.run("npm view --json left-pad", [])).outputs.join("")
      const pkgShowJSON = (await cliMocker.run("npm show --json left-pad", [])).outputs.join("")
      const pkgInfoJSON = (await cliMocker.run("npm info --json left-pad", [])).outputs.join("")

      expect(pkgViewJSON).toMatchSnapshot()

      expect(pkgViewJSON).toEqual(pkgVJSON)
      expect(pkgViewJSON).toEqual(pkgInfoJSON)
      expect(pkgViewJSON).toEqual(pkgShowJSON)
    })
  })

  describe("NPM search default package registry commands:", () => {
    test("NPM `search` command. (aliases: `s`, `se`, and `find`)", async () => {
      const pkgSStr = (await cliMocker.run("npm s left-pad", [])).outputs.join("")
      const pkgSeStr = (await cliMocker.run("npm se left-pad", [])).outputs.join("")
      const pkgFindStr = (await cliMocker.run("npm find left-pad", [])).outputs.join("")
      const pkgSearchStr = (await cliMocker.run("npm search left-pad", [])).outputs.join("")

      expect(pkgSearchStr).toMatchSnapshot()

      expect(pkgSearchStr).toEqual(pkgSStr)
      expect(pkgSearchStr).toEqual(pkgSeStr)
      expect(pkgSearchStr).toEqual(pkgFindStr)
    })

    test("NPM `search --long` command. (aliases: `s`, `se`, and `find`)", async () => {
      const pkgSStr = (await cliMocker.run("npm s --long left-pad", [])).outputs.join("")
      const pkgSeStr = (await cliMocker.run("npm se --long left-pad", [])).outputs.join("")
      const pkgFindStr = (await cliMocker.run("npm find --long left-pad", [])).outputs.join("")
      const pkgSearchStr = (await cliMocker.run("npm search --long left-pad", [])).outputs.join("")

      expect(pkgSearchStr).toMatchSnapshot()

      expect(pkgSearchStr).toEqual(pkgSStr)
      expect(pkgSearchStr).toEqual(pkgSeStr)
      expect(pkgSearchStr).toEqual(pkgFindStr)
    })

    test("NPM `search --json` command. (aliases: `s`, `se`, and `find`)", async () => {
      const pkgSJSON = (await cliMocker.run("npm s --json left-pad", [])).outputs.join("")
      const pkgSeJSON = (await cliMocker.run("npm se --json left-pad", [])).outputs.join("")
      const pkgFindJSON = (await cliMocker.run("npm find --json left-pad", [])).outputs.join("")
      const pkgSearchJSON = (await cliMocker.run("npm search --json left-pad", [])).outputs.join("")

      expect(pkgSearchJSON).toMatchSnapshot()

      expect(pkgSearchJSON).toEqual(pkgSJSON)
      expect(pkgSearchJSON).toEqual(pkgSeJSON)
      expect(pkgSearchJSON).toEqual(pkgFindJSON)
    })

    test("NPM `search --parseable` command. (aliases: `s`, `se`, and `find`)", async () => {
      const pkgSStr = (await cliMocker.run("npm s --parseable left-pad", [])).outputs.join("")
      const pkgSeStr = (await cliMocker.run("npm se --parseable left-pad", [])).outputs.join("")
      const pkgFindStr = (await cliMocker.run("npm find --parseable left-pad", [])).outputs.join("")
      const pkgSearchStr = (await cliMocker.run("npm search --parseable left-pad", [])).outputs.join("")

      expect(pkgSearchStr).toMatchSnapshot()

      expect(pkgSearchStr).toEqual(pkgSStr)
      expect(pkgSearchStr).toEqual(pkgSeStr)
      expect(pkgSearchStr).toEqual(pkgFindStr)
    })

    // test is non-functional, `--description` option seemingly has no effect, (possible NPM bug?):
    /*
    test("NPM `search --description` command. (aliases: `s`, `se`, and `find`)", async () => {
      // `--description` should be the default:
      const pkgSearchStr = (await cliMocker.run("npm search left-pad", [])).outputs.join("")

      // `--description` should equivalent to `--description=true`:
      const pkgSearchStrDesc = (await cliMocker.run("npm search --description left-pad", [])).outputs.join("")

      const pkgSStrDescTrue = (await cliMocker.run("npm s --description=true left-pad", [])).outputs.join("")
      const pkgSeStrDescTrue = (await cliMocker.run("npm se --description=true left-pad", [])).outputs.join("")
      const pkgFindStrDescTrue = (await cliMocker.run("npm find --description=true left-pad", [])).outputs.join("")
      const pkgSearchStrDescTrue = (await cliMocker.run("npm search --description=true left-pad", [])).outputs.join("")

      const pkgSStrDescFalse = (await cliMocker.run("npm s --description=false left-pad", [])).outputs.join("")
      const pkgSeStrDescFalse = (await cliMocker.run("npm se --description=false left-pad", [])).outputs.join("")
      const pkgFindStrDescFalse = (await cliMocker.run("npm find --description=false left-pad", [])).outputs.join("")
      const pkgSearchStrDescFalse = (await cliMocker.run("npm search --description=false left-pad", [])).outputs.join(
        ""
      )

      // `--description` should be the default:
      expect(pkgSearchStr).toEqual(pkgSearchStrDesc)

      // `--description` should be equivalent to `--description=true`:
      expect(pkgSearchStrDesc).toEqual(pkgSearchStrDescTrue)

      // `--description` option should effect output:
      expect(pkgSearchStrDescTrue).not.toEqual(pkgSearchStrDescFalse)

      expect(pkgSearchStrDescTrue).toMatchSnapshot()
      expect(pkgSearchStrDescFalse).toMatchSnapshot()

      expect(pkgSearchStrDescTrue).toEqual(pkgSStrDescTrue)
      expect(pkgSearchStrDescTrue).toEqual(pkgSeStrDescTrue)
      expect(pkgSearchStrDescTrue).toEqual(pkgFindStrDescTrue)

      expect(pkgSearchStrDescFalse).toEqual(pkgSStrDescFalse)
      expect(pkgSearchStrDescFalse).toEqual(pkgSeStrDescFalse)
      expect(pkgSearchStrDescFalse).toEqual(pkgFindStrDescFalse)
    })
    */

    // test ANSI-color behavior in non-TTY environments:
    test("NPM `search --color` command. (aliases: `s`, `se`, and `find`)", async () => {
      // `--color` should be the default:
      const pkgSearchStr = (await cliMocker.run("npm search left-pad", [])).outputs.join("")

      // `--color` should equivalent to `--color=true`:
      const pkgSearchStrColor = (await cliMocker.run("npm search --color left-pad", [])).outputs.join("")

      // `--color=always` should equivalent to `--color=true` in a TTY, should force color in non-TTY environments:
      const pkgSearchStrColorTrue = (await cliMocker.run("npm s --color=true left-pad", [])).outputs.join("")

      const pkgSStrColorAlways = (await cliMocker.run("npm search --color=always left-pad", [])).outputs.join("")
      const pkgSeStrColorAlways = (await cliMocker.run("npm se --color=always left-pad", [])).outputs.join("")
      const pkgFindStrColorAlways = (await cliMocker.run("npm find --color=always left-pad", [])).outputs.join("")
      const pkgSearchStrColorAlways = (await cliMocker.run("npm search --color=always left-pad", [])).outputs.join("")

      const pkgSStrColorFalse = (await cliMocker.run("npm s --color=false left-pad", [])).outputs.join("")
      const pkgSeStrColorFalse = (await cliMocker.run("npm se --color=false left-pad", [])).outputs.join("")
      const pkgFindStrColorFalse = (await cliMocker.run("npm find --color=false left-pad", [])).outputs.join("")
      const pkgSearchStrColorFalse = (await cliMocker.run("npm search --color=false left-pad", [])).outputs.join("")

      // `--color` should be equivalent to `--color=true`:
      expect(pkgSearchStrColor).toEqual(pkgSearchStrColorTrue)

      // `--color` option should effect output:
      expect(pkgSearchStrColorAlways).not.toEqual(pkgSearchStrColorFalse)

      // `--color` should not be the default in a non-TTY environment:
      expect(pkgSearchStr).toEqual(pkgSearchStrColorTrue)
      expect(pkgSearchStr).toEqual(pkgSearchStrColorFalse)
      expect(pkgSearchStr).not.toEqual(pkgSearchStrColorAlways)

      // this is a non-TTY environment, and `--color=always` should force using colors unlike `--color=true`:
      expect(pkgSearchStrColorTrue).toEqual(pkgSearchStrColorFalse)
      expect(pkgSearchStrColorTrue).not.toEqual(pkgSearchStrColorAlways)

      expect(pkgSearchStrColorTrue).toMatchSnapshot()
      expect(pkgSearchStrColorFalse).toMatchSnapshot()
      expect(pkgSearchStrColorAlways).toMatchSnapshot()

      expect(pkgSearchStrColorAlways).toEqual(pkgSStrColorAlways)
      expect(pkgSearchStrColorAlways).toEqual(pkgSeStrColorAlways)
      expect(pkgSearchStrColorAlways).toEqual(pkgFindStrColorAlways)

      expect(pkgSearchStrColorFalse).toEqual(pkgSStrColorFalse)
      expect(pkgSearchStrColorFalse).toEqual(pkgSeStrColorFalse)
      expect(pkgSearchStrColorFalse).toEqual(pkgFindStrColorFalse)
    })
  })
})
