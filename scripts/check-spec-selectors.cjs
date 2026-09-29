// Fails if any spec file uses raw selectors; locators belong in page objects/components.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const BANNED = [
  /\.locator\(/,
  /\.getBy(Role|Text|Label|Placeholder|TestId|AltText|Title)\(/,
  /\.\$\$?\(/,
  /\bxpath=|\/\/[a-z]+\[/i,
];

function specFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : specFiles(full);
    return /\.spec\.ts$/.test(entry.name) ? [full] : [];
  });
}

const violations = specFiles(path.join(root, "products")).flatMap((file) =>
  fs.readFileSync(file, "utf8").split(/\r?\n/).flatMap((line, i) =>
    BANNED.some((re) => re.test(line))
      ? [`${path.relative(root, file)}:${i + 1}  ${line.trim()}`]
      : [],
  ),
);

if (violations.length) {
  console.error("Raw selectors found in spec files — move them into a page object or component:\n");
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log("No raw selectors in spec files.");
