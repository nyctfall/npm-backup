import { promisify } from "util"
import {
  /* execSync as bufferExecSync, */ /* exec as callbackExec, */ /* execFileSync as bufferExecFileSync, */ execFile as callbackExecFile /* ExecFileSyncOptions */
} from "child_process"
import { createInterface /* , Interface */ } from "readline"

/* async IIFE instead of top-level await: */
;(async () => {
  /**
   * @TODO
   * Arguments:
   * MVP:
   * NPM pkgs
   * target NPM pkg backup output dir
   * deps to backup all or a mix of {production|development|optional|peer}
   * version to get, eg: @ latest, or a list of versions to get
   *
   * Extra:
   * multi-pkg backups, with many pkgs's deps installed and deduped
   * chronlogical archive mode that backs up all versions {major.minor.patch}
   *
   * Run:
   * sanitize user input:
   * remove ALL characters that aren't used on NPM
   * only allow: '.' '@', '/', '-', A-Z, a-z, and 0-9
   *
   * get user confirmation of desired pkgs:
   * use NPM search for every string arg, to prevent misspelling
   * use NPM view to confirm properly spelled pkgs
   *
   * create tmp dir for NPM pkg installs:
   * mkdir
   * cd into dir
   * npm install using --global-style so the deps will be in the pkgs's dir in node_modules
   *
   * edit package.json files for every pkg to add all {production|optional|development} deps to bundeledDependencies field:
   * use JSON.parse() to get deps
   * edit object to add props
   * use JSON.stringify() to rewrite package.json file
   *
   * make offline NPM pkg backup:
   * use npm pack, adds pkg to NPM cache
   * OR use tar -cwzvf /path/to/backup/dir NPM-pkg-dir
   * -z is to select gzip compression
   * this doesn't add pkg to NPM cache
   *
   * clean up tmp dir and move pkg backups to target dir:
   * rm tmp npm install dir
   * mv pkg backups to target dir
   *
   */

  const { argv, /* chdir ,*/ cwd, stdin, stdout } = process
  // const { dirname, basename, extname, format, isAbsolute, join, normalize, parse, relative, resolve, sep } = posix
  // const { readFile, writeFile, rename, access, mkdir, mkdtemp, open, opendir, readdir, rmdir, rm } = fsPromises
  const rl = createInterface({
    input: stdin,
    output: stdout
  })
  const { log } = console
  const [, , ...runtimeArgs] = argv

  const execFile = promisify(callbackExecFile)
  // const exec = promisify(callbackExec)
  /* const execSync = (input: string, stringEncoding: "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex", stringStart: number, stringEnd: number): string => {
    return bufferExecSync(input).toString(stringEncoding, stringStart, stringEnd)
  } */
  /* const execFileSync = (input: string, args?: string[] | undefined, opts?: ExecFileSyncOptions | undefined, stringEncoding?: "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex" | undefined, stringStart?: number | undefined, stringEnd?: number | undefined): string => {
    return bufferExecFileSync(input, args, opts).toString(stringEncoding, stringStart, stringEnd)
  } */

  // logs unsanitized args:
  log(`argv: ${JSON.stringify(argv)}`)
  log(`runtimeArgs: ${JSON.stringify(runtimeArgs)}`)
  log(`cwd: ${cwd()}`)

  // async/await compatible readline.question() function:
  // this returns the user's responce string.
  const promiseQuestion = (question: string): Promise<string> => {
    // return created promise:
    return new Promise((resolve: Function) => {
      // use normal readline.question() method:
      rl.question(question, (responce: string) => {
        // resolve promise with user input to return from promise:
        resolve(responce)
      })
    })
  }

  // async/await and for await...of compatible readline.on("line") event:
  // this returns the line data from the readline.
  /* const promiseLine = async function*(readlineInstance: Interface){
    // track whether readline interface is still active:
    let rlIsOn: boolean = true
    // the promise used to return the async line data:
    let linePromise: Promise<string>

    // stop looping on a close readline interface:
    readlineInstance.on("close", () => {
      rlIsOn = false
    })

    while (rlIsOn){
      // create promise that uses normal readline.on("line") event listener:
      linePromise = new Promise((resolve) => {
        readlineInstance.on("line", (line: string) => {
          resolve(line)
        })
      })

      // yield line from readline in form of promise:
      yield linePromise
    }
  } */

  // NPM search pkg user confirmation responce:
  interface UserSearchNPMPkgResponce {
    correctPkg: string
    pkgFound: boolean
  }
  // sanitized NPM pkg string object:
  class NPMPkg {
    #_identifier = ""

    set name(newName: string) {
      this.#_identifier = NPMPkg.argSanitize(newName)
    }

    get name(): string {
      return this.#_identifier
    }

    constructor(pkgName: string) {
      // set the pkg name id to a shell and NPM safe string:
      this.#_identifier = NPMPkg.argSanitize(pkgName)
    }

    // only use chars allowed in NPM:
    // only allow: A-Z, a-z, 0-9, '@', '/', and '-'.
    // this regex will match not allowed chars.
    static readonly unsafeNPMRegex: RegExp = /[^\w@/.-]/gi

    // this regex will match only allowed chars.
    static readonly NPMPkgRegex: RegExp = /^[\w@/.-]+/

    // this will find pkg name is NPM search results even in non-parseable mode:
    // will even work with long and non-long mode,
    // multi-line pkgs will need some further processing though...
    static readonly NPMSearchPkgRegex: RegExp =
      /^[\w@/.-]+(?= {2,})|^[\w@/.-]+.+(?:[\r|\n|\r\n][\w@/.-]+(?=.+\| +\|).*)+/gim

    // this will split each search result into a separate match:
    static readonly NPMSearchResultRegex: RegExp = /(?=^[\w@/.-]+(?!.*\| +\|)(?:.*\n.+(?:\| +\|)+.*)*)/gim

    // this will do the post processing that NPMSearchPkgRegex needs to make a complete pkg name:
    /** @todo */
    static NPMSearchPkg() {}

    // this sanitizes an arg for NPM:
    static argSanitize(rawArg: string): string {
      // just remove bad chars by replacing with empty string:
      // return sanitized string to string arg array:
      return rawArg.replace(NPMPkg.unsafeNPMRegex, "")
    }
  }

  // coerced user responce to a yes or no answer blueprints:
  // returned answer object:
  interface Answer {
    isYes: boolean
    isNo: boolean
    isDefault: boolean
  }
  // default answer blueprint:
  // toYes and toNo should be MUTUALLY EXCLUSIVE when setting defaults!
  interface SetDefaultAnswerYes {
    readonly toYes: boolean
    readonly toNo?: (false & boolean) | never
  }
  interface SetDefaultAnswerNo {
    readonly toYes?: (false & boolean) | never
    readonly toNo: boolean
  }
  type SetDefaultAnswer = SetDefaultAnswerYes | SetDefaultAnswerNo
  // reads whether toYes and toNo should be true or false:
  interface ReadDefaultAnswer {
    readonly toYes: boolean
    readonly toNo: boolean
  }
  // user input interpreter for confirmation:
  class Confirmer {
    readonly #_defaultAnswer: ReadDefaultAnswer

    constructor({ toYes = false, toNo = false }: SetDefaultAnswer = { toYes: false, toNo: false }) {
      this.#_defaultAnswer = { toYes, toNo }
    }

    // use defaults to find or coerce user responce to an answer:
    interpret(responce: string): Answer {
      // initialize to default reply:
      const answerInfo: Answer = {
        // if default answer = "yes" is true, then answer is "yes" = true:
        // if default answer = "yes" is false, then answer is "yes" = false:
        isYes: this.#_defaultAnswer.toYes,
        // if default answer = "yes" is true, then default answer is "no" = false:
        // if default answer = "yes" is false, then default answer is "no" = true:
        isNo: this.#_defaultAnswer.toNo,
        // user responce wasn't "yes" or "no":
        isDefault: true
      }

      // check if the responce is yes:
      if (responce.match(/^ *y(?:es)?/i)) {
        answerInfo.isDefault = false
        answerInfo.isYes = true
      }
      // check if the responce is no:
      else if (responce.match(/^ *no?/i)) {
        answerInfo.isDefault = false
        answerInfo.isNo = true
      }

      return answerInfo
    }
  }

  // this sanitizes an array of string args for NPM:
  const argvSanitize = (rawArgv: string[]): string[] => {
    // create a sanitized array of the string array:
    // for each string arg, return a sanitized string.
    const sanArgv: string[] = rawArgv.map(NPMPkg.argSanitize)

    // return sanitized arg array:
    return sanArgv
  }

  /** @TODO - make file setup to NPM pkg installs. */
  // make tmp dir for NPM pkg install:
  /*
  const initNPMDir = async (): Promise<void> => {
  }
  */

  /** @TODO - rm tmp file stuff. */
  // deletes tmp dir stuff:
  const cleanup = (exitCode: number): void => {
    log(`Exited with code: ${exitCode}`)

    // stop reading input from user:
    rl.close()
  }

  // async generator for search results:
  const pkgConfirm = async function* ({ tableHeader, resultsList }: { tableHeader: string; resultsList: string[] }) {
    // array index tracker:
    let i = 0

    // loop though all search results:
    for (const pkgSearchResult of resultsList) {
      // print result:
      log(`\n${tableHeader}\n${pkgSearchResult}`)

      // ask user, then return promise for responce:
      yield {
        // returns the interpreted user responce (defaults to no):
        answer: Controverter.interpret(await promiseQuestion("Is this the right package? (y/N): ")),
        // increments i for next loop iteration:
        index: i++
      }
    }
  }

  /** @TODO - refactor to use --parseable NPM search option */
  // search NPM for correct pkg name:
  const searchUserPkg = async (pkg: string): Promise<UserSearchNPMPkgResponce> => {
    // records if pkg was found:
    const userPkgInfo: UserSearchNPMPkgResponce = {
      correctPkg: "",
      pkgFound: false
    }

    // catch promise errors:
    try {
      // notify user of search:
      log(`\nSearching NPM for package: ${pkg} ...`)

      // catch NPM search error:
      try {
        // search NPM for pkg:
        // color can't be used in search since trying to find pkg name with the TTY code codes is a regexp's nightmare...
        const { stdout: searchResponce } = await execFile("npm", [
          "search",
          "--long",
          "--color=false",
          NPMPkg.argSanitize(pkg)
        ])

        // make array of string search results to be shown to user:
        // for compatibility with the multi-line output per pkg of NPM search --long
        // this will make each pkg search result an index in the array after the header
        const [tableHead, ...searchResults]: string[] = searchResponce
          .split(NPMPkg.NPMSearchResultRegex)
          // make sure the string doesn't have trailing newlines or whitespaces:
          .map((str: string): string => str.trimEnd())

        // catch error looping through pkg search results:
        try {
          // ask user to find correct pkg in search:
          for await (const { answer: pkgAns, index } of pkgConfirm({
            tableHeader: tableHead,
            resultsList: searchResults
          })) {
            // if pkg is correct, replace wrong pkg with the right pkg:
            if (pkgAns.isYes) {
              // get pkg name:
              // ?? '' is to prevent nullish value assignment,
              // empty string ("") is falsy so if statement won't run.
              const correctedPkg: string = searchResults[index].match(NPMPkg.NPMSearchPkgRegex)?.join("") ?? ""

              log(`\n${correctedPkg} will be downloaded.`)

              // check regexp match to make sure it's an actual pkg name match:
              if (correctedPkg) {
                // correct wrong pkg:
                userPkgInfo.correctPkg = correctedPkg
                // indicate pkg was found:
                userPkgInfo.pkgFound = true
              }

              // stop searching results since pkg was found:
              break
            }
            // if wrong pkg skip to next one:
            else if (pkgAns.isNo && index < searchResults.length - 1) {
              // if user didn't explicitly deny:
              if (pkgAns.isDefault) {
                log("\nIs it this next package...")
              }
              // if user explicitly denied:
              else {
                log("\nOh, is it this next package...")
              }
              // skip to next search result:
              continue
            }
          }
        } catch (e) {
          console.error("Problem looping through search results! ...")
          console.error(e)
        }
      } catch (e) {
        console.error("NPM search failed! ...")
        console.error(e)
      }
    } catch (e) {
      console.error("Something went wrong when searching for package! ...")
      console.error(e)
    }

    return userPkgInfo
  }

  // verify pkgs user wants to get:
  const verifyUserPkgs = async function (pkg: string, currentIndex: number, thisArray: string[]) {
    // catch any promise errors:
    try {
      // catch error for when pkg isn't in NPM registry:
      try {
        // show pkg arg to user for confirmation
        log(`\nPackage: ${pkg}`)
        log("-".repeat(stdout.columns / 2))
        log((await execFile("npm", ["view", pkg])).stdout)
      } catch (e) {
        // tell user pkg wasn't in NPM registry:
        console.error(e)
      }

      // get responce: defaults to Yes
      const answer: Answer = Affirmer.interpret(await promiseQuestion("Is this the right package? (Y/n): "))

      if (answer.isNo) {
        // ask user to find their mistyped pkg in search results:
        const { correctPkg, pkgFound } = await searchUserPkg(pkg)

        if (pkgFound) {
          // correct mistyped pkg name with correct pkg name:
          thisArray[currentIndex] = correctPkg
        } else {
          /** @TODO */
          // ask user to retype mistyped pkg, and search for the pkg again:
          const trySubstitutePkg: Answer = Controverter.interpret(
            await promiseQuestion("Would you like to re-enter package name? (y/N): ")
          )

          // user wants to re-enter pkg name:
          if (trySubstitutePkg.isYes) {
            // have user retype pkg name:
            const newPkg: string = NPMPkg.argSanitize(await promiseQuestion("Enter new package name: "))

            // ask user to find their retyped pkg in search results:
            const { correctPkg: correctNewPkg, pkgFound: NewPkgFound } = await searchUserPkg(newPkg)

            if (NewPkgFound) {
              // correct mistyped pkg name with correct pkg name:
              thisArray[currentIndex] = correctNewPkg
            } else {
              // correct mistyped pkg name with correct pkg name:
              log("\nOh, sorry. The package can't be found,\nMoving on to the next pkg...")

              // leave this pkg array index:
              return
            }
          }
          // user wants to go on to the next pkg, user doesn't want to re-enter pkg name:
          else if (trySubstitutePkg.isNo) {
            log("\nOkay then, going on to the next package now...")
          }
        }
      }
      // if pkg is confirmed correct:
      else if (answer.isYes) {
        // user didn't explicitly confirm pkg:
        if (answer.isDefault) {
          log(`\n${pkg} will be downloaded.`)
        }
        // user explicitly confirmed pkg:
        else {
          log(`\nOkay, great. ${pkg} will be downloaded.`)
        }
      }

      /** @TODO async start pkg download */
    } catch (e) {
      console.error("Something went wrong! ...")
      console.error(e)
    }
  }

  // async generator for a for await...of loop:
  const asyncForEach = async (array: Array<unknown>, asyncCallback: Function, thisArg?: object | undefined) => {
    // catch any promise errors:
    try {
      let index = 0
      for (const value of array) {
        await asyncCallback.call(thisArg, value, index++, array)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // sanitize argv and save:
  const sanArgv: string[] = argvSanitize(runtimeArgs)

  // coerce user responce to questions, defaults to yes:
  const Affirmer = new Confirmer({ toYes: true })

  // coerce user responce to questions, defaults to no:
  const Controverter = new Confirmer({ toNo: true })

  log(`Sanitized Runtime ArgV: ${JSON.stringify(sanArgv)}`)

  // loop through each pkg arg and make sure the user wants it:
  await asyncForEach(sanArgv, verifyUserPkgs)

  // stop reading input from user:
  rl.close()

  // called before script process exits:
  process.on("beforeExit", cleanup)
})()
