// scripts/test-db.js
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    console.log('Database URL:', process.env.DATABASE_URL)
    
    const result = await prisma.$queryRaw`SELECT NOW()`
    console.log('Connection successful:', result)
  } catch (error) {
    console.error('Connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()