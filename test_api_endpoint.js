const fetch = require('node-fetch').default;

const API_BASE = 'http://localhost:5000/api/v1';

async function testCreateTopicWithSkill() {
    console.log('🧪 Testing API Endpoint: Create Topic with Skill...\n');
    
    try {
        // Test 1: Get skills first
        console.log('1. Getting skills...');
        const skillsResponse = await fetch(`${API_BASE}/skills`);
        if (!skillsResponse.ok) {
            throw new Error(`Failed to get skills: ${skillsResponse.status}`);
        }
        
        const skillsData = await skillsResponse.json();
        if (!skillsData.success || skillsData.data.length === 0) {
            throw new Error('No skills available for testing');
        }
        
        const skill = skillsData.data[0];
        console.log(`✅ Found skill: ${skill.title} (ID: ${skill._id})`);
        
        // Test 2: Create topic with skill
        console.log('\n2. Creating topic with skill...');
        const topicData = {
            name: 'API Test Topic ' + Date.now(),
            description: 'Topic created via API test'
        };
        
        const createResponse = await fetch(`${API_BASE}/topics/skill/${skill._id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(topicData)
        });
        
        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Failed to create topic: ${createResponse.status} - ${errorText}`);
        }
        
        const createData = await createResponse.json();
        if (createData.success) {
            console.log('✅ Topic created successfully');
            console.log(`   Topic ID: ${createData.data.topic._id}`);
            console.log(`   Topic Name: ${createData.data.topic.name}`);
            console.log(`   Associated with Skill: ${createData.data.skill.title}`);
            
            // Test 3: Verify topic exists
            console.log('\n3. Verifying topic exists...');
            const topicResponse = await fetch(`${API_BASE}/topics/${createData.data.topic._id}`);
            if (topicResponse.ok) {
                const topicData = await topicResponse.json();
                if (topicData.success) {
                    console.log('✅ Topic retrieved successfully');
                } else {
                    console.log('❌ Failed to retrieve topic');
                }
            } else {
                console.log('❌ Failed to retrieve topic');
            }
            
            // Test 4: Verify topic is in skill
            console.log('\n4. Verifying topic is in skill...');
            const topicsInSkillResponse = await fetch(`${API_BASE}/topics/skill/${skill._id}`);
            if (topicsInSkillResponse.ok) {
                const topicsInSkillData = await topicsInSkillResponse.json();
                if (topicsInSkillData.success) {
                    const topicFound = topicsInSkillData.data.find(t => t._id === createData.data.topic._id);
                    if (topicFound) {
                        console.log('✅ Topic found in skill');
                    } else {
                        console.log('❌ Topic not found in skill');
                    }
                } else {
                    console.log('❌ Failed to get topics in skill');
                }
            } else {
                console.log('❌ Failed to get topics in skill');
            }
            
            // Clean up
            console.log('\n5. Cleaning up...');
            const deleteResponse = await fetch(`${API_BASE}/topics/${createData.data.topic._id}`, {
                method: 'DELETE'
            });
            if (deleteResponse.ok) {
                console.log('✅ Test topic deleted');
            } else {
                console.log('❌ Failed to delete test topic');
            }
            
        } else {
            console.log('❌ Failed to create topic:', createData.message);
        }
        
        console.log('\n🎉 API endpoint test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testCreateTopicWithSkill();
