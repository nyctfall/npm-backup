import { createInterface } from "readline"
import { stdin, stdout } from "process"

// this is for the user interaction, getting input, responces, etc.
// in an Promise and async/await compatible way.

const rl = createInterface({
  input: stdin,
  output: stdout
})

// async/await compatible readline.question() function:
// this returns the user's responce string.
const promiseQuestion = (question: string): Promise<string> => {
  // return created promise for awaiting user responce asynchronously:
  return new Promise((resolve: Function) => {
    // use normal readline.question() method:
    rl.question(question, (responce: string) => {
      // resolve promise with user input to return from promise:
      resolve(responce)
    })
  })
}

rl.question = promiseQuestion

export default rl
