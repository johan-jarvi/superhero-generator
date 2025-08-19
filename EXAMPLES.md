# Superhero Weight Update System - Examples & Guide

This guide shows you how to use the superhero weight update system for managing your sprint superhero selection.

## 🎯 Recommended: Interactive Mode

The easiest way to update weights after each superhero selection:

```bash
# Interactive mode - walks through each person's predictions
node updateWeights.js --interactive
node updateWeights.js -i  # short form

# Preview mode - see what would happen without saving
node updateWeights.js --dry-run --interactive
```

### Interactive Mode Sample Session

```
🎯 Interactive Superhero Prediction Mode
========================================
🔍 DRY RUN MODE - No changes will be saved

📊 Current Probabilities:
  Sam: 26.67% (weight: 9.0000)
  Dom: 23.33% (weight: 8.0000)
  Kemila: 20.33% (weight: 7.0000)
  Ali: 14.37% (weight: 4.3122)
  Johan: 9.58% (weight: 2.8738)

📝 Collecting predictions...

Did Johan make a guess? (y/n): y
Available options: Johan, Ali, Sam, Kemila, Dom
Who did Johan guess would win? Sam
✅ Johan guessed Sam

Did Ali make a guess? (y/n): n
📝 Ali made no guess

...

🎰 Now for the big reveal...
Who actually won the superhero selection? Ali
🎉 Ali is the new superhero!

📋 Prediction Summary:
=====================
  Johan: Sam ❌
  Kemila: Ali ✅
  Sam: Dom ❌
  No guesses: Ali, Dom
```

## 📊 How the Gamification System Works

### Base Rules (Always Apply)
- **Become superhero**: weight -= 1
- **Don't become superhero (no guess)**: weight += 1

### Prediction Bonuses/Penalties (In Addition to Base Rules)
- **Correct guess**: bonus reduction (bigger for unlikely winners)
- **Wrong guess**: penalty increase (minimum +1.2, always worse than no guess)

### Strategic Insights
- **Not guessing is safe**: +1 if you don't win, -1 if you do
- **Wrong guesses are always worse** than not guessing (minimum +2.2 total penalty)
- **Guessing favorites incorrectly** = big penalties (base 1.2 + up to 3.0 more)
- **Guessing longshots incorrectly** = smaller penalties (closer to base 1.2)
- **Correct guesses on underdogs** give big rewards (inverse probability scaling)
- **Even winners get penalized** for wrong guesses
- **The system encourages thoughtful predictions**, not just safe bets

## 💻 Manual Command Examples

### Check Current Probabilities
```bash
node updateWeights.js --show
```

### Single Person Updates
```bash
# Johan guessed Sam would win, but Ali actually won
node updateWeights.js Johan Ali Sam

# Kemila made no guess, Dom won
node updateWeights.js Kemila Dom

# Dom guessed himself and won (correct guess + became superhero)
node updateWeights.js Dom Dom Dom
```

### Dry Run - Preview Changes Without Saving
```bash
# Preview what would happen if Johan guessed Sam but Ali won
node updateWeights.js --dry-run Johan Ali Sam

# Preview batch update without making changes
node updateWeights.js --dry-run --batch '[{"person":"Johan","guess":"Sam"}]' Ali
```

### Manual Batch Update for Whole Team
```bash
# Everyone's predictions before the wheel spin:
# Johan guessed: Sam
# Ali guessed: Dom  
# Kemila guessed: Ali
# Dom made no guess
# Sam guessed: Johan

# Scenario A: Sam actually won
node updateWeights.js --batch '[{"person":"Johan","guess":"Sam"},{"person":"Ali","guess":"Dom"},{"person":"Kemila","guess":"Ali"},{"person":"Sam","guess":"Johan"}]' Sam

# Note: Dom automatically gets base rules since he's not in predictions list
```

### Different Winner Scenario
```bash
# Same predictions, but Ali won instead:
node updateWeights.js --batch '[{"person":"Johan","guess":"Sam"},{"person":"Ali","guess":"Dom"},{"person":"Kemila","guess":"Ali"},{"person":"Sam","guess":"Johan"}]' Ali
```

## 📈 Weight Change Breakdown Examples

If current probabilities are Sam=30%, Ali=15%, Dom=25%, Johan=20%, Kemila=10%:

### Johan guessed Sam (30% chance), Ali won:
- **Base**: +1 (didn't become superhero)
- **Penalty**: +2.1 (wrong guess: 1.2 + 0.30 × 3.0 = 2.1)
- **Total**: +3.1 (big penalty for guessing favorite who lost!)

### Kemila guessed Ali (15% chance), Ali won:
- **Base**: +1 (didn't become superhero)
- **Bonus**: -2.0 (correct guess: 1/0.15 × 0.3 = 2.0)
- **Total**: -1.0 (nice reward for correct longshot!)

### Sam guessed Dom (25% chance), Ali won:
- **Base**: +1 (didn't become superhero)
- **Penalty**: +1.95 (wrong guess: 1.2 + 0.25 × 3.0 = 1.95)
- **Total**: +2.95 (moderate penalty)

### Ali guessed Dom (25% chance), Ali won:
- **Base**: -1 (became superhero)
- **Penalty**: +1.95 (wrong guess reduced superhero benefit)
- **Total**: +0.95 (wrong guess hurt even the winner!)

### Dom guessed Kemila (10% chance), Ali won:
- **Base**: +1 (didn't become superhero)
- **Penalty**: +1.5 (wrong guess: 1.2 + 0.10 × 3.0 = 1.5)
- **Total**: +2.5 (small penalty for reasonable longshot guess)

## 🎯 Recommended Workflow

1. **Everyone makes predictions** before spinning the wheel
2. **Spin the wheel** on wheelofnames.com
3. **Run interactive mode**: `node updateWeights.js --interactive`
   - It will ask about each person's guess and the winner
4. **Optional**: Use `--dry-run` first to preview changes
5. **Generate new wheelOfDeathList.txt**: `node superHero.js`
6. **Repeat for next sprint!**

## 🔍 Pro Tips

### Always Preview First
```bash
# Use dry run to preview changes before committing
node updateWeights.js --dry-run --interactive
```

### Check Results
```bash
# After updating, check the new probabilities
node updateWeights.js --show
```

### Generate New Wheel
```bash
# After weight updates, regenerate the wheel list
node superHero.js
```

## 🎮 Penalty Formula Reference

### Correct Guess Bonus
```
bonus = (1 / guessedProbability) × 0.3
```

### Wrong Guess Penalty  
```
penalty = 1.2 + (guessedProbability × 3.0)
```

### Examples:
- Guess 50% favorite who loses: penalty = 1.2 + (0.5 × 3.0) = 2.7
- Guess 25% chance who loses: penalty = 1.2 + (0.25 × 3.0) = 1.95  
- Guess 10% longshot who loses: penalty = 1.2 + (0.10 × 3.0) = 1.5

This creates meaningful scaling where wrong guesses on favorites hurt more than wrong guesses on longshots, encouraging thoughtful predictions rather than always betting on the favorite.