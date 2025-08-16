const mongoose = require('mongoose');
const PageData = require('../schemas/page_data_schema');

// Create a new page data
const create_page_data = async (page_data) => {
  try {
    const new_page_data = new PageData(page_data);
    const saved_page_data = await new_page_data.save();
    return {
      success: true,
      data: saved_page_data,
      message: 'Page data created successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create page data'
    };
  }
};

// Get all page data (excluding soft deleted ones)
const get_all_page_data = async () => {
  try {
    const page_data_list = await PageData.find({ deleted_at: null }).sort({ created_at: -1 });
    return {
      success: true,
      data: page_data_list,
      message: 'Page data retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve page data'
    };
  }
};

// Get page data by ID
const get_page_data_by_id = async (page_data_id) => {
  try {
    const page_data = await PageData.findOne({ _id: page_data_id, deleted_at: null });
    if (!page_data) {
      return {
        success: false,
        message: 'Page data not found'
      };
    }
    return {
      success: true,
      data: page_data,
      message: 'Page data retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve page data'
    };
  }
};

// Update page data by ID
const update_page_data = async (page_data_id, update_data) => {
  try {
    const updated_page_data = await PageData.findOneAndUpdate(
      { _id: page_data_id, deleted_at: null },
      { ...update_data, updated_at: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updated_page_data) {
      return {
        success: false,
        message: 'Page data not found'
      };
    }
    
    return {
      success: true,
      data: updated_page_data,
      message: 'Page data updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to update page data'
    };
  }
};

// Soft delete page data by ID
const delete_page_data = async (page_data_id) => {
  try {
    const deleted_page_data = await PageData.findOneAndUpdate(
      { _id: page_data_id, deleted_at: null },
      { deleted_at: new Date() },
      { new: true }
    );
    
    if (!deleted_page_data) {
      return {
        success: false,
        message: 'Page data not found'
      };
    }
    
    return {
      success: true,
      data: deleted_page_data,
      message: 'Page data deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to delete page data'
    };
  }
};

// Hard delete page data by ID (permanent deletion)
const hard_delete_page_data = async (page_data_id) => {
  try {
    const deleted_page_data = await PageData.findByIdAndDelete(page_data_id);
    
    if (!deleted_page_data) {
      return {
        success: false,
        message: 'Page data not found'
      };
    }
    
    return {
      success: true,
      data: deleted_page_data,
      message: 'Page data permanently deleted'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to delete page data'
    };
  }
};

// Get page data by title (search functionality)
const get_page_data_by_title = async (title) => {
  try {
    const page_data_list = await PageData.find({
      title: { $regex: title, $options: 'i' },
      deleted_at: null
    }).sort({ created_at: -1 });
    
    return {
      success: true,
      data: page_data_list,
      message: 'Page data retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to search page data'
    };
  }
};

// Get page data with pagination
const get_page_data_with_pagination = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const page_data_list = await PageData.find({ deleted_at: null })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total_page_data = await PageData.countDocuments({ deleted_at: null });
    const total_pages = Math.ceil(total_page_data / limit);
    
    return {
      success: true,
      data: {
        page_data: page_data_list,
        pagination: {
          current_page: page,
          total_pages,
          total_page_data,
          has_next: page < total_pages,
          has_prev: page > 1
        }
      },
      message: 'Page data retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve page data'
    };
  }
};

// Restore soft deleted page data
const restore_page_data = async (page_data_id) => {
  try {
    const restored_page_data = await PageData.findOneAndUpdate(
      { _id: page_data_id, deleted_at: { $ne: null } },
      { deleted_at: null, updated_at: new Date() },
      { new: true }
    );
    
    if (!restored_page_data) {
      return {
        success: false,
        message: 'Page data not found or not deleted'
      };
    }
    
    return {
      success: true,
      data: restored_page_data,
      message: 'Page data restored successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to restore page data'
    };
  }
};

// Get deleted page data
const get_deleted_page_data = async () => {
  try {
    const deleted_page_data = await PageData.find({ deleted_at: { $ne: null } }).sort({ deleted_at: -1 });
    return {
      success: true,
      data: deleted_page_data,
      message: 'Deleted page data retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve deleted page data'
    };
  }
};

// Add content to page data
const add_content_to_page_data = async (page_data_id, content) => {
  try {
    const updated_page_data = await PageData.findOneAndUpdate(
      { _id: page_data_id, deleted_at: null },
      { 
        $push: { content: content },
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!updated_page_data) {
      return {
        success: false,
        message: 'Page data not found'
      };
    }
    
    return {
      success: true,
      data: updated_page_data,
      message: 'Content added to page data successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to add content to page data'
    };
  }
};

// Remove content from page data
const remove_content_from_page_data = async (page_data_id, content_index) => {
  try {
    const page_data = await PageData.findOne({ _id: page_data_id, deleted_at: null });
    
    if (!page_data) {
      return {
        success: false,
        message: 'Page data not found'
      };
    }
    
    if (content_index < 0 || content_index >= page_data.content.length) {
      return {
        success: false,
        message: 'Invalid content index'
      };
    }
    
    page_data.content.splice(content_index, 1);
    page_data.updated_at = new Date();
    const updated_page_data = await page_data.save();
    
    return {
      success: true,
      data: updated_page_data,
      message: 'Content removed from page data successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to remove content from page data'
    };
  }
};

module.exports = {
  create_page_data,
  get_all_page_data,
  get_page_data_by_id,
  update_page_data,
  delete_page_data,
  hard_delete_page_data,
  get_page_data_by_title,
  get_page_data_with_pagination,
  restore_page_data,
  get_deleted_page_data,
  add_content_to_page_data,
  remove_content_from_page_data
};
