// Script to fix Prisma Client default.js for Next.js
const fs = require('fs');
const path = require('path');

const prismaClientPath = path.join(__dirname, '../node_modules/.prisma/client');
const defaultJsPath = path.join(prismaClientPath, 'default.js');

if (fs.existsSync(prismaClientPath)) {
  const defaultJsContent = `// Prisma 7 + Next.js Turbopack compatibility
// Export PrismaClient from the TypeScript client file
'use strict';

// For Next.js/Turbopack, we need to export from the TS file
// Turbopack will handle TypeScript compilation
module.exports = require('./client');
`;

  fs.writeFileSync(defaultJsPath, defaultJsContent);
  console.log('✓ Fixed Prisma Client default.js');
} else {
  console.log('⚠ Prisma Client not found. Run: npx prisma generate');
}

