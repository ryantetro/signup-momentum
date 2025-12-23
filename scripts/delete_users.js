const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env.local
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    console.log('Reading env from:', envPath);
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/"/g, '');
        }
    });
} catch (e) {
    console.log('Could not read .env.local', e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    console.log('URL:', supabaseUrl);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function deleteAllUsers() {
    console.log('Fetching users...');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    console.log(`Found ${users.length} users.`);

    // Clean public tables first to avoid FK constraints
    console.log('Cleaning public tables...');

    // Delete all products
    const { error: productsError } = await supabase
        .from('products')
        .delete()
        .neq('id', 0); // Hack to delete all

    if (productsError) console.error('Error cleaning products:', productsError);
    else console.log('Cleaned products table');

    // Delete all profiles
    const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (profilesError) console.error('Error cleaning profiles:', profilesError);
    else console.log('Cleaned profiles table');

    for (const user of users) {
        console.log(`Deleting user: ${user.email} (${user.id})`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
            console.error(`Failed to delete ${user.email}:`, deleteError);
        } else {
            console.log(`Deleted ${user.email}`);
        }
    }
    console.log('Done.');
}

deleteAllUsers();
