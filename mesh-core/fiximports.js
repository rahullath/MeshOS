/**
 * Script to fix import statements in all JavaScript files
 * Run with: node fix-imports.js
 */
const fs = require('fs');
const path = require('path');

// Directory to start searching from (project root)
const rootDir = path.resolve(__dirname);
const srcDir = path.join(rootDir, 'src');

// Patterns to fix
const importPatterns = [
  { from: /from ['"]lib\/([^'"]+)['"]/g, to: 'from \'../lib/$1\'' },
  { from: /from ['"]middleware\/([^'"]+)['"]/g, to: 'from \'../middleware/$1\'' },
  { from: /from ['"]models\/([^'"]+)['"]/g, to: 'from \'../models/$1\'' },
  { from: /from ['"]utils\/([^'"]+)['"]/g, to: 'from \'../utils/$1\'' },
  { from: /from ['"]components\/([^'"]+)['"]/g, to: 'from \'../components/$1\'' },
];

// Counter for files modified
let modifiedFiles = 0;

// Process a single file
function processFile(filePath) {
  // Only process JavaScript/TypeScript files
  if (!/\.(js|jsx|ts|tsx)$/.test(filePath)) return;
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileModified = false;
  
  // Apply all import pattern fixes
  importPatterns.forEach(pattern => {
    // Handle path depth for relative imports
    const relativePattern = pattern.from;
    
    // Calculate the path depth (how many directories away from src)
    const relativePath = path.relative(srcDir, path.dirname(filePath));
    const depth = relativePath.split(path.sep).length;
    
    // Adjust the '../' prefix based on depth
    let replacement = pattern.to;
    if (depth > 1) {
      // Add additional '../' for each directory level
      replacement = replacement.replace('../', '../'.repeat(depth));
    }
    
    // Apply the replacement
    const updatedContent = content.replace(relativePattern, replacement);
    
    if (updatedContent !== content) {
      content = updatedContent;
      fileModified = true;
    }
  });
  
  // Save the file if changes were made
  if (fileModified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed imports in: ${path.relative(rootDir, filePath)}`);
    modifiedFiles++;
  }
}

// Recursively process all files in a directory
function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .next directories
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        processDirectory(fullPath);
      }
    } else {
      processFile(fullPath);
    }
  }
}

// Start processing from the src directory
console.log('🔍 Scanning for files with incorrect imports...');
processDirectory(srcDir);
console.log(`✨ Done! Fixed imports in ${modifiedFiles} files.`);