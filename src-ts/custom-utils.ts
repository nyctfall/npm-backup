import * as Readline from "readline"
import { stdin, stdout } from "process"
import { execFile as execFileCallback } from "child_process"
import { promisify } from "util"

/**
 * @debrief - This is a module for all custom or modified utilities used in the program.
 */

/**
 * @todo - I don't know how to get this class to not throw typing errors in TS...
 */
class AsyncInterface extends Readline.Interface {
  // constructor(input: NodeJS.ReadableStream, output?: NodeJS.WritableStream, completer?: Readline.Completer | Readline.AsyncCompleter, terminal?: boolean){
  constructor(options: Readline.ReadLineOptions){
    // super(input, output, completer, terminal)
    super(options)
  }

  // override non-async method:
  question(query: string): Promise<string> {
    
    // return created promise for awaiting user responce asynchonously:
    return new Promise((resolve: Function) => {
      
      // use normal readline.question() method:
      super.question(query, (responce: string) => {
        
        // resolve promise with user input to return from promise:
        resolve(responce)
      })
    })
  }
}

/**
 * @debrief - This is for the user interaction, getting input, responces, etc.
 * in an Promise and async/await compatible way.
 */

// function createAsyncInterface(options: Readline.ReadLineOptions): Readline.Interface;
// function createAsyncInterface(input: NodeJS.ReadableStream, output?: NodeJS.WritableStream, completer?: Readline.Completer | Readline.AsyncCompleter, terminal?: boolean): Readline.Interface;
// function createAsyncInterface(input: NodeJS.ReadableStream, output?: NodeJS.WritableStream, completer?: Readline.Completer | Readline.AsyncCompleter, terminal?: boolean) {
const createAsyncInterface = (options: Readline.ReadLineOptions): Readline.Interface => {
  const AsyncReadlineInterface = Readline.createInterface(options)

  // async/await compatible readline.question() function:
  // this returns the user's responce string.
  AsyncReadlineInterface.question = (query: string): Promise<string> => {
    
    // return created promise for awaiting user responce asynchonously:
    return new Promise((resolve: Function) => {
      
      // use normal readline.question() method:
      AsyncReadlineInterface.question(query, (responce: string) => {
        
        // resolve promise with user input to return from promise:
        resolve(responce)
      })
    })
  }

  return AsyncReadlineInterface
}


const rl = <AsyncInterface> createAsyncInterface({
  input: stdin,
  output: stdout
})

/**
 * @debrief - async generator for a for await...of loop to replace an Array forEach.
 */
const asyncForEach = async (array: Array<any>, asyncCallback: Function, thisArg?: object | undefined) => {
  
  // catch any promise errors:
  try {
    
    let index: number = 0
    
    for (const value of array) {
      await asyncCallback.call(thisArg, value, index++, array)
    }
  }
  catch (e) {
    console.error(e);
  }
}

export { rl as AsyncReadline, asyncForEach }

const asyncExecFile = promisify(execFileCallback)
export { asyncExecFile as execfile }

export const utilPromise = {
  execFile: asyncExecFile
}

// the value returned from util.execFile():
export type ExecFileResult = {
  stdout: string
  stderr: string
}
// the value returned from the promisified util.execFile():
export type ExecFileAsyncResult = Promise<ExecFileResult>