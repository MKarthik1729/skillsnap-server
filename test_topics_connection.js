const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api/v1';

async function testTopicsAPI() {
    console.log('🧪 Testing Topics API Connection...\n');
    
    try {
        // Test 1: Health check
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${API_BASE.replace('/api/v1', '')}/health`);
        if (healthResponse.ok) {
            console.log('✅ Health check passed');
        } else {
            console.log('❌ Health check failed');
            return;
        }
        
        // Test 2: Get all topics
        console.log('\n2. Testing GET /api/v1/topics...');
        const topicsResponse = await fetch(`${API_BASE}/topics`);
        if (topicsResponse.ok) {
            const topicsData = await topicsResponse.json();
            console.log('✅ Topics endpoint working');
            console.log(`   Found ${topicsData.data?.topics?.length || topicsData.data?.length || 0} topics`);
        } else {
            console.log('❌ Topics endpoint failed');
            console.log(`   Status: ${topicsResponse.status}`);
        }
        
        // Test 3: Get skills (for dropdown)
        console.log('\n3. Testing GET /api/v1/skills...');
        const skillsResponse = await fetch(`${API_BASE}/skills`);
        if (skillsResponse.ok) {
            const skillsData = await skillsResponse.json();
            console.log('✅ Skills endpoint working');
            console.log(`   Found ${skillsData.data?.length || 0} skills`);
        } else {
            console.log('❌ Skills endpoint failed');
            console.log(`   Status: ${skillsResponse.status}`);
        }
        
        // Test 4: Test pagination
        console.log('\n4. Testing pagination...');
        const paginationResponse = await fetch(`${API_BASE}/topics?page=1&limit=5`);
        if (paginationResponse.ok) {
            const paginationData = await paginationResponse.json();
            console.log('✅ Pagination working');
            if (paginationData.data?.pagination) {
                console.log(`   Total pages: ${paginationData.data.pagination.total_pages}`);
                console.log(`   Total topics: ${paginationData.data.pagination.total_topics}`);
            }
        } else {
            console.log('❌ Pagination failed');
        }
        
        console.log('\n🎉 Topics API connection test completed!');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.log('\n💡 Make sure:');
        console.log('   1. The server is running (npm start)');
        console.log('   2. MongoDB connection is configured');
        console.log('   3. Environment variables are set');
    }
}

// Run the test
testTopicsAPI();
