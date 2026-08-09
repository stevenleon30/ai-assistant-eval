// Reads promptfoo's results.json and fails (exit 1) if the weighted
// pass rate falls below the given threshold. This is what makes the
// eval suite an actual CI GATE instead of just a report nobody reads.
//
// Usage: node scripts/check-threshold.js results.json 0.85

const fs = require("fs");

const [, , resultsPath, thresholdArg] = process.argv;
const threshold = parseFloat(thresholdArg || "0.85");

if (!resultsPath) {
  console.error("Usage: node check-threshold.js <results.json> <threshold>");
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
const stats = raw.results?.stats || raw.stats;

if (!stats) {
  console.error("Could not find stats in results.json - check promptfoo output format.");
  process.exit(1);
}

const { successes = 0, failures = 0 } = stats;
const total = successes + failures;
const passRate = total > 0 ? successes / total : 0;

console.log(`Eval results: ${successes}/${total} passed (${(passRate * 100).toFixed(1)}%)`);
console.log(`Required threshold: ${(threshold * 100).toFixed(1)}%`);

if (passRate < threshold) {
  console.error(`FAILED: pass rate ${(passRate * 100).toFixed(1)}% is below the ${(threshold * 100).toFixed(1)}% threshold.`);
  process.exit(1);
}

console.log("PASSED: eval suite meets quality threshold.");