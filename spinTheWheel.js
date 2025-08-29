const fs = require("node:fs");
const readline = require("node:readline");

// Ensure io directory exists
if (!fs.existsSync("io")) {
  fs.mkdirSync("io");
}

// Configuration for the gamification system
const GAMIFICATION_CONFIG = {
  baseSuperheroReduction: 1.0, // Base reduction when becoming superhero
  baseNonSuperheroIncrease: 1.0, // Base increase when not becoming superhero (and no guess)
  correctGuessBonusRate: 0.3, // Additional bonus multiplier for correct guesses (higher = more reward)
  wrongGuessBasePenalty: 1.2, // Base penalty for any wrong guess (must exceed base increase)
  wrongGuessPenaltyScaling: 3.0, // Additional penalty scaling for likely guesses
  minWeight: 0.5, // Minimum weight to prevent going to zero
  maxWeight: 15.0, // Maximum weight to prevent extreme values
};

/**
 * Calculate total weight adjustment including base superhero rules and prediction bonuses/penalties
 * @param {string} personName - The person whose weight we're adjusting
 * @param {string} actualWinner - Who actually won
 * @param {string|null} guessedPerson - Who they guessed would win (null if no guess)
 * @param {Array} currentConfig - Current config.json data
 * @returns {number} Total weight adjustment (negative = reduce weight, positive = increase weight)
 */
function calculateTotalWeightAdjustment(
  personName,
  actualWinner,
  guessedPerson,
  currentConfig,
) {
  const {
    baseSuperheroReduction,
    baseNonSuperheroIncrease,
    correctGuessBonusRate,
    wrongGuessBasePenalty,
    wrongGuessPenaltyScaling,
  } = GAMIFICATION_CONFIG;

  const isWinner = personName === actualWinner;

  // Base adjustment (always applies)
  let totalAdjustment = isWinner
    ? -baseSuperheroReduction
    : baseNonSuperheroIncrease;

  // If no guess was made, just return base adjustment
  if (!guessedPerson) {
    return totalAdjustment;
  }

  // Calculate prediction bonus/penalty
  const totalWeight = currentConfig.reduce((sum, dev) => sum + dev.count, 0);
  const guessedPersonData = currentConfig.find(
    (dev) => dev.name === guessedPerson,
  );

  if (!guessedPersonData) {
    throw new Error(`Guessed person "${guessedPerson}" not found in config`);
  }

  const guessedProbability = guessedPersonData.count / totalWeight;
  const isCorrectGuess = guessedPerson === actualWinner;

  if (isCorrectGuess) {
    // Correct guess bonus (bigger bonus for unlikely winners)
    const probabilityMultiplier = 1 / guessedProbability;
    const bonus = probabilityMultiplier * correctGuessBonusRate;

    if (isWinner) {
      // Won AND guessed correctly: extra reduction beyond base
      totalAdjustment -= bonus;
    } else {
      // Didn't win but guessed correctly: reduction instead of base increase
      totalAdjustment = -bonus;
    }
  } else {
    // Wrong guess penalty - base penalty + scaling based on how likely your guess was
    // Examples with basePenalty=1.2, scaling=3.0:
    // - Guess 50% favorite who loses: penalty = 1.2 + (0.5 * 3.0) = 2.7 (big penalty!)
    // - Guess 25% chance who loses: penalty = 1.2 + (0.25 * 3.0) = 1.95 (moderate penalty)
    // - Guess 10% longshot who loses: penalty = 1.2 + (0.1 * 3.0) = 1.5 (small penalty)
    const penalty =
      wrongGuessBasePenalty + guessedProbability * wrongGuessPenaltyScaling;

    if (isWinner) {
      // Won but guessed wrong: reduced benefit from becoming superhero
      totalAdjustment += penalty;
    } else {
      // Didn't win and guessed wrong: extra penalty beyond base increase
      totalAdjustment += penalty;
    }
  }

  return totalAdjustment;
}

/**
 * Apply weight bounds to prevent extreme values
 * @param {number} newWeight - Calculated new weight
 * @returns {number} Bounded weight value
 */
function applyWeightBounds(newWeight) {
  const { minWeight, maxWeight } = GAMIFICATION_CONFIG;
  return Math.max(minWeight, Math.min(maxWeight, newWeight));
}

/**
 * Update a person's weight in the config based on superhero selection and their prediction
 * @param {string} personName - Name of the person whose weight we're updating
 * @param {string} actualWinner - Who actually won
 * @param {string|null} guessedWinner - Who they guessed would win (null if no guess)
 * @param {boolean} dryRun - If true, only show changes without saving to file
 */
function updatePersonWeight(
  personName,
  actualWinner,
  guessedWinner = null,
  dryRun = false,
) {
  try {
    // Read current config
    const config = JSON.parse(fs.readFileSync("io/config.json", "utf-8"));

    // Use current config as initial config for single updates
    updatePersonWeightWithInitialConfig(
      personName,
      actualWinner,
      guessedWinner,
      config,
      dryRun,
    );
  } catch (error) {
    console.error(`Error updating weight for ${personName}:`, error.message);
  }
}

/**
 * Update a person's weight using a provided initial config for probability calculations
 */
function updatePersonWeightWithInitialConfig(
  personName,
  actualWinner,
  guessedWinner = null,
  initialConfig,
  dryRun = false,
) {
  try {
    // Read current config for actual weight updates
    const config = JSON.parse(fs.readFileSync("io/config.json", "utf-8"));

    // Find the person making the prediction
    const personIndex = config.findIndex((dev) => dev.name === personName);
    if (personIndex === -1) {
      throw new Error(`Person "${personName}" not found in config`);
    }

    // Calculate the total adjustment using INITIAL config for probabilities
    const adjustment = calculateTotalWeightAdjustment(
      personName,
      actualWinner,
      guessedWinner,
      initialConfig,
    );

    // Apply the adjustment to current weight
    const oldWeight = config[personIndex].count;
    const newWeight = applyWeightBounds(oldWeight + adjustment);
    config[personIndex].count = Math.round(newWeight * 10000) / 10000; // Round to 4 decimal places

    // Log the change
    const isWinner = personName === actualWinner;
    const guessResult = guessedWinner
      ? guessedWinner === actualWinner
        ? "CORRECT"
        : "INCORRECT"
      : "NO GUESS";

    console.log(`${personName}:`);
    console.log(`  Superhero: ${isWinner ? "YES" : "NO"}`);
    console.log(`  Predicted: ${guessedWinner || "No prediction"}`);
    console.log(`  Result: ${guessResult}`);
    console.log(
      `  Weight change: ${oldWeight.toFixed(4)} → ${config[personIndex].count.toFixed(4)} (${adjustment > 0 ? "+" : ""}${adjustment.toFixed(4)})`,
    );

    // Save updated config (unless dry run)
    if (!dryRun) {
      fs.writeFileSync("io/config.json", JSON.stringify(config, null, 2));
      console.log(`  ✅ Updated io/config.json\n`);
    } else {
      console.log(`  🔍 Dry run - no changes saved\n`);
    }
  } catch (error) {
    console.error(`Error updating weight for ${personName}:`, error.message);
  }
}

/**
 * Batch update all team members based on superhero selection and predictions
 * @param {Array} predictions - Array of {person, guess} objects (people who made guesses)
 * @param {string} actualWinner - Who actually won
 * @param {Array} allTeamMembers - All team members (from config.json)
 * @param {boolean} dryRun - If true, only show changes without saving to file
 */
function updateAllWeights(
  predictions,
  actualWinner,
  allTeamMembers = null,
  dryRun = false,
) {
  console.log(`🦸 Processing weight updates for superhero: ${actualWinner}\n`);

  // Read initial config state to use for all probability calculations
  const initialConfig = JSON.parse(fs.readFileSync("io/config.json", "utf-8"));

  // Get all team members if not provided
  if (!allTeamMembers) {
    allTeamMembers = initialConfig.map((dev) => dev.name);
  }

  // Create a map of predictions for easy lookup
  const predictionMap = new Map();
  predictions.forEach(({ person, guess }) => {
    predictionMap.set(person, guess);
  });

  // Update all team members using initial config for probability calculations
  allTeamMembers.forEach((person) => {
    const guess = predictionMap.get(person) || null;
    updatePersonWeightWithInitialConfig(
      person,
      actualWinner,
      guess,
      initialConfig,
      dryRun,
    );
  });

  // Show updated probabilities after weight changes
  console.log("📊 Updated probabilities after weight changes:");
  showCurrentProbabilities();
}

/**
 * Display current probabilities for reference
 */
function showCurrentProbabilities() {
  try {
    const config = JSON.parse(fs.readFileSync("io/config.json", "utf-8"));

    // Filter out excluded and zero-count members (same as superHero.js)
    const excludedDevelopersList = [];
    const lowercasedExclusions = excludedDevelopersList.map((e) =>
      e.toLowerCase(),
    );
    const onlyPositives = config.filter(
      (dev) =>
        dev.count > 0 && !lowercasedExclusions.includes(dev.name.toLowerCase()),
    );

    // Use rounded counts for actual wheel odds
    const totalRoundedEntries = onlyPositives
      .map((dev) => Math.round(dev.count))
      .reduce((a, b) => a + b);

    console.log("📊 Current Probabilities:");
    onlyPositives
      .sort((a, b) => Math.round(b.count) - Math.round(a.count))
      .forEach((dev) => {
        const roundedCount = Math.round(dev.count);
        const percentage = ((roundedCount / totalRoundedEntries) * 100).toFixed(
          2,
        );
        console.log(
          `  ${dev.name}: ${percentage}% (weight: ${dev.count.toFixed(4)})`,
        );
      });
    console.log();
  } catch (error) {
    console.error("Error showing probabilities:", error.message);
  }
}

/**
 * Interactive mode to collect predictions and winner
 * @param {boolean} dryRun - If true, only show changes without saving to file
 */
async function runInteractiveMode(dryRun = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  try {
    // Read current config to get team members
    const config = JSON.parse(fs.readFileSync("io/config.json", "utf-8"));
    const teamMembers = config.map((dev) => dev.name);

    console.log("🎯 Interactive Superhero Prediction Mode");
    console.log("========================================");

    if (dryRun) {
      console.log("🔍 DRY RUN MODE - No changes will be saved\n");
    }

    // Show current probabilities
    showCurrentProbabilities();

    // Collect predictions
    const predictions = [];
    console.log("📝 Collecting predictions...\n");

    for (const person of teamMembers) {
      const didGuess = await question(`Did ${person} make a guess? (y/n): `);

      if (didGuess.toLowerCase() === "y" || didGuess.toLowerCase() === "yes") {
        console.log(`Available options: ${teamMembers.join(", ")}`);
        const guess = await question(`Who did ${person} guess would win? `);

        // Validate the guess
        if (teamMembers.includes(guess)) {
          predictions.push({ person, guess });
          console.log(`✅ ${person} guessed ${guess}\n`);
        } else {
          console.log(`❌ Invalid guess "${guess}". Skipping ${person}.\n`);
        }
      } else {
        console.log(`📝 ${person} made no guess\n`);
      }
    }

    // Prompt to spin the wheel
    console.log("🎰 Time to spin the wheel!");
    console.log("Please go to the wheel and spin it now...");
    await question("Press Enter when you're ready to enter the winner.");

    // Get the actual winner
    console.log("\n🎉 Now for the big reveal...");
    console.log(`Available options: ${teamMembers.join(", ")}`);
    const actualWinner = await question(
      "Who actually won the superhero selection? ",
    );

    // Validate winner
    if (!teamMembers.includes(actualWinner)) {
      console.log(`❌ Invalid winner "${actualWinner}". Exiting.`);
      rl.close();
      return;
    }

    console.log(`\n🎉 ${actualWinner} is the new superhero!\n`);

    // Show prediction summary
    console.log("📋 Prediction Summary:");
    console.log("=====================");
    predictions.forEach(({ person, guess }) => {
      const isCorrect = guess === actualWinner;
      console.log(`  ${person}: ${guess} ${isCorrect ? "✅" : "❌"}`);
    });

    const noGuessers = teamMembers.filter(
      (person) => !predictions.some((p) => p.person === person),
    );
    if (noGuessers.length > 0) {
      console.log("  No guesses: " + noGuessers.join(", "));
    }
    console.log();

    // Apply updates
    updateAllWeights(predictions, actualWinner, teamMembers, dryRun);

    if (dryRun) {
      console.log(
        "🔍 This was a dry run. Run without --dry-run to apply changes.",
      );
    } else {
      console.log(
        "✅ All weights updated and saved! Run 'node superHero.js' to generate updated wheel.",
      );
    }
  } catch (error) {
    console.error("Error in interactive mode:", error.message);
  } finally {
    rl.close();
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("🦸 Superhero Weight Update System");
    console.log("\nUsage:");
    console.log("  Interactive mode (recommended for sprint ceremonies):");
    console.log("    node spinTheWheel.js --interactive");
    console.log("    node spinTheWheel.js -i");
    console.log("    (Walks through each person's prediction interactively)");
    console.log("\n  Single person weight update:");
    console.log(
      "    node spinTheWheel.js <person> <superhero_winner> [prediction]",
    );
    console.log(
      "    Example: node spinTheWheel.js Johan Ali Sam  (Johan predicted Sam, Ali won)",
    );
    console.log(
      "    Example: node spinTheWheel.js Johan Ali      (Johan made no prediction, Ali won)",
    );
    console.log("\n  Batch update (processes whole team):");
    console.log(
      '    node spinTheWheel.js --batch \'[{"person":"Johan","guess":"Sam"},{"person":"Ali","guess":"Dom"}]\' <superhero_winner>',
    );
    console.log(
      "    Note: People not in predictions list are treated as 'no prediction'",
    );
    console.log("\n  Show current odds:");
    console.log("    node spinTheWheel.js --show");
    console.log("\n  Dry run (preview weight changes without saving):");
    console.log("    Add --dry-run to any command to preview changes");
    console.log("    Example: node spinTheWheel.js --dry-run --interactive");
    console.log("    Example: node spinTheWheel.js --dry-run Johan Ali Sam");
    console.log("\n  Note: Config and output files are stored in io/ folder");
    process.exit(0);
  }

  // Check for dry run flag
  const dryRun = args.includes("--dry-run");
  const filteredArgs = args.filter((arg) => arg !== "--dry-run");

  if (dryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be saved to config.json\n");
  }

  if (filteredArgs[0] === "--interactive" || filteredArgs[0] === "-i") {
    runInteractiveMode(dryRun);
  } else if (filteredArgs[0] === "--show") {
    showCurrentProbabilities();
  } else if (filteredArgs[0] === "--batch" && filteredArgs.length === 3) {
    try {
      const predictions = JSON.parse(filteredArgs[1]);
      const actualWinner = filteredArgs[2];
      updateAllWeights(predictions, actualWinner, null, dryRun);
    } catch (error) {
      console.error("Error parsing batch predictions:", error.message);
      console.log(
        'Expected format: \'[{"person":"Name","guess":"GuessedWinner"}]\'',
      );
    }
  } else if (filteredArgs.length >= 2) {
    const person = filteredArgs[0];
    const actualWinner = filteredArgs[1];
    const guessedWinner = filteredArgs[2] || null;
    console.log(`🎯 Processing single person update...\n`);
    updatePersonWeight(person, actualWinner, guessedWinner, dryRun);

    // Show updated probabilities after single update
    if (!dryRun) {
      console.log("📊 Updated Probabilities:");
      const updatedConfig = JSON.parse(
        fs.readFileSync("io/config.json", "utf-8"),
      );

      // Filter and use rounded counts for actual wheel odds
      const excludedDevelopersList = [];
      const lowercasedExclusions = excludedDevelopersList.map((e) =>
        e.toLowerCase(),
      );
      const onlyPositives = updatedConfig.filter(
        (dev) =>
          dev.count > 0 &&
          !lowercasedExclusions.includes(dev.name.toLowerCase()),
      );

      const updatedTotalRoundedEntries = onlyPositives
        .map((dev) => Math.round(dev.count))
        .reduce((a, b) => a + b);

      onlyPositives
        .sort((a, b) => Math.round(b.count) - Math.round(a.count))
        .forEach((dev) => {
          const roundedCount = Math.round(dev.count);
          const percentage = (
            (roundedCount / updatedTotalRoundedEntries) *
            100
          ).toFixed(2);
          console.log(
            `  ${dev.name}: ${percentage}% (weight: ${dev.count.toFixed(4)})`,
          );
        });
      console.log();
    } else {
      showCurrentProbabilities();
    }
  } else {
    console.error("Invalid arguments. Use no arguments to see usage help.");
    process.exit(1);
  }
}

module.exports = {
  updatePersonWeight,
  updateAllWeights,
  calculateTotalWeightAdjustment,
  showCurrentProbabilities,
  runInteractiveMode,
  GAMIFICATION_CONFIG,
};
