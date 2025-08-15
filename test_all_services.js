const mongoose = require('mongoose');
require('dotenv').config();

// Import all services
const topic_services = require('./services/topic_services');
const page_data_services = require('./services/page_data_services');
const code_services = require('./services/code_services');
const skills_services = require('./services/skills_services');

async function testAllServices() {
    console.log('🧪 Testing All Services...\n');
    
    try {
        // Connect to MongoDB
        const connection_string = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@skills.7yptkom.mongodb.net/?retryWrites=true&w=majority&appName=skills`;
        await mongoose.connect(connection_string);
        console.log('✅ Connected to MongoDB');
        
        // Test 1: Topics Service
        console.log('\n1. Testing Topics Service...');
        const topicsResult = await topic_services.get_all_topics();
        if (topicsResult.success) {
            console.log('✅ Topics service working');
            console.log(`   Found ${topicsResult.data.length} topics`);
        } else {
            console.log('❌ Topics service failed:', topicsResult.message);
        }
        
        // Test 2: Page Data Service
        console.log('\n2. Testing Page Data Service...');
        const pageDataResult = await page_data_services.get_all_page_data();
        if (pageDataResult.success) {
            console.log('✅ Page Data service working');
            console.log(`   Found ${pageDataResult.data.length} page data items`);
        } else {
            console.log('❌ Page Data service failed:', pageDataResult.message);
        }
        
        // Test 3: Codes Service
        console.log('\n3. Testing Codes Service...');
        const codesResult = await code_services.get_all_codes();
        if (codesResult.success) {
            console.log('✅ Codes service working');
            console.log(`   Found ${codesResult.data.length} codes`);
        } else {
            console.log('❌ Codes service failed:', codesResult.message);
        }
        
        // Test 4: Skills Service
        console.log('\n4. Testing Skills Service...');
        const skillsResult = await skills_services.get_all_skills();
        if (skillsResult.success) {
            console.log('✅ Skills service working');
            console.log(`   Found ${skillsResult.data.length} skills`);
        } else {
            console.log('❌ Skills service failed:', skillsResult.message);
        }
        
        // Test 5: Create Test Data
        console.log('\n5. Testing Data Creation...');
        
        // Create a test topic
        const topicData = {
            name: 'Test Topic ' + Date.now(),
            description: 'Test topic for service verification'
        };
        const createTopicResult = await topic_services.create_topic(topicData);
        if (createTopicResult.success) {
            console.log('✅ Topic creation working');
            const topicId = createTopicResult.data._id;
            
            // Create test page data
            const pageDataData = {
                title: 'Test Page Data ' + Date.now(),
                description: 'Test page data for service verification',
                content: ['Test content line 1', 'Test content line 2']
            };
            const createPageDataResult = await page_data_services.create_page_data(pageDataData);
            if (createPageDataResult.success) {
                console.log('✅ Page Data creation working');
            } else {
                console.log('❌ Page Data creation failed:', createPageDataResult.message);
            }
            
            // Create test code
            const codeData = {
                language: 'JavaScript',
                description: 'Test code for service verification',
                code: 'console.log("Hello World");'
            };
            const createCodeResult = await code_services.create_code(codeData);
            if (createCodeResult.success) {
                console.log('✅ Code creation working');
            } else {
                console.log('❌ Code creation failed:', createCodeResult.message);
            }
            
            // Clean up test data
            await topic_services.delete_topic(topicId);
            console.log('✅ Test data cleanup completed');
        } else {
            console.log('❌ Topic creation failed:', createTopicResult.message);
        }
        
        // Test 6: Pagination
        console.log('\n6. Testing Pagination...');
        const paginationResult = await topic_services.get_topics_with_pagination(1, 5);
        if (paginationResult.success) {
            console.log('✅ Pagination working');
            console.log(`   Total topics: ${paginationResult.data.pagination.total_topics}`);
            console.log(`   Total pages: ${paginationResult.data.pagination.total_pages}`);
        } else {
            console.log('❌ Pagination failed:', paginationResult.message);
        }
        
        console.log('\n🎉 All services test completed!');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    } finally {
        // Close the connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n📡 MongoDB connection closed');
        }
    }
}

// Run the test
testAllServices();
