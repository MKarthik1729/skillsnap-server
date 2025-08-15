const mongoose = require('mongoose');
require('dotenv').config();

// Import the topic schema and services
const Topic = require('./schemas/topic_schema');
const topic_services = require('./services/topic_services');

async function testCreateTopic() {
    console.log('🧪 Testing Topic Creation...\n');
    
    try {
        // Connect to MongoDB
        const connection_string = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@skills.7yptkom.mongodb.net/?retryWrites=true&w=majority&appName=skills`;
        await mongoose.connect(connection_string);
        console.log('✅ Connected to MongoDB');
        
        // Test 1: Create a standalone topic
        console.log('\n1. Testing standalone topic creation...');
        const topicData = {
            name: 'Test Topic ' + Date.now(),
            description: 'This is a test topic created for debugging'
        };
        
        const createResult = await topic_services.create_standalone_topic(topicData);
        
        if (createResult.success) {
            console.log('✅ Topic created successfully');
            console.log(`   Topic ID: ${createResult.data._id}`);
            console.log(`   Topic Name: ${createResult.data.name}`);
        } else {
            console.log('❌ Topic creation failed');
            console.log(`   Error: ${createResult.error}`);
            console.log(`   Message: ${createResult.message}`);
        }
        
        // Test 2: Try to retrieve all topics
        console.log('\n2. Testing topic retrieval...');
        const retrieveResult = await topic_services.get_all_topics();
        
        if (retrieveResult.success) {
            console.log('✅ Topics retrieved successfully');
            console.log(`   Found ${retrieveResult.data.length} topics`);
            
            if (retrieveResult.data.length > 0) {
                console.log('   Sample topics:');
                retrieveResult.data.slice(0, 3).forEach((topic, index) => {
                    console.log(`   ${index + 1}. ${topic.name} (${topic._id})`);
                });
            }
        } else {
            console.log('❌ Topic retrieval failed');
            console.log(`   Error: ${retrieveResult.error}`);
            console.log(`   Message: ${retrieveResult.message}`);
        }
        
        // Test 3: Test pagination
        console.log('\n3. Testing pagination...');
        const paginationResult = await topic_services.get_topics_with_pagination(1, 5);
        
        if (paginationResult.success) {
            console.log('✅ Pagination working');
            console.log(`   Total topics: ${paginationResult.data.pagination.total_topics}`);
            console.log(`   Current page: ${paginationResult.data.pagination.current_page}`);
            console.log(`   Topics on this page: ${paginationResult.data.topics.length}`);
        } else {
            console.log('❌ Pagination failed');
            console.log(`   Error: ${paginationResult.error}`);
            console.log(`   Message: ${paginationResult.message}`);
        }
        
        console.log('\n🎉 Topic creation and retrieval test completed!');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        
        if (error.name === 'MongoServerSelectionError') {
            console.log('\n💡 MongoDB Connection Issue:');
            console.log('   Please check your .env file and ensure MONGODB_USERNAME and MONGODB_PASSWORD are set correctly');
        } else {
            console.log('\n💡 Other Issue:');
            console.log('   Check the error details above for more information');
        }
    } finally {
        // Close the connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n📡 MongoDB connection closed');
        }
    }
}

// Run the test
testCreateTopic();
