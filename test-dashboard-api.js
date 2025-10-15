/**
 * Dashboard API Test Script
 * 
 * This script tests all dashboard endpoints to ensure they're working correctly.
 * Run this after starting the backend server.
 * 
 * Usage: node test-dashboard-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const tests = [];
let passedTests = 0;
let failedTests = 0;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Helper function to make HTTP requests
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsed
          });
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Test function
async function test(name, endpoint, expectations) {
  process.stdout.write(`${colors.cyan}Testing${colors.reset} ${name}... `);
  
  try {
    const result = await makeRequest(endpoint);
    
    // Check status code
    if (result.status !== 200) {
      throw new Error(`Expected status 200, got ${result.status}`);
    }
    
    // Check if response has success property
    if (!result.data.success) {
      throw new Error('Response success property is false');
    }
    
    // Check if response has data property
    if (!result.data.data) {
      throw new Error('Response missing data property');
    }
    
    // Run custom expectations if provided
    if (expectations) {
      expectations(result.data.data);
    }
    
    console.log(`${colors.green}✓ PASSED${colors.reset}`);
    passedTests++;
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ FAILED${colors.reset}`);
    console.log(`  ${colors.red}Error:${colors.reset} ${error.message}`);
    failedTests++;
    return false;
  }
}

// Main test suite
async function runTests() {
  console.log('\n' + colors.blue + '╔═══════════════════════════════════════╗');
  console.log('║  Dashboard API Test Suite             ║');
  console.log('╚═══════════════════════════════════════╝' + colors.reset + '\n');
  
  console.log(`${colors.yellow}Testing against:${colors.reset} ${BASE_URL}\n`);
  
  // Test 1: Dashboard Stats
  await test(
    'Dashboard Statistics',
    '/api/dashboard/stats',
    (data) => {
      if (typeof data.totalDoctors !== 'number') throw new Error('totalDoctors should be a number');
      if (typeof data.totalPatients !== 'number') throw new Error('totalPatients should be a number');
      if (typeof data.totalAppointments !== 'number') throw new Error('totalAppointments should be a number');
    }
  );
  
  // Test 2: All Doctors with Stats
  let firstDoctorId = null;
  await test(
    'All Doctors with Statistics',
    '/api/dashboard/doctors',
    (data) => {
      if (!Array.isArray(data)) throw new Error('Expected data to be an array');
      if (data.length > 0) {
        const doctor = data[0];
        if (!doctor.id) throw new Error('Doctor missing id');
        if (!doctor.name) throw new Error('Doctor missing name');
        if (!doctor.specialization) throw new Error('Doctor missing specialization');
        if (typeof doctor.totalPatients !== 'number') throw new Error('totalPatients should be a number');
        if (typeof doctor.totalIncome !== 'number') throw new Error('totalIncome should be a number');
        if (!Array.isArray(doctor.monthlyIncome)) throw new Error('monthlyIncome should be an array');
        if (!Array.isArray(doctor.patientGrowth)) throw new Error('patientGrowth should be an array');
        
        firstDoctorId = doctor.id; // Save for next test
      }
    }
  );
  
  // Test 3: Specific Doctor Stats (if we have a doctor)
  if (firstDoctorId) {
    await test(
      'Specific Doctor Statistics',
      `/api/dashboard/doctors/${firstDoctorId}`,
      (data) => {
        if (!data.doctor) throw new Error('Missing doctor object');
        if (typeof data.totalPatients !== 'number') throw new Error('totalPatients should be a number');
        if (typeof data.totalIncome !== 'number') throw new Error('totalIncome should be a number');
      }
    );
  } else {
    console.log(`${colors.yellow}⊘ SKIPPED${colors.reset} Specific Doctor Statistics (no doctors in database)`);
  }
  
  // Test 4: Recent Appointments
  await test(
    'Recent Appointments',
    '/api/dashboard/appointments/recent?limit=5',
    (data) => {
      if (!Array.isArray(data)) throw new Error('Expected data to be an array');
      if (data.length > 5) throw new Error('Should respect limit parameter');
    }
  );
  
  // Test 5: Financial Overview
  await test(
    'Financial Overview',
    '/api/dashboard/finance',
    (data) => {
      if (typeof data.totalRevenue !== 'number') throw new Error('totalRevenue should be a number');
      if (typeof data.todayRevenue !== 'number') throw new Error('todayRevenue should be a number');
      if (!Array.isArray(data.monthlyRevenue)) throw new Error('monthlyRevenue should be an array');
      if (data.monthlyRevenue.length !== 6) throw new Error('monthlyRevenue should have 6 months');
    }
  );
  
  // Test 6: Work Hour Analysis
  await test(
    'Work Hour Analysis',
    '/api/dashboard/work-hours',
    (data) => {
      if (typeof data.totalHours !== 'number') throw new Error('totalHours should be a number');
      if (!Array.isArray(data.weeklyData)) throw new Error('weeklyData should be an array');
    }
  );
  
  // Test 7: Health Check (bonus)
  await test(
    'Server Health Check',
    '/health',
    (data) => {
      if (data.status !== 'ok') throw new Error('Server status should be ok');
    }
  );
  
  // Print summary
  console.log('\n' + colors.blue + '═══════════════════════════════════════');
  console.log(`${colors.yellow}Test Summary:${colors.reset}`);
  console.log(`  ${colors.green}Passed:${colors.reset} ${passedTests}`);
  console.log(`  ${colors.red}Failed:${colors.reset} ${failedTests}`);
  console.log(`  Total:  ${passedTests + failedTests}`);
  
  if (failedTests === 0) {
    console.log(`\n${colors.green}✓ All tests passed!${colors.reset} 🎉\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}✗ Some tests failed.${colors.reset} Please check the errors above.\n`);
    process.exit(1);
  }
}

// Check if server is reachable
async function checkServer() {
  try {
    await makeRequest('/health');
    return true;
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset} Cannot connect to server at ${BASE_URL}`);
    console.error(`${colors.yellow}Make sure the backend server is running.${colors.reset}\n`);
    console.error(`Start the server with: ${colors.cyan}npm start${colors.reset} or ${colors.cyan}node app.js${colors.reset}\n`);
    return false;
  }
}

// Run the test suite
(async () => {
  const serverReachable = await checkServer();
  if (!serverReachable) {
    process.exit(1);
  }
  
  await runTests();
})();

