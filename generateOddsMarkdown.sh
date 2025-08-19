#!/bin/bash

# Generate odds markdown from oddsDisplay.json
# Usage: ./generateOddsMarkdown.sh

OUTPUT_FILE="ODDS.md"
JSON_FILE="oddsDisplay.json"

# Check if oddsDisplay.json exists
if [ ! -f "$JSON_FILE" ]; then
    echo "❌ Error: $JSON_FILE not found!"
    echo "Run 'node superHero.js' first to generate the odds file."
    exit 1
fi

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Start writing the markdown file
cat > "$OUTPUT_FILE" << EOF
# 🦸 Current Superhero Odds

*Last updated: $TIMESTAMP*

## Probability Distribution

EOF

# Parse JSON and create markdown table
echo "| Team Member | Probability | Visual |" >> "$OUTPUT_FILE"
echo "|-------------|-------------|--------|" >> "$OUTPUT_FILE"

# Extract data from JSON, sort by percentage (descending)
node -e "
const fs = require('fs');
const odds = JSON.parse(fs.readFileSync('$JSON_FILE', 'utf-8'));
const sorted = Object.entries(odds).sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));

sorted.forEach(([name, percentage]) => {
  const percent = parseFloat(percentage);
  const barLength = Math.round(percent / 2); // Scale for visual bar
  const bar = '█'.repeat(barLength) + '░'.repeat(25 - barLength);
  console.log(\`| \${name} | \${percentage} | \${bar} |\`);
});
" >> "$OUTPUT_FILE"

# Add summary section
cat >> "$OUTPUT_FILE" << EOF

## Summary

EOF

# Add total count and team members
TOTAL_MEMBERS=$(node -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync('$JSON_FILE', 'utf-8'))).length)")
echo "- **Total active members**: $TOTAL_MEMBERS" >> "$OUTPUT_FILE"

# Find highest and lowest probability
node -e "
const fs = require('fs');
const odds = JSON.parse(fs.readFileSync('$JSON_FILE', 'utf-8'));
const entries = Object.entries(odds);
const highest = entries.reduce((max, curr) => parseFloat(curr[1]) > parseFloat(max[1]) ? curr : max);
const lowest = entries.reduce((min, curr) => parseFloat(curr[1]) < parseFloat(min[1]) ? curr : min);

console.log(\`- **Highest probability**: \${highest[0]} (\${highest[1]})\`);
console.log(\`- **Lowest probability**: \${lowest[0]} (\${lowest[1]})\`);
" >> "$OUTPUT_FILE"

# Add generation info
cat >> "$OUTPUT_FILE" << EOF

## How to Update

1. Make prediction updates: \`node updateWeights.js --interactive\`
2. Generate new wheel: \`node superHero.js\`
3. Update this file: \`./generateOddsMarkdown.sh\`

---
*Generated from \`$JSON_FILE\`*
EOF

echo "✅ Generated $OUTPUT_FILE successfully!"
echo "📊 Current odds have been formatted as markdown"

# Make the file readable
chmod +r "$OUTPUT_FILE"
