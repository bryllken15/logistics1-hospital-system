const fs = require('fs');
const path = require('path');

// Files to fix
const files = [
  'src/components/dashboards/AdminDashboard.tsx',
  'src/components/dashboards/DocumentAnalystDashboard.tsx', 
  'src/components/dashboards/EmployeeDashboard.tsx',
  'src/components/dashboards/MaintenanceDashboard.tsx',
  'src/components/dashboards/ManagerDashboard.tsx',
  'src/components/dashboards/ProcurementDashboard.tsx',
  'src/components/dashboards/ProjectManagerDashboard.tsx',
  'src/contexts/AuthContext.tsx',
  'src/contexts/SupabaseAuthContext.tsx',
  'src/pages/Dashboard.tsx'
];

// Fix each file
files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove unused React imports
    content = content.replace(/import React from 'react'\n/g, '');
    content = content.replace(/import React, {([^}]+)} from 'react'\n/g, (match, imports) => {
      return `import {${imports.trim()}} from 'react'\n`;
    });
    
    // Remove unused imports
    content = content.replace(/, AlertTriangle/g, '');
    content = content.replace(/, Filter/g, '');
    content = content.replace(/, TrendingUp/g, '');
    content = content.replace(/, AlertCircle/g, '');
    content = content.replace(/, SupabaseUser/g, '');
    
    // Fix unused parameters
    content = content.replace(/async \(event, session\) =>/g, 'async (_, session) =>');
    content = content.replace(/sidebarOpen: boolean/g, '_sidebarOpen: boolean');
    content = content.replace(/sidebarOpen\}/g, '_sidebarOpen}');
    content = content.replace(/onMenuClick, sidebarOpen/g, 'onMenuClick, _sidebarOpen');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
  }
});

console.log('TypeScript fixes applied!');
