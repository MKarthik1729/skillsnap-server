const mongoose = require('mongoose');
require('dotenv').config();

// Import the topic schema and services
const Topic = require('./schemas/topic_schema');
const topic_services = require('./services/topic_services');

async function diagnoseTopicsError() {
    console.log('🔍 Diagnosing Topics Error...\n');
    
    try {
        // Test 1: Check MongoDB connection
        console.log('1. Testing MongoDB connection...');
        const connection_string = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@skills.7yptkom.mongodb.net/?retryWrites=true&w=majority&appName=skills`;
        
        await mongoose.connect(connection_string);
        console.log('✅ MongoDB connection successful');
        
        // Test 2: Check if topics collection exists and has data
        console.log('\n2. Checking topics collection...');
        const collections = await mongoose.connection.db.listCollections().toArray();
        const topicsCollection = collections.find(col => col.name === 'topics');
        
        if (topicsCollection) {
            console.log('✅ Topics collection exists');
            
            // Count documents
            const count = await Topic.countDocuments();
            console.log(`   Found ${count} topics in database`);
            
            if (count > 0) {
                // Try to get one topic
                const sampleTopic = await Topic.findOne();
                console.log('✅ Sample topic found:', {
                    id: sampleTopic._id,
                    name: sampleTopic.name,
                    created_at: sampleTopic.created_at
                });
            }
        } else {
            console.log('❌ Topics collection does not exist');
        }
        
        // Test 3: Test the get_all_topics service function
        console.log('\n3. Testing get_all_topics service...');
        const result = await topic_services.get_all_topics();
        
        if (result.success) {
            console.log('✅ get_all_topics service working');
            console.log(`   Retrieved ${result.data.length} topics`);
        } else {
            console.log('❌ get_all_topics service failed');
            console.log(`   Error: ${result.error}`);
            console.log(`   Message: ${result.message}`);
        }
        
        // Test 4: Test pagination service
        console.log('\n4. Testing pagination service...');
        const paginationResult = await topic_services.get_topics_with_pagination(1, 10);
        
        if (paginationResult.success) {
            console.log('✅ Pagination service working');
            console.log(`   Total topics: ${paginationResult.data.pagination.total_topics}`);
            console.log(`   Total pages: ${paginationResult.data.pagination.total_pages}`);
        } else {
            console.log('❌ Pagination service failed');
            console.log(`   Error: ${paginationResult.error}`);
            console.log(`   Message: ${paginationResult.message}`);
        }
        
        // Test 5: Check for any validation errors
        console.log('\n5. Testing topic creation (validation)...');
        try {
            const testTopic = new Topic({
                name: 'Test Topic',
                description: 'Test Description'
            });
            await testTopic.validate();
            console.log('✅ Topic schema validation passed');
        } catch (validationError) {
            console.log('❌ Topic schema validation failed');
            console.log(`   Error: ${validationError.message}`);
        }
        
        console.log('\n🎉 Diagnosis completed!');
        
    } catch (error) {
        console.error('❌ Diagnosis failed with error:', error.message);
        
        if (error.name === 'MongoServerSelectionError') {
            console.log('\n💡 MongoDB Connection Issue:');
            console.log('   1. Check if MONGODB_USERNAME and MONGODB_PASSWORD are set in .env file');
            console.log('   2. Verify your MongoDB Atlas credentials');
            console.log('   3. Check your internet connection');
        } else if (error.name === 'ValidationError') {
            console.log('\n💡 Schema Validation Issue:');
            console.log('   1. Check if all required fields are present');
            console.log('   2. Verify data types match schema definition');
        } else {
            console.log('\n💡 General Issue:');
            console.log('   1. Check server logs for more details');
            console.log('   2. Verify all dependencies are installed');
        }
    } finally {
        // Close the connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n📡 MongoDB connection closed');
        }
    }
}

// Run the diagnosis
diagnoseTopicsError();
