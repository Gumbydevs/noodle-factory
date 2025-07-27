const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Setting up build environment...');

// Ensure build directory exists
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  console.log('Creating build directory...');
  fs.mkdirSync(buildDir);
}

// Copy the icon to the build directory
console.log('Copying icon to build directory...');
fs.copyFileSync(
  path.join(__dirname, 'public', 'icons', 'NoodleFactoryLogo.ico'),
  path.join(__dirname, 'build', 'icon.ico')
);

console.log('Icon file copied successfully');
console.log('Checking icon file size...');
const stats = fs.statSync(path.join(__dirname, 'build', 'icon.ico'));
console.log(`Icon file size: ${stats.size} bytes`);

console.log('Setup complete!');
