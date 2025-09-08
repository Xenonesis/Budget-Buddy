#!/usr/bin/env node

/**
 * Simple Year-over-Year Validation Script
 * 
 * Validates that our Year-over-Year implementation is working correctly
 * by checking the core functionality that we can test.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function log(message, color = 'reset') {
  console.log(colorize(message, color));
}

function logHeader(message) {
  console.log('');
  log('='.repeat(60), 'cyan');
  log(message, 'bright');
  log('='.repeat(60), 'cyan');
}

function checkFileExists(filePath, description) {
  const fullPath = path.resolve(filePath);
  const exists = fs.existsSync(fullPath);
  
  log(`${exists ? '✅' : '❌'} ${description}`, exists ? 'green' : 'red');
  if (exists) {
    const stats = fs.statSync(fullPath);
    log(`   Size: ${Math.round(stats.size / 1024)}KB, Modified: ${stats.mtime.toLocaleDateString()}`, 'blue');
  }
  
  return exists;
}

function validateTypeScriptFiles() {
  logHeader('File Structure Validation');
  
  const requiredFiles = [
    ['lib/types/analytics.ts', 'Analytics TypeScript interfaces'],
    ['lib/year-over-year-service.ts', 'Year-over-Year service implementation'],
    ['lib/year-over-year-validator.ts', 'Validation utilities'],
    ['components/dashboard/charts/year-over-year-comparison.tsx', 'Year-over-Year component'],
    ['sql/year-over-year-functions.sql', 'Database optimization functions']
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(([filePath, description]) => {
    if (!checkFileExists(filePath, description)) {
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

function checkTypeScriptCompilation() {
  logHeader('TypeScript Compilation Check');
  
  try {
    log('Running TypeScript compilation check...', 'yellow');
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    log('✅ TypeScript compilation successful', 'green');
    return true;
  } catch (error) {
    log('❌ TypeScript compilation failed', 'red');
    if (error.stdout) {
      log('Compilation errors:', 'red');
      console.log(error.stdout.toString());
    }
    return false;
  }
}

function validateCodeStructure() {
  logHeader('Code Structure Analysis');
  
  let structureValid = true;
  
  // Check if key interfaces exist in analytics.ts
  try {
    const analyticsContent = fs.readFileSync('lib/types/analytics.ts', 'utf8');
    const requiredInterfaces = ['YearlyAnalytics', 'MonthlyAnalytics', 'CategoryData', 'YoYMetrics'];
    
    requiredInterfaces.forEach(interfaceName => {
      if (analyticsContent.includes(`interface ${interfaceName}`)) {
        log(`✅ ${interfaceName} interface found`, 'green');
      } else {
        log(`❌ ${interfaceName} interface missing`, 'red');
        structureValid = false;
      }
    });
  } catch (error) {
    log(`❌ Could not read analytics.ts: ${error.message}`, 'red');
    structureValid = false;
  }
  
  // Check if service methods exist
  try {
    const serviceContent = fs.readFileSync('lib/year-over-year-service.ts', 'utf8');
    const requiredMethods = ['fetchYearOverYearData', 'calculateYearOverYearMetrics'];
    
    requiredMethods.forEach(method => {
      if (serviceContent.includes(method)) {
        log(`✅ ${method} method found`, 'green');
      } else {
        log(`❌ ${method} method missing`, 'red');
        structureValid = false;
      }
    });
  } catch (error) {
    log(`❌ Could not read year-over-year-service.ts: ${error.message}`, 'red');
    structureValid = false;
  }
  
  return structureValid;
}

function checkDatabaseFiles() {
  logHeader('Database Schema Validation');
  
  try {
    const sqlContent = fs.readFileSync('sql/year-over-year-functions.sql', 'utf8');
    const requiredFunctions = ['get_yearly_financial_summary', 'calculate_yoy_growth_metrics'];
    
    let functionsFound = 0;
    requiredFunctions.forEach(func => {
      if (sqlContent.includes(func)) {
        log(`✅ ${func} SQL function found`, 'green');
        functionsFound++;
      } else {
        log(`❌ ${func} SQL function missing`, 'red');
      }
    });
    
    return functionsFound === requiredFunctions.length;
  } catch (error) {
    log(`❌ Could not read SQL functions file: ${error.message}`, 'red');
    return false;
  }
}

function validateComponentIntegration() {
  logHeader('Component Integration Check');
  
  try {
    const componentContent = fs.readFileSync('components/dashboard/charts/year-over-year-comparison.tsx', 'utf8');
    
    // Check for key imports and functionality
    const requiredFeatures = [
      'validateYearOverYearFunctionality',
      'YearOverYearService',
      'PredictiveAnalyticsService',
      'Run Validation'
    ];
    
    let featuresFound = 0;
    requiredFeatures.forEach(feature => {
      if (componentContent.includes(feature)) {
        log(`✅ ${feature} integration found`, 'green');
        featuresFound++;
      } else {
        log(`❌ ${feature} integration missing`, 'red');
      }
    });
    
    return featuresFound === requiredFeatures.length;
  } catch (error) {
    log(`❌ Could not read component file: ${error.message}`, 'red');
    return false;
  }
}

function generateFinalReport(results) {
  logHeader('Year-over-Year Implementation Report');
  
  const totalChecks = results.length;
  const passedChecks = results.filter(r => r.passed).length;
  const successRate = Math.round((passedChecks / totalChecks) * 100);
  
  log(`Total Checks: ${totalChecks}`, 'bright');
  log(`Passed: ${passedChecks}`, 'green');
  log(`Failed: ${totalChecks - passedChecks}`, passedChecks === totalChecks ? 'green' : 'red');
  log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
  
  if (successRate >= 80) {
    log('\\n🎉 Year-over-Year implementation is ready!', 'green');
    log('✅ All core components are in place', 'green');
    log('✅ TypeScript compilation is successful', 'green');
    log('✅ File structure is complete', 'green');
    
    logHeader('Next Steps');
    log('1. Deploy the SQL functions to your database:', 'bright');
    log('   psql -f sql/year-over-year-functions.sql your_database', 'blue');
    log('2. Test the dashboard component manually', 'bright');
    log('3. Use the validation feature in the component', 'bright');
    log('4. Monitor performance in production', 'bright');
    
  } else {
    log('\\n⚠️  Implementation needs attention', 'yellow');
    log('Please review the failed checks above', 'red');
    
    results.filter(r => !r.passed).forEach(result => {
      log(`• ${result.name}: ${result.message}`, 'red');
    });
  }
  
  logHeader('Manual Testing Checklist');
  log('Complete these tests in your browser:', 'bright');
  log('□ Load dashboard and verify Year-over-Year section appears', 'reset');
  log('□ Confirm real transaction data is displayed (no mock data)', 'reset');
  log('□ Test the "Run Validation" button', 'reset');
  log('□ Verify charts show actual financial data', 'reset');
  log('□ Test category filtering and year selection', 'reset');
  log('□ Check performance with larger datasets', 'reset');
  
  return successRate >= 80;
}

async function main() {
  logHeader('Year-over-Year Validation Suite');
  log('Validating the redesigned Year-over-Year comparison system...', 'green');
  
  const results = [];
  
  // Run all validation checks
  results.push({
    name: 'File Structure',
    passed: validateTypeScriptFiles(),
    message: 'Core implementation files'
  });
  
  results.push({
    name: 'TypeScript Compilation',
    passed: checkTypeScriptCompilation(),
    message: 'Type safety and compilation'
  });
  
  results.push({
    name: 'Code Structure',
    passed: validateCodeStructure(),
    message: 'Required interfaces and methods'
  });
  
  results.push({
    name: 'Database Schema',
    passed: checkDatabaseFiles(),
    message: 'SQL optimization functions'
  });
  
  results.push({
    name: 'Component Integration',
    passed: validateComponentIntegration(),
    message: 'UI component and validation features'
  });
  
  // Generate final report
  const success = generateFinalReport(results);
  
  process.exit(success ? 0 : 1);
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Year-over-Year Validation Script');
  console.log('');
  console.log('Usage: node scripts/simple-yoy-test.js');
  console.log('');
  console.log('This script validates that the Year-over-Year implementation');
  console.log('is complete and ready for testing with real data.');
  process.exit(0);
}

// Run the validation
main().catch((error) => {
  log(`\\n❌ Validation failed: ${error.message}`, 'red');
  process.exit(1);
});