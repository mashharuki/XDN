const path = require("path");

const buildNextEslintCommand = (filenames) =>
  `yarn frontend lint --fix --file ${filenames
    .map((f) => path.relative(path.join("packages", "frontend"), f))
    .join(" --file ")}`;

const checkTypesNextCommand = () => "yarn next:check-types";

const buildHardhatEslintCommand = (filenames) =>
  `yarn contract lint-staged --fix ${filenames
    .map((f) => path.relative(path.join("packages", "contract"), f))
    .join(" ")}`;

module.exports = {
  "packages/frontend/**/*.{ts,tsx}": [
    buildNextEslintCommand,
    checkTypesNextCommand,
  ],
  "packages/contract/**/*.{ts,tsx}": [buildHardhatEslintCommand],
};
