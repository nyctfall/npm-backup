const { src, dest, lastRun, watch, series } = require("gulp")
const { createProject } = require("gulp-typescript")
const { default: jest } = require("gulp-jest")
const prettier = require("gulp-prettier")
const { resolveConfig } = require("prettier")
const eslint = require("gulp-eslint")
const babel = require("gulp-babel")
const jsdoc = require("gulp-jsdoc3")

const srcFiles = ["src*/**/*.js", "src*/**/*.ts", "scr*/**/*.json"]
const configFiles = ["*.js", "*.ts"]
const distFiles = ["dist*/**/*.js", "dist*/**/*.ts"]
const exclude = ["!bin/**", "!node_modules/**"]
const base = "./"

const delayOpt = { delay: 1000 }

function eslinting() {
  return (
    src(srcFiles)
      // eslint() attaches the lint output to the "eslint" property
      // of the file object so it can be used by other modules.
      .pipe(eslint())
      // eslint.format() outputs the lint results to the console.
      // Alternatively use eslint.formatEach() (see Docs).
      .pipe(eslint.format())
      // To have the process exit with an error code (1) on
      // lint error, return the stream and pipe to failAfterError last.
      .pipe(eslint.failAfterError())
  )
}

async function prettierReformating() {
  return src([...srcFiles, ...configFiles, ...exclude], {
    /* since: lastRun(prettierReformating), */
    base
  })
    .pipe(prettier(await resolveConfig(base)))
    .pipe(dest(base))
}

function typeScriptCompile() {
  const tsProject = createProject("tsconfig.json")
  return src("src*/**/*.ts", {
    /* since: lastRun(typeScriptCompile), */
    base
  })
    .pipe(tsProject())
    .js.pipe(dest(base))
}

function babelTranspile() {
  return src("dist-js/**/*.js", {
    since: lastRun(babelTranspile),
    base
  })
    .pipe(
      babel({
        presets: ["@babel/preset-env", "@babel/typescript"]
      })
    )
    .pipe(dest(base))
}

function jestTestSuite() {
  return src("tests", { since: lastRun(babelTranspile) }).pipe(
    jest({
      preprocessorIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/"],
      automock: false
    })
  )
}

function jsdocGenerate(cb) {
  return src(["README.md", ...srcFiles], { read: false }).pipe(jsdoc({}, cb))
}

const basicSeries = series(eslinting, prettierReformating, typeScriptCompile, babelTranspile)
