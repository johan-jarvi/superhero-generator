# Superhero Weight Update System - Examples & Guide

This guide shows you how to use the superhero weight update system for managing your sprint superhero selection, following the recommended ceremony workflow from the README.

## 📋 Complete Sprint Ceremony Workflow

Follow these steps during your retrospective to run the superhero selection:

### Step 1: Generate Current Wheel (if needed)
```bash
node superHero.js
```

### Step 2: Generate and Share Current Odds
```bash
./generateOddsMarkdown.sh
```
Share `ODDS.md` with the team to show current probabilities before predictions.

### Step 3: Set Up the Wheel
Copy the content from `wheelOfNamesInput.txt` into [wheelofnames.com](https://wheelofnames.com)

### Step 4: Collect Predictions and Update Weights
```bash
# Interactive mode - walks through each person's predictions
node updateWeights.js --interactive
node updateWeights.js -i  # short form

# Preview mode - see what would happen without saving
node updateWeights.js --dry-run --interactive
```

### Step 5: Spin the Wheel
The interactive mode will prompt you to spin the wheel at the right time!

### Interactive Mode Sample Session

```
🎯 Interactive Superhero Weight Update
======================================
🔍 DRY RUN MODE - No changes will be saved

📊 Current odds before predictions:
  Current odds:
  Sam: 26.67% (weight: 9.0000)
  Dom: 23.33% (weight: 8.0000)
  Kemila: 20.33% (weight: 7.0000)
  Ali: 14.37% (weight: 4.3122)
  Johan: 9.58% (weight: 2.8738)

📝 Collecting predictions (before spinning wheel)...

Did Johan make a guess? (y/n): y
Available options: Johan, Ali, Sam, Kemila, Dom
Who did Johan guess would win? Sam
✅ Johan guessed Sam

Did Ali make a guess? (y/n): n
📝 Ali made no prediction

...

🎰 Time to spin the wheel!
Please go to wheelofnames.com and spin the wheel now...
Press Enter when the wheel has been spun and you're ready to enter the winner: 

🎉 Now for the big reveal - who won the superhero selection?
Team members: Johan, Ali, Sam, Kemila, Dom
Enter the superhero winner: Ali

🦸 Ali is the new sprint superhero!

📋 Prediction Results Summary:
==============================
  Johan: Sam ❌
  Kemila: Ali ✅
  Sam: Dom ❌
  No predictions: Ali, Dom

⚖️  Applying weight updates...

📊 Updated probabilities after weight changes:
  [updated odds displayed]
```

## 📊 How the Gamification System Works

### Base Rules (Always Apply)
- **Become superhero**: weight -= 1
- **Don't become superhero (no prediction)**: weight += 1

### Prediction Bonuses/Penalties (In Addition to Base Rules)
- **Correct prediction**: bonus reduction (bigger for unlikely winners)
- **Wrong prediction**: penalty increase (minimum +1.2, always worse than not predicting)

### Strategic Insights
- **Not predicting is safe**: +1 if you don't win, -1 if you do
- **Wrong predictions are always worse** than not predicting (minimum +2.2 total penalty)
- **Predicting favorites incorrectly** = big penalties (base 1.2 + up to 3.0 more)
- **Predicting longshots incorrectly** = smaller penalties (closer to base 1.2)
- **Correct predictions on underdogs** give big rewards (inverse probability scaling)
- **Even winners get penalized** for wrong predictions
- **The system encourages thoughtful predictions**, not just safe bets

## 💻 Manual Command Examples

### Check Current Odds
```bash
node updateWeights.js --show
```

### Single Person Updates
```bash
# Johan predicted Sam would win, but Ali actually won
node updateWeights.js Johan Ali Sam

# Kemila made no prediction, Dom won
node updateWeights.js Kemila Dom

# Dom predicted himself and won (correct prediction + became superhero)
node updateWeights.js Dom Dom Dom
```

### Dry Run - Preview Changes Without Saving
```bash
# Preview what would happen if Johan predicted Sam but Ali won
node updateWeights.js --dry-run Johan Ali Sam

# Preview batch update without making changes
node updateWeights.js --dry-run --batch '[{"person":"Johan","guess":"Sam"}]' Ali
```

### Manual Batch Update for Whole Team
```bash
# Everyone's predictions before the wheel spin:
# Johan predicted: Sam
# Ali predicted: Dom  
# Kemila predicted: Ali
# Dom made no prediction
# Sam predicted: Johan

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

If current odds are Sam=30%, Ali=15%, Dom=25%, Johan=20%, Kemila=10%:

### Johan predicted Sam (30% chance), Ali won:
- **Base**: +1 (didn't become superhero)
- **Penalty**: +2.1 (wrong prediction: 1.2 + 0.30 × 3.0 = 2.1)
- **Total**: +3.1 (big penalty for predicting favorite who lost!)

### Kemila predicted Ali (15% chance), Ali won:
- **Base**: +1 (didn't become superhero)
- **Bonus**: -2.0 (correct prediction: 1/0.15 × 0.3 = 2.0)
- **Total**: -1.0 (nice reward for correct longshot!)

### Sam predicted Dom (25% chance), Ali won:
- **Base**: +1 (didn't become superhero)
- **Penalty**: +1.95 (wrong prediction: 1.2 + 0.25 × 3.0 = 1.95)
- **Total**: +2.95 (moderate penalty)

### Ali predicted Dom (25% chance), Ali won:
- **Base**: -1 (became superhero)
- **Penalty**: +1.95 (wrong prediction reduced superhero benefit)
- **Total**: +0.95 (wrong prediction hurt even the winner!)

### Dom predicted Kemila (10% chance), Ali won:
- **Base**: +1 (didn't become superhero)
- **Penalty**: +1.5 (wrong prediction: 1.2 + 0.10 × 3.0 = 1.5)
- **Total**: +2.5 (small penalty for reasonable longshot prediction)

## 🎯 Complete Ceremony Workflow (from README)

### During Retrospective

1. **Generate wheel list if you haven't already**:
   ```bash
   node superHero.js
   ```

2. **Generate presentable odds** for the team:
   ```bash
   ./generateOddsMarkdown.sh
   ```
   Share `ODDS.md` with the team to show current probabilities before predictions

3. **Copy `wheelOfNamesInput.txt`** content into [wheelofnames.com](https://wheelofnames.com)

4. **Collect predictions** (before spinning):
   ```bash
   # Interactive mode - walks through each person
   node updateWeights.js --interactive
   # Or preview changes first
   node updateWeights.js --dry-run --interactive
   ```

5. **Spin the wheel** - the interactive mode will prompt you at the right time! 🎉

### After the Ceremony
- Weights are automatically updated during step 4
- New wheel is ready for next sprint
- Share updated `ODDS.md` if desired

## 🔍 Pro Tips

### Always Preview First
```bash
# Use dry run to preview changes before committing
node updateWeights.js --dry-run --interactive
```

### Check Results
```bash
# After updating, check the new odds
node updateWeights.js --show
```

### Generate New Wheel
```bash
# After weight updates, regenerate the wheel list
node superHero.js
```

## 🎮 Penalty Formula Reference

### Correct Prediction Bonus
```
bonus = (1 / predictedProbability) × 0.3
```

### Wrong Prediction Penalty  
```
penalty = 1.2 + (predictedProbability × 3.0)
```

### Examples:
- Predict 50% favorite who loses: penalty = 1.2 + (0.5 × 3.0) = 2.7
- Predict 25% chance who loses: penalty = 1.2 + (0.25 × 3.0) = 1.95  
- Predict 10% longshot who loses: penalty = 1.2 + (0.10 × 3.0) = 1.5

This creates meaningful scaling where wrong predictions on favorites hurt more than wrong predictions on longshots, encouraging thoughtful predictions rather than always betting on the favorite.