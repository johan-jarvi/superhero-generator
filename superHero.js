const fs = require("node:fs");

// If someone goes on leave we add them here so that we can increment in config but exclude.
const excludedDevelopersList = [];

// Ensure io directory exists
if (!fs.existsSync("io")) {
  fs.mkdirSync("io");
}

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

const config = JSON.parse(fs.readFileSync("io/config.json", "utf-8"));

const lowercasedExclusions = excludedDevelopersList.map((e) => e.toLowerCase());

const onlyPositives = config.filter(
  (dev) =>
    dev.count > 0 && !lowercasedExclusions.includes(dev.name.toLowerCase()),
);

const totalEntries = onlyPositives
  .map((dev) => Math.round(dev.count))
  .reduce((a, b) => a + b);

// Calculate odds display object using rounded counts (actual wheel odds)
const oddsDisplay = {};
onlyPositives.forEach((dev) => {
  const roundedCount = Math.round(dev.count);
  const percentageOdds = ((roundedCount / totalEntries) * 100).toFixed(2);
  oddsDisplay[dev.name] = `${percentageOdds}%`;
});

const repeated = onlyPositives.flatMap((dev) => {
  const roundedCount = Math.round(dev.count);
  const percentageOdds = ((roundedCount / totalEntries) * 100).toFixed(2);

  return Array(roundedCount).fill(`${dev.name} (${percentageOdds}%)`);
});

shuffle(repeated);

try {
  fs.writeFileSync("io/wheelOfNamesInput.txt", repeated.join("\n"));
  fs.writeFileSync("io/oddsDisplay.json", JSON.stringify(oddsDisplay, null, 2));
  console.log(
    "✅ Generated io/wheelOfNamesInput.txt and updated io/oddsDisplay.json",
  );
} catch (err) {
  console.error(err);
}
