const fetch = require('node-fetch').default;

const API_BASE = 'http://localhost:5000/api/v1';

async function testAddToTopic() {
    console.log('🧪 Testing Add to Topic Functionality...\n');
    
    try {
        // Test 1: Get topics first
        console.log('1. Getting topics...');
        const topicsResponse = await fetch(`${API_BASE}/topics`);
        if (!topicsResponse.ok) {
            throw new Error(`Failed to get topics: ${topicsResponse.status}`);
        }
        
        const topicsData = await topicsResponse.json();
        if (!topicsData.success || topicsData.data.length === 0) {
            throw new Error('No topics available for testing');
        }
        
        const topic = topicsData.data[0];
        console.log(`✅ Found topic: ${topic.name} (ID: ${topic._id})`);
        
        // Test 2: Create page data
        console.log('\n2. Creating page data...');
        const pageData = {
            title: 'Test Page Data ' + Date.now(),
            description: 'Test page data for add to topic functionality',
            content: ['Test content item 1', 'Test content item 2']
        };
        
        const pageDataResponse = await fetch(`${API_BASE}/page-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pageData)
        });
        
        if (!pageDataResponse.ok) {
            throw new Error(`Failed to create page data: ${pageDataResponse.status}`);
        }
        
        const pageDataResult = await pageDataResponse.json();
        if (!pageDataResult.success) {
            throw new Error('Failed to create page data');
        }
        
        console.log('✅ Page data created successfully');
        console.log(`   Page Data ID: ${pageDataResult.data._id}`);
        
        // Test 3: Add page data to topic
        console.log('\n3. Adding page data to topic...');
        const addPageDataResponse = await fetch(`${API_BASE}/topics/${topic._id}/page-data/${pageDataResult.data._id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!addPageDataResponse.ok) {
            const errorText = await addPageDataResponse.text();
            throw new Error(`Failed to add page data to topic: ${addPageDataResponse.status} - ${errorText}`);
        }
        
        const addPageDataResult = await addPageDataResponse.json();
        if (addPageDataResult.success) {
            console.log('✅ Page data added to topic successfully');
        } else {
            console.log('❌ Failed to add page data to topic:', addPageDataResult.message);
        }
        
        // Test 4: Create code
        console.log('\n4. Creating code...');
        const codeData = {
            language: 'JavaScript',
            description: 'Test Code ' + Date.now(),
            code: 'console.log("Hello, World!");'
        };
        
        const codeResponse = await fetch(`${API_BASE}/codes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(codeData)
        });
        
        if (!codeResponse.ok) {
            throw new Error(`Failed to create code: ${codeResponse.status}`);
        }
        
        const codeResult = await codeResponse.json();
        if (!codeResult.success) {
            throw new Error('Failed to create code');
        }
        
        console.log('✅ Code created successfully');
        console.log(`   Code ID: ${codeResult.data._id}`);
        
        // Test 5: Add code to topic
        console.log('\n5. Adding code to topic...');
        const addCodeResponse = await fetch(`${API_BASE}/topics/${topic._id}/codes/${codeResult.data._id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!addCodeResponse.ok) {
            const errorText = await addCodeResponse.text();
            throw new Error(`Failed to add code to topic: ${addCodeResponse.status} - ${errorText}`);
        }
        
        const addCodeResult = await addCodeResponse.json();
        if (addCodeResult.success) {
            console.log('✅ Code added to topic successfully');
        } else {
            console.log('❌ Failed to add code to topic:', addCodeResult.message);
        }
        
        // Test 6: Verify topic has both page data and code
        console.log('\n6. Verifying topic contents...');
        const topicResponse = await fetch(`${API_BASE}/topics/${topic._id}`);
        if (topicResponse.ok) {
            const topicData = await topicResponse.json();
            if (topicData.success) {
                const updatedTopic = topicData.data;
                console.log(`✅ Topic has ${updatedTopic.page_data ? updatedTopic.page_data.length : 0} page data items`);
                console.log(`✅ Topic has ${updatedTopic.codes ? updatedTopic.codes.length : 0} codes`);
            }
        }
        
        // Clean up
        console.log('\n7. Cleaning up...');
        const deletePageDataResponse = await fetch(`${API_BASE}/page-data/${pageDataResult.data._id}`, {
            method: 'DELETE'
        });
        if (deletePageDataResponse.ok) {
            console.log('✅ Test page data deleted');
        }
        
        const deleteCodeResponse = await fetch(`${API_BASE}/codes/${codeResult.data._id}`, {
            method: 'DELETE'
        });
        if (deleteCodeResponse.ok) {
            console.log('✅ Test code deleted');
        }
        
        console.log('\n🎉 Add to Topic functionality test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testAddToTopic();
