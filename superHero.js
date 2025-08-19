const fs = require("node:fs");

// If someone goes on leave we add them here so that we can increment in config but exclude.
const excludedDevelopersList = [];

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

const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));

const lowercasedExclusions = excludedDevelopersList.map((e) => e.toLowerCase());

const onlyPositives = config.filter(
  (dev) =>
    dev.count > 0 && !lowercasedExclusions.includes(dev.name.toLowerCase()),
);

const totalEntries = onlyPositives
  .map((dev) => Math.round(dev.count))
  .reduce((a, b) => a + b);

// Calculate odds display object
const oddsDisplay = {};
onlyPositives.forEach((dev) => {
  const percentageOdds = ((dev.count / totalEntries) * 100).toFixed(2);
  oddsDisplay[dev.name] = `${percentageOdds}%`;
});

const repeated = onlyPositives.flatMap((dev) => {
  const percentageOdds = ((dev.count / totalEntries) * 100).toFixed(2);

  return Array(Math.round(dev.count)).fill(`${dev.name} (${percentageOdds}%)`);
});

shuffle(repeated);

try {
  fs.writeFileSync("wheelOfDeathList.txt", repeated.join("\n"));
  fs.writeFileSync("oddsDisplay.json", JSON.stringify(oddsDisplay, null, 2));
  console.log("✅ Generated wheelOfDeathList.txt and updated oddsDisplay.json");
} catch (err) {
  console.error(err);
}
