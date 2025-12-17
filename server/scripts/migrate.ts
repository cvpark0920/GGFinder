import { execSync } from 'child_process';
import prisma from '../prisma';

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Run Prisma migrations
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: process.env,
    });
    
    console.log('✅ Migrations completed successfully');
    
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connection verified');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

