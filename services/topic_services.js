const mongoose = require('mongoose');
const Topic = require('../schemas/topic_schema');
const Skill = require('../schemas/skills_schema');
const page_data_services = require('./page_data_services');
const code_services = require('./code_services');

// Create a new topic
const create_topic = async (topic_data) => {
  try {
    const new_topic = new Topic(topic_data);
    const saved_topic = await new_topic.save();
    return {
      success: true,
      data: saved_topic,
      message: 'Topic created successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create topic'
    };
  }
};

// Create a topic and associate it with a skill
const create_topic_with_skill = async (topic_data, skill_id) => {
  try {
    // Create the topic
    const new_topic = new Topic(topic_data);
    const saved_topic = await new_topic.save();
    
    // Add the topic to the specified skill
    const updated_skill = await Skill.findOneAndUpdate(
      { _id: skill_id, deleted_at: null },
      { 
        $push: { topics: saved_topic._id },
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!updated_skill) {
      // If skill not found, delete the created topic and return error
      await Topic.findByIdAndDelete(saved_topic._id);
      return {
        success: false,
        message: 'Skill not found'
      };
    }
    
    return {
      success: true,
      data: {
        topic: saved_topic,
        skill: updated_skill
      },
      message: 'Topic created and added to skill successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create topic'
    };
  }
};

// Get all topics
const get_all_topics = async () => {
  try {
    const topics = await Topic.find({ deleted_at: null }).sort({ created_at: -1 });
    return {
      success: true,
      data: topics,
      message: 'Topics retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve topics'
    };
  }
};

// Get topic by ID
const get_topic_by_id = async (topic_id) => {
  try {
    const topic = await Topic.findOne({ _id: topic_id, deleted_at: null });
    if (!topic) {
      return {
        success: false,
        message: 'Topic not found'
      };
    }
    return {
      success: true,
      data: topic,
      message: 'Topic retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve topic'
    };
  }
};

// Update topic by ID
const update_topic = async (topic_id, update_data) => {
  try {
    const updated_topic = await Topic.findOneAndUpdate(
      { _id: topic_id, deleted_at: null },
      { ...update_data, updated_at: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updated_topic) {
      return {
        success: false,
        message: 'Topic not found'
      };
    }
    
    return {
      success: true,
      data: updated_topic,
      message: 'Topic updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to update topic'
    };
  }
};

// Delete topic by ID
const delete_topic = async (topic_id) => {
  try {
    const deleted_topic = await Topic.findOneAndUpdate(
      { _id: topic_id, deleted_at: null },
      { deleted_at: new Date() },
      { new: true }
    );
    
    if (!deleted_topic) {
      return {
        success: false,
        message: 'Topic not found'
      };
    }
    
    return {
      success: true,
      data: deleted_topic,
      message: 'Topic deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to delete topic'
    };
  }
};

// Get topics by name (search)
const get_topics_by_name = async (name) => {
  try {
    const topics = await Topic.find({
      name: { $regex: name, $options: 'i' },
      deleted_at: null
    }).sort({ created_at: -1 });
    
    return {
      success: true,
      data: topics,
      message: 'Topics retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to search topics'
    };
  }
};

// Get topics with pagination
const get_topics_with_pagination = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const topics = await Topic.find({ deleted_at: null })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total_topics = await Topic.countDocuments({ deleted_at: null });
    const total_pages = Math.ceil(total_topics / limit);
    
    return {
      success: true,
      data: {
        topics,
        pagination: {
          current_page: page,
          total_pages,
          total_topics,
          has_next: page < total_pages,
          has_prev: page > 1
        }
      },
      message: 'Topics retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve topics'
    };
  }
};

// Get topics by skill ID
const get_topics_by_skill = async (skill_id) => {
  try {
    const skill = await Skill.findOne({ _id: skill_id, deleted_at: null }).populate('topics');
    
    if (!skill) {
      return {
        success: false,
        message: 'Skill not found'
      };
    }
    
    return {
      success: true,
      data: skill.topics,
      message: 'Topics retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve topics for skill'
    };
  }
};

// Add page data to topic
const add_page_data_to_topic = async (topic_id, page_data) => {
  try {
    const page_data_result = await page_data_services.create_page_data(page_data);
    
    if (!page_data_result.success) {
      return page_data_result;
    }
    
    const updated_topic = await Topic.findOneAndUpdate(
      { _id: topic_id, deleted_at: null },
      { 
        $push: { page_data: page_data_result.data._id },
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!updated_topic) {
      await page_data_services.hard_delete_page_data(page_data_result.data._id);
      return {
        success: false,
        message: 'Topic not found'
      };
    }
    
    return {
      success: true,
      data: {
        page_data: page_data_result.data,
        topic: updated_topic
      },
      message: 'Page data added to topic successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to add page data to topic'
    };
  }
};

// Add code to topic
const add_code_to_topic = async (topic_id, code_data) => {
  try {
    const code_result = await code_services.create_code(code_data);
    
    if (!code_result.success) {
      return code_result;
    }
    
    const updated_topic = await Topic.findOneAndUpdate(
      { _id: topic_id, deleted_at: null },
      { 
        $push: { codes: code_result.data._id },
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!updated_topic) {
      await code_services.hard_delete_code(code_result.data._id);
      return {
        success: false,
        message: 'Topic not found'
      };
    }
    
    return {
      success: true,
      data: {
        code: code_result.data,
        topic: updated_topic
      },
      message: 'Code added to topic successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to add code to topic'
    };
  }
};

// Add existing page data to topic
const add_existing_page_data_to_topic = async (topic_id, page_data_id) => {
  try {
    // Check if page data exists
    const page_data = await page_data_services.get_page_data_by_id(page_data_id);
    if (!page_data.success) {
      return {
        success: false,
        message: 'Page data not found'
      };
    }
    
    // Check if topic exists
    const topic = await Topic.findOne({ _id: topic_id, deleted_at: null });
    if (!topic) {
      return {
        success: false,
        message: 'Topic not found'
      };
    }
    
    // Check if page data is already in topic
    if (topic.page_data.includes(page_data_id)) {
      return {
        success: false,
        message: 'Page data is already in this topic'
      };
    }
    
    // Add page data to topic
    const updated_topic = await Topic.findOneAndUpdate(
      { _id: topic_id, deleted_at: null },
      { 
        $push: { page_data: page_data_id },
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );
    
    return {
      success: true,
      data: {
        page_data: page_data.data,
        topic: updated_topic
      },
      message: 'Page data added to topic successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to add page data to topic'
    };
  }
};

// Add existing code to topic
const add_existing_code_to_topic = async (topic_id, code_id) => {
  try {
    // Check if code exists
    const code = await code_services.get_code_by_id(code_id);
    if (!code.success) {
      return {
        success: false,
        message: 'Code not found'
      };
    }
    
    // Check if topic exists
    const topic = await Topic.findOne({ _id: topic_id, deleted_at: null });
    if (!topic) {
      return {
        success: false,
        message: 'Topic not found'
      };
    }
    
    // Check if code is already in topic
    if (topic.codes.includes(code_id)) {
      return {
        success: false,
        message: 'Code is already in this topic'
      };
    }
    
    // Add code to topic
    const updated_topic = await Topic.findOneAndUpdate(
      { _id: topic_id, deleted_at: null },
      { 
        $push: { codes: code_id },
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );
    
    return {
      success: true,
      data: {
        code: code.data,
        topic: updated_topic
      },
      message: 'Code added to topic successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to add code to topic'
    };
  }
};

module.exports = {
  create_topic,
  create_topic_with_skill,
  get_all_topics,
  get_topic_by_id,
  update_topic,
  delete_topic,
  get_topics_by_name,
  get_topics_with_pagination,
  get_topics_by_skill,
  add_page_data_to_topic,
  add_code_to_topic,
  add_existing_page_data_to_topic,
  add_existing_code_to_topic
};
