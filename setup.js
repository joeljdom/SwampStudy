#!/usr/bin/env node

/**
 * Cross-platform setup script for SwampStudy
 * Works on Windows, macOS, and Linux
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up SwampStudy...\n');

// Install root dependencies
console.log('📦 Installing root dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Install server dependencies
console.log('\n📦 Installing server dependencies...');
execSync('npm --prefix server install', { stdio: 'inherit' });

// Install client dependencies
console.log('\n📦 Installing client dependencies...');
execSync('npm --prefix client install', { stdio: 'inherit' });

// Fix permissions on Unix systems (macOS, Linux)
// Windows doesn't need this as it handles executables differently
if (process.platform !== 'win32') {
  console.log('\n🔧 Fixing executable permissions...');
  ['client', 'server'].forEach(dir => {
    const binDir = path.join(dir, 'node_modules', '.bin');
    if (fs.existsSync(binDir)) {
      try {
        const files = fs.readdirSync(binDir);
        files.forEach(file => {
          const filePath = path.join(binDir, file);
          try {
            fs.chmodSync(filePath, '755');
          } catch (err) {
            // Ignore errors (file might not exist or already have correct permissions)
          }
        });
      } catch (err) {
        // Ignore if directory doesn't exist
      }
    }
  });
}

console.log('\n✅ Setup complete! You can now run \'npm run dev\' to start the development servers.');

