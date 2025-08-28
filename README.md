# 🦸 Superhero Selection System

A gamified weighted lottery system for selecting sprint superheroes during team retrospectives.

## 🚀 Quick Start

### 1. Setup Configuration

Run the setup script to create your initial team configuration:

```bash
node setup.js
```

This will:
- Create the `io/` directory if it doesn't exist
- Walk you through adding your team members
- Generate `io/config.json` with initial weights (default: 5.0 for everyone)

Example of what gets created:

```json
[
  {
    "name": "Alice",
    "count": 5.0
  },
  {
    "name": "Bob",
    "count": 5.0
  },
  {
    "name": "Charlie",
    "count": 5.0
  },
  {
    "name": "Diana",
    "count": 5.0
  }
]
```

**Important**: Keep the `io/` folder locally! Each team should maintain their own configuration with their specific team members and weights.

### 2. (Optional) Install Dependencies

At this point the only dependency is a dev dep for prettier so this step is optional

```bash
npm install
```

### 3. Generate Your First Wheel

```bash
node superHero.js
```

This creates:
- `io/wheelOfNamesInput.txt` - Used to be copied into [wheelofnames.com](https://wheelofnames.com)
- `io/oddsDisplay.json` - Current probability data and used to generate `io/ODDS.md` for nicer display of probabilities

### 4. Run generateOddsMarkdown.sh

This creates:
- `io/ODDS.md` - Markdown file with probabilities for each team member

### 5. Perform the Superhero Selection in Interactive Mode

```bash
node spinTheWheel.js --interactive
```

## 🎯 How It Works

### Basic Concept
1. **Team members make predictions** about who will be selected as superhero
2. **Spin the wheel** on wheelofnames.com to select the actual superhero
3. **Update weights** based on predictions and selection results
4. **Generate new wheel** for next sprint with updated probabilities

### Weight Rules

**Base Rules (always apply):**
- Become superhero: `weight -= 1`
- Don't become superhero (no guess): `weight += 1`

**Prediction Bonuses/Penalties:**
- **Correct guess**: Bonus reduction (bigger for unlikely winners)
- **Wrong guess**: Penalty increase (minimum +1.2, always worse than not guessing)

## 📋 Sprint Ceremony Workflow

### During Retrospective

1. **Generate wheel list if you haven't already**:
   ```bash
   node superHero.js
   ```

2. **Generate presentable odds** for the team:
   ```bash
   ./generateOddsMarkdown.sh
   ```
   Share `io/ODDS.md` with the team to show current probabilities before predictions

3. **Copy `io/wheelOfNamesInput.txt`** content into [wheelofnames.com](https://wheelofnames.com)

4. **Collect predictions** (before spinning):
   ```bash
   # Interactive mode - walks through each person
   node spinTheWheel.js --interactive
   # Or preview changes first
   node spinTheWheel.js --dry-run --interactive
   ```

5. **Spin the wheel** before finalising the previous step and get the updated results! 🎉

## 🛠️ Available Commands

### Initial Setup

```bash
# Create initial team configuration
node setup.js
```

### Weight Management

```bash
# Interactive mode (recommended)
node spinTheWheel.js --interactive
node spinTheWheel.js -i

# Preview changes without saving
node spinTheWheel.js --dry-run --interactive

# Manual single update
node spinTheWheel.js <person> <actual_winner> [guessed_winner]

# Manual batch update
node spinTheWheel.js --batch '[{"person":"Alice","guess":"Bob"}]' Charlie

# Show current probabilities
node spinTheWheel.js --show
```

### File Generation

```bash
# Generate wheel files
node superHero.js

# Create markdown odds display
./generateOddsMarkdown.sh
```

### Documentation

```bash
# View detailed examples
cat EXAMPLES.md

# Quick reference
./examples.sh
```

## 📊 Understanding the Gamification

### Strategic Dynamics

- **Safe play**: Not guessing gives predictable +1/-1 changes
- **Wrong guesses hurt**: Always worse than not guessing (minimum +2.2 penalty)
- **Favorites vs Longshots**:
  - Wrong guess on 30% favorite = +2.1 penalty
  - Wrong guess on 10% longshot = +1.5 penalty
- **Correct longshot rewards**: Guessing a 10% winner correctly = ~3.0 bonus
- **Even winners pay**: Wrong guesses reduce superhero benefits

### Example Weight Changes

If Alice (30%), Bob (20%), Charlie (15%) are the current odds:

**Alice guessed Bob, Charlie won:**
- Base: +1 (didn't win)
- Penalty: +1.8 (wrong guess: 1.2 + 0.20×3.0)
- Total: +2.8

**Bob guessed Charlie, Charlie won:**
- Base: +1 (didn't win)
- Bonus: -2.0 (correct guess: 1/0.15×0.3)
- Total: -1.0 (reward!)

## 📁 File Structure

```
retro/
├── README.md              # This file
├── EXAMPLES.md            # Detailed usage examples
├── setup.js               # Initial configuration setup
├── superHero.js           # Main wheel generator
├── spinTheWheel.js        # Weight update system
├── generateOddsMarkdown.sh # Markdown generator
├── examples.sh            # Quick command reference
└── io/                    # Team-specific data (gitignored)
    ├── config.json        # Team configuration
    ├── wheelOfNamesInput.txt # Generated wheel list
    ├── oddsDisplay.json   # Current probabilities
    └── ODDS.md           # Generated odds display
```

## 🎮 Pro Tips

### For the Retro Facilitator

1. **Always use dry-run first** to preview changes
2. **Keep io/config.json in version control** for your team
3. **Update .gitignore** to exclude sensitive files if needed
4. **Share io/ODDS.md** with the team for transparency

### For the Team

1. **Think strategically** about predictions - wrong guesses hurt!
2. **Longshot correct guesses** give big rewards
3. **Favorites are risky** - big penalty if they don't win
4. **Not guessing is safe** but offers no rewards

### Maintenance

```bash
# Reset everyone to equal weights
# Edit io/config.json to set all counts to 5.0

# Exclude someone temporarily (on leave)
# Add their name to excludedDevelopersList in superHero.js

# Adjust gamification parameters
# Edit GAMIFICATION_CONFIG in spinTheWheel.js
```

## 🔧 Configuration Options

### Gamification Tuning

Edit `GAMIFICATION_CONFIG` in `spinTheWheel.js`:

```javascript
const GAMIFICATION_CONFIG = {
  baseSuperheroReduction: 1.0,     // Base reduction when becoming superhero
  baseNonSuperheroIncrease: 1.0,   // Base increase when not becoming superhero
  correctGuessBonusRate: 0.3,      // Bonus multiplier for correct guesses
  wrongGuessBasePenalty: 1.2,      // Base penalty for wrong guesses
  wrongGuessPenaltyScaling: 3.0,   // Additional penalty scaling
  minWeight: 0.5,                  // Minimum allowed weight
  maxWeight: 15.0                  // Maximum allowed weight
};
```

### Temporary Exclusions

Edit `excludedDevelopersList` in `superHero.js`:

```javascript
const excludedDevelopersList = ["PersonOnLeave", "AnotherPerson"];
```

## 🆘 Troubleshooting

### Common Issues

**"Person not found in config"**
- Check spelling in `io/config.json`
- Ensure all team members are listed

**"Invalid JSON format"**
- Validate `io/config.json` syntax
- Use proper quotes and commas

**"Permission denied"**
- Make scripts executable: `chmod +x *.sh`

**Weights seem unbalanced**
- Check `io/ODDS.md` for current distribution
- Adjust weights manually in `io/config.json` if needed

### Getting Help

1. Read `EXAMPLES.md` for detailed usage examples
2. Run commands with `--help` or no arguments for usage info
3. Use `--dry-run` to preview changes safely

---

**Happy superhero selecting! 🦸‍♀️🦸‍♂️**
