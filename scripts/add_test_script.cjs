
const fs = require('fs');
const path = require('path');

// Read the package.json file
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add the test script if it doesn't exist
if (!packageJson.scripts) {
  packageJson.scripts = {};
}

packageJson.scripts.test = 'jest';

// Write the updated package.json back to disk
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Successfully added test script to package.json');
