const fs = require("node:fs");
const readline = require("node:readline");

// Ensure io directory exists
if (!fs.existsSync("io")) {
  fs.mkdirSync("io");
}

const CONFIG_PATH = "io/config.json";

/**
 * Create initial config.json with team members
 */
async function createInitialConfig() {
  // Check if config already exists
  if (fs.existsSync(CONFIG_PATH)) {
    console.log("✅ Config file already exists at io/config.json");
    console.log("Run 'node superHero.js' to generate your first wheel!");
    return;
  }

  console.log("🚀 Superhero Selection System Setup");
  console.log("==================================");
  console.log("Let's create your initial team configuration.\n");

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
    // Get team members
    const teamMembers = [];
    console.log("Enter your team members (press Enter with empty name when done):");

    let memberIndex = 1;
    while (true) {
      const name = await question(`Team member ${memberIndex}: `);

      if (!name.trim()) {
        break;
      }

      // Check for duplicates
      if (teamMembers.some(member => member.toLowerCase() === name.trim().toLowerCase())) {
        console.log("⚠️  That name is already added. Please enter a different name.");
        continue;
      }

      teamMembers.push(name.trim());
      memberIndex++;
    }

    if (teamMembers.length === 0) {
      console.log("❌ No team members entered. Setup cancelled.");
      rl.close();
      return;
    }

    // Get initial weight
    console.log(`\nFound ${teamMembers.length} team members: ${teamMembers.join(", ")}`);

    let initialWeight;
    while (true) {
      const weightInput = await question("\nEnter initial weight for all members (default: 5.0): ");

      if (!weightInput.trim()) {
        initialWeight = 5.0;
        break;
      }

      const parsedWeight = parseFloat(weightInput);
      if (isNaN(parsedWeight) || parsedWeight <= 0) {
        console.log("❌ Please enter a positive number.");
        continue;
      }

      initialWeight = parsedWeight;
      break;
    }

    // Create config object
    const config = teamMembers.map(name => ({
      name: name,
      count: initialWeight
    }));

    // Write config file
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

    console.log("\n✅ Successfully created io/config.json!");
    console.log("\nInitial configuration:");
    config.forEach(member => {
      console.log(`  ${member.name}: ${member.count}`);
    });

    console.log("\n🎯 Next steps:");
    console.log("1. Run 'node superHero.js' to generate your first wheel");
    console.log("2. Copy io/wheelOfNamesInput.txt content to wheelofnames.com");
    console.log("3. Use 'node updateWeights.js --interactive' after each selection");
    console.log("\n🎉 Happy superhero selecting!");

  } catch (error) {
    console.error("❌ Error during setup:", error.message);
  } finally {
    rl.close();
  }
}

// Run setup if called directly
if (require.main === module) {
  createInitialConfig();
}

module.exports = {
  createInitialConfig
};
