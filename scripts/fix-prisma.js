// Script to fix Prisma Client default.js for Next.js
const fs = require('fs');
const path = require('path');

const prismaClientPath = path.join(__dirname, '../node_modules/.prisma/client');
const defaultJsPath = path.join(prismaClientPath, 'default.js');

if (fs.existsSync(prismaClientPath)) {
  const defaultJsContent = `// Auto-generated for Prisma 7 + Next.js compatibility
// Prisma generates TypeScript, Next.js compiles it
'use strict';

// Export from client.ts - Next.js will compile TypeScript
try {
  // In Next.js, TypeScript files are compiled automatically
  // We need to export what client.ts exports
  const clientModule = require('./client.ts');
  module.exports = clientModule;
} catch (e) {
  // Fallback if TS compilation fails
  console.error('Prisma Client compilation error:', e.message);
  throw new Error('Prisma Client not available. Run: npx prisma generate');
}
`;

  fs.writeFileSync(defaultJsPath, defaultJsContent);
  console.log('✓ Fixed Prisma Client default.js');
} else {
  console.log('⚠ Prisma Client not found. Run: npx prisma generate');
}

