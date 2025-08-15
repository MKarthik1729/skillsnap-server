const Skill = require('../schemas/skills_schema');

// Create a new skill
const create_skill = async (skill_data) => {
  try {
    const new_skill = new Skill(skill_data);
    const saved_skill = await new_skill.save();
    return {
      success: true,
      data: saved_skill,
      message: 'Skill created successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create skill'
    };
  }
};

// Get all skills
const get_all_skills = async () => {
  try {
    const skills = await Skill.find({ deleted_at: null }).sort({ created_at: -1 });
    return {
      success: true,
      data: skills,
      message: 'Skills retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve skills'
    };
  }
};

// Get skill by ID
const get_skill_by_id = async (skill_id) => {
  try {
    const skill = await Skill.findOne({ _id: skill_id, deleted_at: null });
    if (!skill) {
      return {
        success: false,
        message: 'Skill not found'
      };
    }
    return {
      success: true,
      data: skill,
      message: 'Skill retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve skill'
    };
  }
};

// Update skill by ID
const update_skill = async (skill_id, update_data) => {
  try {
    const updated_skill = await Skill.findOneAndUpdate(
      { _id: skill_id, deleted_at: null },
      { ...update_data, updated_at: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updated_skill) {
      return {
        success: false,
        message: 'Skill not found'
      };
    }
    
    return {
      success: true,
      data: updated_skill,
      message: 'Skill updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to update skill'
    };
  }
};

// Delete skill by ID
const delete_skill = async (skill_id) => {
  try {
    const deleted_skill = await Skill.findOneAndUpdate(
      { _id: skill_id, deleted_at: null },
      { deleted_at: new Date() },
      { new: true }
    );
    
    if (!deleted_skill) {
      return {
        success: false,
        message: 'Skill not found'
      };
    }
    
    return {
      success: true,
      data: deleted_skill,
      message: 'Skill deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to delete skill'
    };
  }
};

// Get skills by title (search)
const get_skills_by_title = async (title) => {
  try {
    const skills = await Skill.find({
      title: { $regex: title, $options: 'i' },
      deleted_at: null
    }).sort({ created_at: -1 });
    
    return {
      success: true,
      data: skills,
      message: 'Skills retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to search skills'
    };
  }
};

// Get skills with pagination
const get_skills_with_pagination = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const skills = await Skill.find({ deleted_at: null })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    const total_skills = await Skill.countDocuments({ deleted_at: null });
    const total_pages = Math.ceil(total_skills / limit);
    
    return {
      success: true,
      data: {
        skills,
        pagination: {
          current_page: page,
          total_pages,
          total_skills,
          has_next: page < total_pages,
          has_prev: page > 1
        }
      },
      message: 'Skills retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve skills'
    };
  }
};

module.exports = {
  create_skill,
  get_all_skills,
  get_skill_by_id,
  update_skill,
  delete_skill,
  get_skills_by_title,
  get_skills_with_pagination
};
