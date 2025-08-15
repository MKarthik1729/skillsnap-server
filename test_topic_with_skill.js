const mongoose = require('mongoose');
require('dotenv').config();

// Import services
const topic_services = require('./services/topic_services');
const skills_services = require('./services/skills_services');

async function testTopicWithSkill() {
    console.log('🧪 Testing Create Topic with Skill...\n');
    
    try {
        // Connect to MongoDB
        const connection_string = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@skills.7yptkom.mongodb.net/?retryWrites=true&w=majority&appName=skills`;
        await mongoose.connect(connection_string);
        console.log('✅ Connected to MongoDB');
        
        // Test 1: Get existing skills
        console.log('\n1. Getting existing skills...');
        const skillsResult = await skills_services.get_all_skills();
        if (skillsResult.success && skillsResult.data.length > 0) {
            const skill = skillsResult.data[0];
            console.log(`✅ Found skill: ${skill.title}`);
            
            // Test 2: Create topic with skill
            console.log('\n2. Creating topic with skill...');
            const topicData = {
                name: 'Test Topic with Skill ' + Date.now(),
                description: 'Test topic created with skill association'
            };
            
            const createResult = await topic_services.create_topic_with_skill(topicData, skill._id);
            if (createResult.success) {
                console.log('✅ Topic created and associated with skill successfully');
                console.log(`   Topic ID: ${createResult.data.topic._id}`);
                console.log(`   Skill ID: ${createResult.data.skill._id}`);
                
                // Test 3: Verify topic is in skill
                console.log('\n3. Verifying topic is in skill...');
                const topicsInSkill = await topic_services.get_topics_by_skill(skill._id);
                if (topicsInSkill.success) {
                    console.log(`✅ Found ${topicsInSkill.data.length} topics in skill`);
                    const topicFound = topicsInSkill.data.find(t => t._id.toString() === createResult.data.topic._id.toString());
                    if (topicFound) {
                        console.log('✅ Topic successfully associated with skill');
                    } else {
                        console.log('❌ Topic not found in skill');
                    }
                } else {
                    console.log('❌ Failed to get topics by skill');
                }
                
                // Clean up
                console.log('\n4. Cleaning up test data...');
                await topic_services.delete_topic(createResult.data.topic._id);
                console.log('✅ Test data cleaned up');
                
            } else {
                console.log('❌ Failed to create topic with skill:', createResult.message);
            }
        } else {
            console.log('❌ No skills found, cannot test topic creation with skill');
        }
        
        console.log('\n🎉 Topic with skill test completed!');
        
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
testTopicWithSkill();
