import pool from '../config/db.js';
import {recordActivity} from "../libs/activityLogger.js"

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assignees } = req.body;

    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const memberResult = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, req.user.id]
    );

    if (memberResult.rows.length === 0) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const taskResult = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, project_id, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [title, description || null, status, priority, dueDate || null, projectId, req.user.id]
    );

    const newTask = taskResult.rows[0];

    if (assignees && assignees.length > 0) {
      const assigneeValues = assignees.map((userId, index) => 
        `($1, $${index + 2})`
      ).join(', ');
      
      await pool.query(
        `INSERT INTO task_assignees (task_id, user_id) VALUES ${assigneeValues}`,
        [newTask.id, ...assignees]
      );
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
  
    const taskResult = await pool.query(
      `SELECT t.*,
        u.id as creator_id,
        u.name as creator_name,
        u.email as creator_email,
        u.role as creator_role
       FROM tasks t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = $1`,
      [taskId]
    );
    
    const taskData = taskResult.rows[0];
    
    if (!taskData) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    
    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [taskData.project_id]);
    const project = projectResult.rows[0];
    
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }
    
    const assigneesResult = await pool.query(
      `SELECT u.id, u.name, u.email 
       FROM users u
       JOIN task_assignees ta ON u.id = ta.user_id
       WHERE ta.task_id = $1`,
      [taskId]
    );
    
    const subtasksResult = await pool.query(
      'SELECT * FROM subtasks WHERE task_id = $1 ORDER BY created_at ASC',
      [taskId]
    );
    
    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.email, pm.role, pm.joined_at
       FROM users u
       JOIN project_members pm ON u.id = pm.user_id
       WHERE pm.project_id = $1`,
      [project.id]
    );
    project.members = membersResult.rows;
    
    const task = {
      id: taskData.id,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      project_id: taskData.project_id,
      created_by: taskData.created_by,
      created_by_user: {
        id: taskData.creator_id,
        name: taskData.creator_name,
        email: taskData.creator_email,
        role: taskData.creator_role,
      },
      created_at: taskData.created_at,
      updated_at: taskData.updated_at,
      due_date: taskData.due_date,
      completed_at: taskData.completed_at,
      assignees: assigneesResult.rows,
      subtasks: subtasksResult.rows,
    };
    
    res.status(200).json({
      task,
      project
    });
  } catch (error) {
    console.error('Error in getTaskById:', error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

const updateTaskTitle = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;
    
    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [taskId]
    );
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    
    const task = taskResult.rows[0];
    
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [task.project_id]
    );
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }
    
    const project = projectResult.rows[0];
    
    const memberResult = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [project.id, req.user.id]
    );
    
    const isMember = memberResult.rows.length > 0;
    
    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }
    
    const oldTitle = task.title;
    
    const updatedTaskResult = await pool.query(
      'UPDATE tasks SET title = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [title, taskId]
    );
    
    const updatedTask = updatedTaskResult.rows[0];
    
    await recordActivity(req.user.id, "updated_task", "Task", taskId, {
      description: `updated task title from ${oldTitle} to ${title}`,
    });
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskDescription = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { description } = req.body;
    
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = taskResult.rows[0];
    
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    
    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [task.project_id]);
    const project = projectResult.rows[0];
    
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }
    
    const memberResult = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [project.id, req.user.id]
    );
    const isMember = memberResult.rows.length > 0;
    
    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }
    
    const oldDescription =
      task.description.substring(0, 50) +
      (task.description.length > 50 ? "..." : "");
    const newDescription =
      description.substring(0, 50) + (description.length > 50 ? "..." : "");
    
    const updatedTaskResult = await pool.query(
      'UPDATE tasks SET description = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [description, taskId]
    );
    const updatedTask = updatedTaskResult.rows[0];
    
    await recordActivity(req.user.id, "updated_task", "Task", taskId, {
      description: `updated task description from ${oldDescription} to ${newDescription}`,
    });
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = taskResult.rows[0];
    
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    
    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [task.project_id]);
    const project = projectResult.rows[0];
    
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }
    
    const memberResult = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [project.id, req.user.id]
    );
    const isMember = memberResult.rows.length > 0;
    
    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }
    
    const oldStatus = task.status;
    
    const updatedTaskResult = await pool.query(
      'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, taskId]
    );
    const updatedTask = updatedTaskResult.rows[0];
    
    await recordActivity(req.user.id, "updated_task", "Task", taskId, {
      description: `updated task status from ${oldStatus} to ${status}`,
    });
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskAssignees = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assignees } = req.body;
    
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = taskResult.rows[0];
    
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    
    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [task.project_id]);
    const project = projectResult.rows[0];
    
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }
    
    const memberResult = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [project.id, req.user.id]
    );
    const isMember = memberResult.rows.length > 0;
    
    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }
    
    const oldAssigneesResult = await pool.query(
      `SELECT u.name 
       FROM task_assignees ta
       INNER JOIN users u ON ta.user_id = u.id
       WHERE ta.task_id = $1`,
      [taskId]
    );
    const oldAssigneeNames = oldAssigneesResult.rows.map(row => row.name);
    
    await pool.query('DELETE FROM task_assignees WHERE task_id = $1', [taskId]);
    
    if (assignees && assignees.length > 0) {
      const values = assignees.map((userId, index) => 
        `($1, $${index + 2})`
      ).join(', ');
      
      await pool.query(
        `INSERT INTO task_assignees (task_id, user_id) VALUES ${values}`,
        [taskId, ...assignees]
      );
    }
    
    const newAssigneesResult = await pool.query(
      `SELECT u.name 
       FROM task_assignees ta
       INNER JOIN users u ON ta.user_id = u.id
       WHERE ta.task_id = $1`,
      [taskId]
    );
    const newAssigneeNames = newAssigneesResult.rows.map(row => row.name);
    
    const updatedTaskResult = await pool.query(
      'UPDATE tasks SET updated_at = NOW() WHERE id = $1 RETURNING *',
      [taskId]
    );
    const updatedTask = updatedTaskResult.rows[0];
    
    const oldAssigneesText = oldAssigneeNames.length > 0 
      ? oldAssigneeNames.join(', ') 
      : 'Unassigned';
    const newAssigneesText = newAssigneeNames.length > 0 
      ? newAssigneeNames.join(', ') 
      : 'Unassigned';
    
    await recordActivity(req.user.id, "updated_task", "Task", taskId, {
      description: `updated task assignees from ${oldAssigneesText} to ${newAssigneesText}`,
    });
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error in updateTaskAssignees:', error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskPriority = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { priority } = req.body;
    
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = taskResult.rows[0];
    
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    
    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [task.project_id]);
    const project = projectResult.rows[0];
    
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }
    
    const memberResult = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [project.id, req.user.id]
    );
    const isMember = memberResult.rows.length > 0;
    
    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }
    
    const oldPriority = task.priority;
    
    const updatedTaskResult = await pool.query(
      'UPDATE tasks SET priority = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [priority, taskId]
    );
    const updatedTask = updatedTaskResult.rows[0];
    
    await recordActivity(req.user.id, "updated_task", "Task", taskId, {
      description: `updated task priority from ${oldPriority} to ${priority}`,
    });
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addSubTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;
    
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = taskResult.rows[0];
    
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    
    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [task.project_id]);
    const project = projectResult.rows[0];
    
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }
    
    const memberResult = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [project.id, req.user.id]
    );
    const isMember = memberResult.rows.length > 0;
    
    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }
    
    const newSubTaskResult = await pool.query(
      'INSERT INTO subtasks (task_id, title, completed) VALUES ($1, $2, $3) RETURNING *',
      [taskId, title.trim(), false]
    );
    const newSubTask = newSubTaskResult.rows[0];
    
    await pool.query('UPDATE tasks SET updated_at = NOW() WHERE id = $1', [taskId]);
    
    const updatedTaskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const updatedTask = updatedTaskResult.rows[0];
  
    const subtasksResult = await pool.query(
      'SELECT * FROM subtasks WHERE task_id = $1 ORDER BY created_at ASC',
      [taskId]
    );
    updatedTask.subtasks = subtasksResult.rows;
    
    await recordActivity(req.user.id, "created_subtask", "Task", taskId, {
      description: `created subtask ${title}`,
    });
    
    res.status(201).json(updatedTask);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateSubTask = async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { completed } = req.body;
    
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = taskResult.rows[0];
    
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    
    const subTaskResult = await pool.query('SELECT * FROM subtasks WHERE id = $1 AND task_id = $2', [subTaskId, taskId]);
    const subTask = subTaskResult.rows[0];
    
    if (!subTask) {
      return res.status(404).json({
        message: "Subtask not found",
      });
    }
    
    await pool.query(
      'UPDATE subtasks SET completed = $1, updated_at = NOW() WHERE id = $2',
      [completed, subTaskId]
    );
    
    await pool.query('UPDATE tasks SET updated_at = NOW() WHERE id = $1', [taskId]);
    
    const updatedTaskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const updatedTask = updatedTaskResult.rows[0];
    
    const subtasksResult = await pool.query(
      'SELECT * FROM subtasks WHERE task_id = $1 ORDER BY created_at ASC',
      [taskId]
    );
    updatedTask.subtasks = subtasksResult.rows;
    
    await recordActivity(req.user.id, "updated_subtask", "Task", taskId, {
      description: `updated subtask ${subTask.title}`,
    });
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getActivityByResourceId = async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    const activityResult = await pool.query(
      `SELECT a.id, a.user_id, a.action, a.entity_type, a.entity_id, 
              COALESCE(a.description, a.metadata->>'description') as description,
              a.metadata, a.created_at,
              json_build_object('name', u.name) as user
       FROM activities a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.entity_id = $1
       ORDER BY a.created_at DESC`,
      [resourceId]
    );
    
    const activity = activityResult.rows;
    
    res.status(200).json(activity);
  } catch (error) {
    console.error('Error in getActivityByResourceId:', error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};


const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = taskResult.rows[0];

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [task.project_id]);
    const project = projectResult.rows[0];

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const memberResult = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [project.id, req.user.id]
    );
    const isMember = memberResult.rows.length > 0;

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const newCommentResult = await pool.query(
      'INSERT INTO comments (text, task_id, author_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [text, taskId, req.user.id]
    );
    const newComment = newCommentResult.rows[0];

    await pool.query('UPDATE tasks SET updated_at = NOW() WHERE id = $1', [taskId]);

    await recordActivity(req.user.id, "added_comment", "Task", taskId, {
      description: `added comment ${
        text.substring(0, 50) + (text.length > 50 ? "..." : "")
      }`,
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getCommentsByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;

    const commentsResult = await pool.query(
      `SELECT c.id, c.text, c.task_id, c.author_id, c.created_at,
              json_build_object('id', u.id, 'name', u.name) as author
       FROM comments c
       LEFT JOIN users u ON c.author_id = u.id
       WHERE c.task_id = $1
       ORDER BY c.created_at DESC`,
      [taskId]
    );
    
    const comments = commentsResult.rows;

    res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    console.log('Deleting task:', taskId);
    
    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [taskId]
    );
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    
    const task = taskResult.rows[0];
    
    if (task.created_by !== req.user.id) {
      return res.status(403).json({
        message: "Only the task creator can delete this task",
      });
    }
    
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [task.project_id]
    );
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }
    
    const project = projectResult.rows[0];
    
    await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
    
    await recordActivity(req.user.id, "deleted_task", "Task", taskId, {
      description: `deleted task "${task.title}"`,
    });
    
    res.status(200).json({
      message: "Task deleted successfully",
      taskId: taskId,
      projectId: project.id
    });
  } catch (error) {
    console.error('Error in deleteTask:', error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

export {createTask, getTaskById, updateTaskTitle, updateTaskDescription, updateTaskStatus,updateTaskAssignees, updateTaskPriority, addSubTask,updateSubTask,getActivityByResourceId,addComment,getCommentsByTaskId,deleteTask};