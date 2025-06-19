#!/usr/bin/env node

/**
 * Simple YAML validation script for GitHub configuration files
 * Run with: node .github/validate-yaml.js
 */

const fs = require('fs');
const path = require('path');

// Check if line is in a script block
function isInScriptBlock(lines, currentIndex) {
  for (let i = currentIndex - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.includes('script: |')) {
      return true;
    }
    if (line.match(/^\s*\w+:/) && !line.includes('  ')) {
      return false;
    }
  }
  return false;
}

// Check if line should be skipped
function shouldSkipLine(line) {
  return line.trim() === '' || line.trim().startsWith('#');
}

// Validate YAML colon spacing
function validateColonSpacing(line, lineNum) {
  if (!line.includes(':')) {
    return null;
  }
  
  const afterColon = line.split(':').slice(1).join(':');
  if (afterColon && !afterColon.startsWith(' ') && afterColon.trim() !== '') {
    return `Line ${lineNum}: Missing space after colon`;
  }
  
  return null;
}

// Simple YAML parser check (basic validation)
function validateYAML(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const errors = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      if (shouldSkipLine(line)) {
        continue;
      }
      
      if (isInScriptBlock(lines, i)) {
        continue;
      }
      
      const error = validateColonSpacing(line, lineNum);
      if (error) {
        errors.push(error);
      }
    }
    
    if (errors.length > 0) {
      console.error(`❌ ${filePath}:`);
      errors.forEach(error => console.error(`  ${error}`));
      return false;
    } else {
      console.log(`✅ ${filePath}: Valid`);
      return true;
    }
    
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
    return false;
  }
}

// Files to validate
const filesToValidate = [
  '.github/ISSUE_TEMPLATE/config.yml',
  '.github/workflows/project-automation.yml',
  '.github/workflows/pr-review.yml'
];

console.log('🔍 Validating YAML files...\n');

let allValid = true;
filesToValidate.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    const isValid = validateYAML(fullPath);
    allValid = allValid && isValid;
  } else {
    console.error(`❌ ${file}: File not found`);
    allValid = false;
  }
});

console.log('\n' + (allValid ? '✅ All YAML files are valid!' : '❌ Some YAML files have issues.'));
process.exit(allValid ? 0 : 1);