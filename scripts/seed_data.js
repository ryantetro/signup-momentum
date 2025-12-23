const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env.local
try {
    const envPath = path.resolve(__dirname, '../.env.local');
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
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function seedData() {
    console.log('Finding product...');
    const { data: products, error: productError } = await supabase
        .from('products')
        .select('id, name')
        .limit(1);

    if (productError || !products || products.length === 0) {
        console.error('No products found. Please Log in and complete the setup first.');
        return;
    }

    const product = products[0];
    console.log(`Seeding data for product: ${product.name} (${product.id})`);

    const entries = [];
    const today = new Date();
    const target = 22;
    const start = 4;

    // Generate for last 14 days (excluding today, assuming user has entered today)
    for (let i = 14; i >= 1; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0]; // Format YYYY-MM-DD

        // Linear growth + noise
        // Progress 0.0 to 1.0
        const progress = (14 - i) / 13;

        const noise = Math.floor(Math.random() * 4) - 2; // -2 to +1
        let count = Math.floor(start + (target - start) * progress) + noise;

        if (count < 0) count = 0;

        entries.push({
            product_id: product.id,
            date: dateStr,
            count: count
        });
    }

    console.log(`Generated ${entries.length} entries.`);

    const { error } = await supabase.from('daily_signup_entries').upsert(entries, { onConflict: 'product_id, date' });

    if (error) {
        console.error('Error seeding data:', error);
    } else {
        console.log('Successfully seeded growth data! Refresh your dashboard.');
    }
}

seedData();
