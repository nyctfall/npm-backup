export default {
  "*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}": ["prettier --ignore-unknown --list-different", "eslint"],
  "*.{md,html,css}": ["prettier --ignore-unknown --list-different"]
}
