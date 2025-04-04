// Script to check if coverage data exists before generating the report
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const nycOutput = path.join(projectRoot, '.nyc_output');

// Check if .nyc_output directory exists and has files
if (!fs.existsSync(nycOutput)) {
  console.error('❌ No .nyc_output directory found. Run tests first to generate coverage data.');
  process.exit(1);
}

const files = fs.readdirSync(nycOutput);

if (files.length === 0) {
  console.error('❌ No coverage data files found in .nyc_output. Make sure tests are collecting coverage.');
  process.exit(1);
}

// Look for coverage data files (should have .json extension)
const coverageFiles = files.filter(file => file.endsWith('.json'));
if (coverageFiles.length === 0) {
  console.error('❌ No coverage JSON files found in .nyc_output. Check that Istanbul instrumentation is working.');
  process.exit(1);
}

console.log('✅ Coverage data found. Proceeding with report generation.'); 