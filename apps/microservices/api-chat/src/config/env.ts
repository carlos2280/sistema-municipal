import dotenv from 'dotenv'
import { validateEnv } from '../env/schema.js'

dotenv.config()

export const env = validateEnv()
