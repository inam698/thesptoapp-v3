const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(walk(full));
    } else if (full.endsWith('.tsx')) {
      results.push(full);
    }
  }
  return results;
}

const replacements = [
  ['color="#fff"', 'color={SpotColors.surface}'],
  ["color='#fff'", 'color={SpotColors.surface}'],
  ['color: "#fff"', 'color: SpotColors.surface'],
  ["color: '#fff'", 'color: SpotColors.surface'],
  ['backgroundColor: "#fff"', 'backgroundColor: SpotColors.surface'],
  ["backgroundColor: '#fff'", 'backgroundColor: SpotColors.surface'],
  ['shadowColor: "#000"', 'shadowColor: SpotColors.shadow'],
  ["shadowColor: '#000'", 'shadowColor: SpotColors.shadow'],
  ["borderBottomColor: '#222'", 'borderBottomColor: SpotColors.textPrimary'],
];

const files = walk('.');
let totalUpdated = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  for (const [oldStr, newStr] of replacements) {
    while (content.includes(oldStr)) {
      content = content.replace(oldStr, newStr);
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    totalUpdated++;
    console.log('Updated:', file);
  }
}

console.log('Total files updated:', totalUpdated);
