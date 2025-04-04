// Debug script to check for coverage files and provide info
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const nycOutput = path.join(projectRoot, '.nyc_output');
const playwrightReport = path.join(projectRoot, 'playwright-report');
const coverageReport = path.join(playwrightReport, 'coverage');

console.log('Checking coverage directories and files...');

// Check if .nyc_output exists and has files
console.log('\n.nyc_output directory:');
if (fs.existsSync(nycOutput)) {
  console.log('✅ Directory exists');
  
  const files = fs.readdirSync(nycOutput);
  console.log(`Found ${files.length} files:`);
  files.forEach(file => {
    const filePath = path.join(nycOutput, file);
    const stats = fs.statSync(filePath);
    console.log(`- ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  });
} else {
  console.log('❌ Directory does not exist');
}

// Check if the playwright-report exists
console.log('\nplaywright-report directory:');
if (fs.existsSync(playwrightReport)) {
  console.log('✅ Directory exists');
  
  const files = fs.readdirSync(playwrightReport);
  console.log(`Found ${files.length} files at root level:`);
  files.forEach(file => {
    const filePath = path.join(playwrightReport, file);
    const isDir = fs.statSync(filePath).isDirectory();
    console.log(`- ${file}${isDir ? ' (directory)' : ''}`);
  });
} else {
  console.log('❌ Directory does not exist');
}

// Check if the coverage report exists
console.log('\ncoverage report directory:');
if (fs.existsSync(coverageReport)) {
  console.log('✅ Directory exists');
  
  const files = fs.readdirSync(coverageReport);
  console.log(`Found ${files.length} files:`);
  files.slice(0, 5).forEach(file => {
    console.log(`- ${file}`);
  });
  
  if (files.length > 5) {
    console.log(`... and ${files.length - 5} more files`);
  }
  
  const indexHtml = path.join(coverageReport, 'index.html');
  if (fs.existsSync(indexHtml)) {
    console.log('✅ index.html exists');
  } else {
    console.log('❌ index.html does not exist');
  }
} else {
  console.log('❌ Directory does not exist');
}

// Final advice
console.log('\nTroubleshooting:');
if (!fs.existsSync(nycOutput) || fs.readdirSync(nycOutput).length === 0) {
  console.log('- No coverage data is being collected. Check that vite-plugin-istanbul is properly configured.');
  console.log('- Check if window.__coverage__ exists in the browser console during tests.');
}

if (!fs.existsSync(coverageReport)) {
  console.log('- Coverage report is not being generated. Make sure the "report:coverage" script is running correctly.');
  console.log('- Check that the .nycrc.json file has the correct "report-dir" value.');
}

console.log('\nTip: Run "node e2e/debug-coverage.js" after running tests to see this diagnostic information.'); 