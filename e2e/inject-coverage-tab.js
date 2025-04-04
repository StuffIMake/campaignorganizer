// Script to inject a coverage tab into the existing Playwright HTML report
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const playwrightReportDir = path.join(projectRoot, 'playwright-report');
const reportIndexPath = path.join(playwrightReportDir, 'index.html');

// Exit if the Playwright report doesn't exist
if (!fs.existsSync(reportIndexPath)) {
  console.error('Playwright report index.html not found at:', reportIndexPath);
  process.exit(1);
}

// Read the existing index.html file
let htmlContent = fs.readFileSync(reportIndexPath, 'utf-8');

// Define the coverage tab HTML to inject
const coverageTabHTML = `
<a 
  href="./coverage/index.html" 
  id="coverage-button"
  class="coverage-report-link" 
  style="display: inline-block; background-color: #4CAF50; color: white; 
  font-weight: bold; padding: 8px 16px; margin: 10px; text-decoration: none; 
  border-radius: 4px; position: fixed; top: 10px; right: 10px; z-index: 9999;">
  Coverage Report
</a>`;

// Insert the button at the end of the body instead of trying to find specific elements
const bodyEndRegex = /<\/body>/;
if (bodyEndRegex.test(htmlContent)) {
  // Insert our coverage button right before the body closing tag
  htmlContent = htmlContent.replace(bodyEndRegex, `${coverageTabHTML}\n</body>`);
  
  // Write the modified content back to the file
  fs.writeFileSync(reportIndexPath, htmlContent);
  console.log('✅ Coverage button successfully added to Playwright report');
} else {
  console.error('Could not find </body> tag in the Playwright report');
}

// Add a simple script to check if coverage exists
const coverageDir = path.join(playwrightReportDir, 'coverage');
if (!fs.existsSync(coverageDir) || !fs.existsSync(path.join(coverageDir, 'index.html'))) {
  console.warn('⚠️ Warning: Coverage report directory or index.html not found.');
  console.warn('   Run "npm run report:coverage" to generate the coverage report');
} else {
  console.log('✅ Coverage report found at: ' + path.join(coverageDir, 'index.html'));
} 