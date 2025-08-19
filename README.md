# 🦸 Superhero Selection System

A gamified weighted lottery system for selecting sprint superheroes during team retrospectives.

## 🚀 Quick Start

### 1. Setup Configuration

Create a `config.json` file with your team members and their initial weights:

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

**Important**: Keep this file locally! Each team should maintain their own `config.json` with their specific team members and weights.

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Your First Wheel

```bash
node superHero.js
```

This creates:
- `wheelOfNamesInput.txt` - Copy this into [wheelofnames.com](https://wheelofnames.com)
- `oddsDisplay.json` - Current probability data

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

1. **Collect predictions** (before spinning):
   ```bash
   # Interactive mode - walks through each person
   node updateWeights.js --interactive
   
   # Or preview changes first
   node updateWeights.js --dry-run --interactive
   ```

2. **Generate wheel list**:
   ```bash
   node superHero.js
   ```

3. **Copy `wheelOfNamesInput.txt`** content into [wheelofnames.com](https://wheelofnames.com)

4. **Generate presentable odds** for the team:
   ```bash
   ./generateOddsMarkdown.sh
   ```
   Share `ODDS.md` with the team to show current probabilities before predictions

5. **Spin the wheel** and celebrate! 🎉

### After the Ceremony

6. **Update weights** (if you used dry-run mode):
   ```bash
   node updateWeights.js --interactive
   ```

7. **Generate final files**:
   ```bash
   node superHero.js
   ./generateOddsMarkdown.sh
   ```

## 🛠️ Available Commands

### Weight Management

```bash
# Interactive mode (recommended)
node updateWeights.js --interactive
node updateWeights.js -i

# Preview changes without saving
node updateWeights.js --dry-run --interactive

# Manual single update
node updateWeights.js <person> <actual_winner> [guessed_winner]

# Manual batch update
node updateWeights.js --batch '[{"person":"Alice","guess":"Bob"}]' Charlie

# Show current probabilities
node updateWeights.js --show
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
├── config.json            # Team configuration (create this!)
├── superHero.js           # Main wheel generator
├── updateWeights.js       # Weight update system
├── generateOddsMarkdown.sh # Markdown generator
├── examples.sh            # Quick command reference
├── wheelOfNamesInput.txt  # Generated wheel list
├── oddsDisplay.json       # Current probabilities
└── ODDS.md               # Generated odds display
```

## 🎮 Pro Tips

### For the Retro Facilitator

1. **Always use dry-run first** to preview changes
2. **Keep config.json in version control** for your team
3. **Update .gitignore** to exclude sensitive files if needed
4. **Share ODDS.md** with the team for transparency

### For the Team

1. **Think strategically** about predictions - wrong guesses hurt!
2. **Longshot correct guesses** give big rewards
3. **Favorites are risky** - big penalty if they don't win
4. **Not guessing is safe** but offers no rewards

### Maintenance

```bash
# Reset everyone to equal weights
# Edit config.json to set all counts to 5.0

# Exclude someone temporarily (on leave)
# Add their name to excludedDevelopersList in superHero.js

# Adjust gamification parameters
# Edit GAMIFICATION_CONFIG in updateWeights.js
```

## 🔧 Configuration Options

### Gamification Tuning

Edit `GAMIFICATION_CONFIG` in `updateWeights.js`:

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
- Check spelling in `config.json`
- Ensure all team members are listed

**"Invalid JSON format"**
- Validate `config.json` syntax
- Use proper quotes and commas

**"Permission denied"**
- Make scripts executable: `chmod +x *.sh`

**Weights seem unbalanced**
- Check ODDS.md for current distribution
- Adjust weights manually in config.json if needed

### Getting Help

1. Read `EXAMPLES.md` for detailed usage examples
2. Run commands with `--help` or no arguments for usage info
3. Use `--dry-run` to preview changes safely

---

**Happy superhero selecting! 🦸‍♀️🦸‍♂️**