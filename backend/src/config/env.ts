import dotenv from 'dotenv';
import path from 'path';

// Simply load .env from the backend folder root, don't fail if it doesn't exist
dotenv.config();

export default dotenv;