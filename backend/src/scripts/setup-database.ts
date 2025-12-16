#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';
import { readFileSync } from 'fs';
import { join } from 'path';

async function main() {
    console.log('🗄️  Database Setup Script\n');

    const client = createClient(
        config.supabase.url,
        config.supabase.serviceKey
    );

    try {
        // Read schema file
        const schemaPath = join(process.cwd(), 'src', 'db', 'schema.sql');
        const _schema = readFileSync(schemaPath, 'utf-8');

        console.log('📝 Executing database schema...\n');

        // Execute schema
        // Note: Supabase doesn't support direct SQL execution via the JS client
        // You'll need to run this manually in the Supabase SQL editor
        // or use a PostgreSQL client

        console.log('⚠️  Please run the following SQL in your Supabase SQL editor:\n');
        console.log('File location:', schemaPath);
        console.log('\nOr copy the schema from src/db/schema.sql\n');

        // Test connection
        const { data: _data, error } = await client.from('mints').select('count').limit(1);

        if (error && error.code !== 'PGRST116') {
            console.log('❌ Tables not yet created. Please run the schema.sql file in Supabase.');
        } else {
            console.log('✅ Database connection successful!');
        }

    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

main();
