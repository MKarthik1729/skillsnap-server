const mongoose = require('mongoose');
const Code = require('../schemas/code_schema');

// Create a new code
const create_code = async (code_data) => {
  try {
    const new_code = new Code(code_data);
    const saved_code = await new_code.save();
    return {
      success: true,
      data: saved_code,
      message: 'Code created successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create code'
    };
  }
};

// Get all codes (excluding soft deleted ones)
const get_all_codes = async () => {
  try {
    const codes_list = await Code.find({ deleted_at: null }).sort({ created_at: -1 });
    return {
      success: true,
      data: codes_list,
      message: 'Codes retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve codes'
    };
  }
};

// Get code by ID
const get_code_by_id = async (code_id) => {
  try {
    const code = await Code.findOne({ _id: code_id, deleted_at: null });
    if (!code) {
      return {
        success: false,
        message: 'Code not found'
      };
    }
    return {
      success: true,
      data: code,
      message: 'Code retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve code'
    };
  }
};

// Update code by ID
const update_code = async (code_id, update_data) => {
  try {
    const updated_code = await Code.findOneAndUpdate(
      { _id: code_id, deleted_at: null },
      { ...update_data, updated_at: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updated_code) {
      return {
        success: false,
        message: 'Code not found'
      };
    }
    
    return {
      success: true,
      data: updated_code,
      message: 'Code updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to update code'
    };
  }
};

// Soft delete code by ID
const delete_code = async (code_id) => {
  try {
    const deleted_code = await Code.findOneAndUpdate(
      { _id: code_id, deleted_at: null },
      { deleted_at: new Date() },
      { new: true }
    );
    
    if (!deleted_code) {
      return {
        success: false,
        message: 'Code not found'
      };
    }
    
    return {
      success: true,
      data: deleted_code,
      message: 'Code deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to delete code'
    };
  }
};

// Hard delete code by ID (permanent deletion)
const hard_delete_code = async (code_id) => {
  try {
    const deleted_code = await Code.findByIdAndDelete(code_id);
    
    if (!deleted_code) {
      return {
        success: false,
        message: 'Code not found'
      };
    }
    
    return {
      success: true,
      data: deleted_code,
      message: 'Code permanently deleted'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to delete code'
    };
  }
};

// Get codes by description (search functionality)
const get_codes_by_description = async (description) => {
  try {
    const codes_list = await Code.find({
      description: { $regex: description, $options: 'i' },
      deleted_at: null
    }).sort({ created_at: -1 });
    
    return {
      success: true,
      data: codes_list,
      message: 'Codes retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to search codes'
    };
  }
};

// Get codes by language
const get_codes_by_language = async (language) => {
  try {
    const codes_list = await Code.find({
      language: { $regex: language, $options: 'i' },
      deleted_at: null
    }).sort({ created_at: -1 });
    
    return {
      success: true,
      data: codes_list,
      message: 'Codes retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to search codes by language'
    };
  }
};

// Get codes with pagination
const get_codes_with_pagination = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const codes_list = await Code.find({ deleted_at: null })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total_codes = await Code.countDocuments({ deleted_at: null });
    const total_pages = Math.ceil(total_codes / limit);
    
    return {
      success: true,
      data: {
        codes: codes_list,
        pagination: {
          current_page: page,
          total_pages,
          total_codes,
          has_next: page < total_pages,
          has_prev: page > 1
        }
      },
      message: 'Codes retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve codes'
    };
  }
};

// Restore soft deleted code
const restore_code = async (code_id) => {
  try {
    const restored_code = await Code.findOneAndUpdate(
      { _id: code_id, deleted_at: { $ne: null } },
      { deleted_at: null, updated_at: new Date() },
      { new: true }
    );
    
    if (!restored_code) {
      return {
        success: false,
        message: 'Code not found or not deleted'
      };
    }
    
    return {
      success: true,
      data: restored_code,
      message: 'Code restored successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to restore code'
    };
  }
};

// Get deleted codes
const get_deleted_codes = async () => {
  try {
    const deleted_codes = await Code.find({ deleted_at: { $ne: null } }).sort({ deleted_at: -1 });
    return {
      success: true,
      data: deleted_codes,
      message: 'Deleted codes retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve deleted codes'
    };
  }
};

// Get all unique languages
const get_all_languages = async () => {
  try {
    const languages = await Code.distinct('language', { deleted_at: null });
    return {
      success: true,
      data: languages,
      message: 'Languages retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve languages'
    };
  }
};

// Get codes by topic ID
const get_codes_by_topic_id = async (topic_id) => {
  try {
    const Topic = require('../schemas/topic_schema');
    
    // First, find the topic to get its codes array
    const topic = await Topic.findOne({ _id: topic_id, deleted_at: null });
    
    if (!topic) {
      return {
        success: false,
        message: 'Topic not found'
      };
    }
    
    // Get all codes that are referenced in the topic's codes array
    const codes_list = await Code.find({
      _id: { $in: topic.codes },
      deleted_at: null
    }).sort({ created_at: -1 });
    
    return {
      success: true,
      data: codes_list,
      message: 'Codes for topic retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve codes for topic'
    };
  }
};

module.exports = {
  create_code,
  get_all_codes,
  get_code_by_id,
  update_code,
  delete_code,
  hard_delete_code,
  get_codes_by_description,
  get_codes_by_language,
  get_codes_with_pagination,
  restore_code,
  get_deleted_codes,
  get_all_languages,
  get_codes_by_topic_id
};
