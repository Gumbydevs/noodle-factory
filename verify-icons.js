// This script verifies that icons are in the proper locations and formats for electron-builder
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Icon paths that need to be checked
const iconsToCheck = {
  buildIcon: path.join(__dirname, 'build', 'icon.ico'),
  publicIcon: path.join(__dirname, 'public', 'icons', 'NoodleFactoryLogo.ico'),
  installerIcon: path.join(__dirname, 'public', 'icons', 'NoodleFactoryLogo.ico')
};

console.log('Verifying icon files...');

// Check if each icon exists
let allIconsExist = true;
for (const [name, iconPath] of Object.entries(iconsToCheck)) {
  if (fs.existsSync(iconPath)) {
    console.log(`✓ ${name} exists at: ${iconPath}`);
  } else {
    console.error(`✗ ${name} does not exist at: ${iconPath}`);
    allIconsExist = false;
  }
}

if (!allIconsExist) {
  console.error('Some required icon files are missing!');
  process.exit(1);
}

// Ensure build directory exists
if (!fs.existsSync(path.join(__dirname, 'build'))) {
  console.log('Creating build directory...');
  fs.mkdirSync(path.join(__dirname, 'build'));
}

// Copy the icon to the build directory if it doesn't exist there already
if (!fs.existsSync(path.join(__dirname, 'build', 'icon.ico'))) {
  console.log('Copying icon to build directory...');
  fs.copyFileSync(
    path.join(__dirname, 'public', 'icons', 'NoodleFactoryLogo.ico'),
    path.join(__dirname, 'build', 'icon.ico')
  );
}

console.log('Icon verification complete.');
