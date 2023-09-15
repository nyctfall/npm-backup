import * as esbuild from "esbuild"

/**
 * @file ESBuild API build script to bundle and minify the source TS into one single JS file.
 * Because TS doesn't necessarily handle paths in a manner that is conducive to conveniently having multiple transpilation output locations, and doesn't update the paths to be relative to the new output file locations.
 * This should significantly improve the debugging and testing of the transpiled JS.
 */

const result = await esbuild.build({
  entryPoints: ["src/backup.ts"],
  outfile: "./bin/backup.js",
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ["node16"],
  platform: "node",
  packages: "external",
  metafile: true,
  // color: true,
  // logLevel: "debug",
  logLimit: 100,
  logOverride: {
    "unsupported-regexp": "warning"
    /*
    Some of the other message types are listed below:
  
    JS:
      assign-to-constant
      assign-to-import
      call-import-namespace
      commonjs-variable-in-esm
      delete-super-property
      duplicate-case
      duplicate-object-key
      empty-import-meta
      equals-nan
      equals-negative-zero
      equals-new-object
      html-comment-in-js
      impossible-typeof
      indirect-require
      private-name-will-throw
      semicolon-after-return
      suspicious-boolean-not
      this-is-undefined-in-esm
      unsupported-dynamic-import
      unsupported-jsx-comment
      unsupported-regexp
      unsupported-require-call
  
    Bundler:
      ambiguous-reexport
      different-path-case
      empty-glob
      ignored-bare-import
      ignored-dynamic-import
      import-is-undefined
      require-resolve-not-external
  
    Source maps:
      invalid-source-mappings
      sections-in-source-map
      missing-source-map
      unsupported-source-map-comment
  
    Resolver:
      package.json
      tsconfig.json
    */
  }
})

console.log("\n\nESBuild `esbuild.mjs` build result: ", result, "\n\nEND: ESBuild `esbuild.mjs` build result.")

console.log(
  "\n\nESBuild analyze metafile: ",
  await esbuild.analyzeMetafile(result.metafile, {
    verbose: true
  }),
  "\n\nEND: ESBuild analyze metafile."
)
