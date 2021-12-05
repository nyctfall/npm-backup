"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _NPMPkg__identifier;
Object.defineProperty(exports, "__esModule", { value: true });
// import fsPromises from "fs/promises"
const util_1 = require("util");
const child_process_1 = require("child_process");
const interrogator_1 = require("./interrogator");
const process_1 = require("process");
/**
  @debrief - This module has all of the NPM search, pkg installing, and other NPM commands.

  * @todo
  * Arguments:
    * MVP:
      * NPM pkgs
      * target NPM pkg backup output dir
      * deps to backup all or a mix of {production|development|optional|peer}
      * version to get, eg: @ latest, or a list of versions to get
    *
    * Extra:
      * multi-pkg backups, with many pkgs's deps installed and deduped
      * chronlogical acrhive mode that backs up all versions {major.minor.patch}
    *
  * Run:
    * sanitize user input:
      * remove ALL characters that aren't used on NPM
      * only allow: '.' '@', '/', '-', A-Z, a-z, and 0-9
    *
    * get user confimation of desired pkgs:
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
      * OR use tar -cwzvf /path/to/bkup/dir NPM-pkg-dir
      * -z is to select gzip compression
      * this doesn't add pkg to NPM cache
    *
    * clean up tmp dir and move pkg backups to target dir:
      * rm tmp npm install dir
      * mv pkg backups to target dir
  *
*/
const { log } = console;
const execFile = (0, util_1.promisify)(child_process_1.execFile);
// sanitized NPM pkg string object:
class NPMPkg {
    constructor(pkgName) {
        _NPMPkg__identifier.set(this, "");
        // set the pkg name id to a shell and NPM safe string:
        __classPrivateFieldSet(this, _NPMPkg__identifier, NPMPkg.argSanitize(pkgName), "f");
    }
    set name(newName) {
        __classPrivateFieldSet(this, _NPMPkg__identifier, NPMPkg.argSanitize(newName), "f");
    }
    get name() {
        return __classPrivateFieldGet(this, _NPMPkg__identifier, "f");
    }
    // this will do the post processing that NPMSearchPkgRegex needs to make a complete pkg name:
    static NPMSeachPkg() { }
    // this sanitizes an arg for NPM:
    static argSanitize(rawArg) {
        // just remove bad chars by replacing with empty string:
        // return sanitized string to string arg array:
        return rawArg.replace(NPMPkg.unsafeNPMRegex, "");
    }
}
_NPMPkg__identifier = new WeakMap();
// only use chars allowed in NPM:
// only allow: A-Z, a-z, 0-9, '@', '/', and '-'.
// this regex will match not allowed chars.
NPMPkg.unsafeNPMRegex = /[^\w@/.-]/gi;
// this regex will match only allowed chars.
NPMPkg.NPMPkgRegex = /^[\w@/.-]+/;
// this will find pkg name is NPM search results even in non-parseable mode:
// will even work with long and non-long mode,
// multi-line pkgs will need some further proessing though...
NPMPkg.NPMSearchPkgRegex = /^[\w@/.-]+(?= {2,})|^[\w@/.-]+.+(?:[\r|\n|\r\n][\w@/.-]+(?=.+\| +\|).*)+/gim;
// this will split each search result into a seperate match:
NPMPkg.NPMSearchResultRegex = /(?=^[\w@/.-]+(?!.*\| +\|)(?:.*\n.+(?:\| +\|)+.*)*)/gim;
/** @TODO - make file setup to NPM pkg installs. */
// make tmp dir for NPM pkg install:
/* const initNPMDir = async (): Promise<void> => {
  
} */
// async generator for search results:
const pkgConfirm = async function* ({ tableHeader, resultsList, }) {
    // array index tracker:
    let i = 0;
    // loop though all search results:
    for (const pkgSearchResult of resultsList) {
        // print result:
        log(`\n${tableHeader}\n${pkgSearchResult}`);
        // ask user, then return promise for responce:
        yield {
            // returns the interpreted user responce (defaults to no):
            answer: interrogator_1.Controverter.interpret(await promiseQuestion("Is this the right package? (y/N): ")),
            // increments i for next loop iteration:
            index: i++,
        };
    }
};
/** @TODO - refactor to use --parseable NPM seach option */
// search NPM for correct pkg name:
const searchUserPkg = async (pkg) => {
    // records if pkg was found:
    const userPkgInfo = {
        correctPkg: "",
        pkgFound: false,
    };
    // catch promise errors:
    try {
        // notify user of search:
        log(`\nSearching NPM for package: ${pkg} ...`);
        // catch NPM search error:
        try {
            // search NPM for pkg:
            // color can't be used in search since trying to find pkg name with the TTY code codes is a regexp's nightmare...
            const { stdout: searchResponce } = await execFile("npm", [
                "search",
                "--long",
                "--color=false",
                NPMPkg.argSanitize(pkg),
            ]);
            // make array of string search results to be shown to user:
            // for compatibility with the multi-line output per pkg of NPM search --long
            // this will make each pkg search result an index in the array after the header
            const [tableHead, ...searchResults] = searchResponce
                .split(NPMPkg.NPMSearchResultRegex)
                // make sure the string doesn't have trailing newlines or whitespaces:
                .map((str) => str.trimEnd());
            // catch error looping through pkg search results:
            try {
                // ask user to find correct pkg in search:
                for await (const { answer: pkgAns, index } of pkgConfirm({
                    tableHeader: tableHead,
                    resultsList: searchResults,
                })) {
                    // if pkg is correct, replace wrong pkg with the right pkg:
                    if (pkgAns.isYes) {
                        // get pkg name:
                        // ?? '' is to prevent nullish value assignment,
                        // empty string ("") is falsy so if statement won't run.
                        const correctedPkg = searchResults[index].match(NPMPkg.NPMSearchPkgRegex)?.join("") ??
                            "";
                        log(`\n${correctedPkg} will be downloaded.`);
                        // check regexp match to make sure it's an actual pkg name match:
                        if (correctedPkg) {
                            // correct wrong pkg:
                            userPkgInfo.correctPkg = correctedPkg;
                            // indicate pkg was found:
                            userPkgInfo.pkgFound = true;
                        }
                        // stop searching results since pkg was found:
                        break;
                    }
                    // if wrong pkg skip to next one:
                    else if (pkgAns.isNo && index < searchResults.length - 1) {
                        // if user didn't explicitly deny:
                        if (pkgAns.isDefault) {
                            log("\nIs it this next package...");
                        }
                        // if user explicitly denied:
                        else {
                            log("\nOh, is it this next package...");
                        }
                        // skip to next search result:
                        continue;
                    }
                }
            }
            catch (e) {
                console.error("Problem looping through search results! ...");
                console.error(e);
            }
        }
        catch (e) {
            console.error("NPM search failed! ...");
            console.error(e);
        }
    }
    catch (e) {
        console.error("Something went wrong when searching for package! ...");
        console.error(e);
    }
    return userPkgInfo;
};
// verify pkgs user wants to get:
const verifyUserPkgs = async function (pkg, currentIndex, thisArray) {
    // catch any promise errors:
    try {
        // catch error for when pkg isn't in NPM registry:
        try {
            // show pkg arg to user for confirmation
            log(`\nPackage: ${pkg}`);
            log("-".repeat(process_1.stdout.columns / 2));
            log((await execFile("npm", ["view", pkg])).stdout);
        }
        catch (e) {
            // tell user pkg wasn't in NPM registry:
            console.error(e);
        }
        // get responce: defaults to Yes
        const answer = interrogator_1.Affirmer.interpret(await promiseQuestion("Is this the right package? (Y/n): "));
        if (answer.isNo) {
            debugger;
            // ask user to find their mistyped pkg in search results:
            const { correctPkg, pkgFound } = await searchUserPkg(pkg);
            if (pkgFound) {
                debugger;
                // correct mistyped pkg name with correct pkg name:
                thisArray[currentIndex] = correctPkg;
            }
            else {
                debugger;
                /** @TODO */
                // ask user to retype mistyped pkg, and search for the pkg again:
                const trySubstitutePkg = interrogator_1.Controverter.interpret(await promiseQuestion("Would you like to re-enter package name? (y/N): "));
                // user wants to re-enter pkg name:
                if (trySubstitutePkg.isYes) {
                    debugger;
                    // have user retype pkg name:
                    const newPkg = NPMPkg.argSanitize(await promiseQuestion("Enter new package name: "));
                    // ask user to find their retyped pkg in search results:
                    const { correctPkg: correctNewPkg, pkgFound: NewPkgFound } = await searchUserPkg(newPkg);
                    if (NewPkgFound) {
                        debugger;
                        // correct mistyped pkg name with correct pkg name:
                        thisArray[currentIndex] = correctNewPkg;
                    }
                    else {
                        debugger;
                        // correct mistyped pkg name with correct pkg name:
                        log("\nOh, sorry. The package can't be found,\nMoving on to the next pkg...");
                        // leave this pkg array index:
                        return;
                    }
                }
                // user wants to go on to the next pkg, user doesn't want to re-enter pkg name:
                else if (trySubstitutePkg.isNo) {
                    log("\nOkay then, going on to the next package now...");
                }
            }
        }
        // if pkg is confirmed correct:
        else if (answer.isYes) {
            debugger;
            // user didn't explicitly confirm pkg:
            if (answer.isDefault) {
                log(`\n${pkg} will be downloaded.`);
            }
            // user explicitly confirmed pkg:
            else {
                log(`\nOkay, great. ${pkg} will be downloaded.`);
            }
        }
        /** @TODO async start pkg download */
    }
    catch (e) {
        console.error("Something went wrong! ...");
        console.error(e);
    }
};
