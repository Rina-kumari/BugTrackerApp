import pool from '../config/db.js';

const createProject = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { title, description, members } = req.body;
    const userId = req.user.id;
    
    await client.query('BEGIN');
    
    const projectResult = await client.query(
      `INSERT INTO projects (title, description, created_by, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING *`,
      [title, description, userId]
    );
    
    const project = projectResult.rows[0];
    
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role, joined_at) 
       VALUES ($1, $2, $3, NOW())`,
      [project.id, userId, 'admin']
    );
    
    if (members && members.length > 0) {
      for (const member of members) {
  
        if (member.userId !== userId) {
          await client.query(
            `INSERT INTO project_members (project_id, user_id, role, joined_at) 
             VALUES ($1, $2, $3, NOW())`,
            [project.id, member.userId, member.role]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      id: project.id,
      title: project.title,
      description: project.description,
      created_at: project.created_at,
      updated_at: project.updated_at
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};

const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const projectsResult = await pool.query(
      `SELECT 
        p.id,
        p.title,
        p.description,
        p.created_by,
        p.created_at,
        p.updated_at,
        pm.role as user_role
       FROM projects p
       INNER JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );
    
    const projects = projectsResult.rows;
    
    if (projects.length === 0) {
      return res.status(200).json([]);
    }
    
    const projectIds = projects.map(p => p.id);
    
    const creatorIds = [...new Set(projects.map(p => p.created_by))];
    const creatorsResult = await pool.query(
      `SELECT id, name, email, role  -- ✅ Add role here
       FROM users
       WHERE id = ANY($1)`,
      [creatorIds]
    );
    
    const membersResult = await pool.query(
      `SELECT 
        pm.project_id,
        pm.user_id,
        pm.role,
        u.name,
        u.email
       FROM project_members pm
       INNER JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ANY($1)`,
      [projectIds]
    );
    
    const taskCountsResult = await pool.query(
      `SELECT 
        project_id,
        COUNT(*) as task_count
       FROM tasks
       WHERE project_id = ANY($1)
       GROUP BY project_id`,
      [projectIds]
    );
    
    const creatorsMap = {};
    creatorsResult.rows.forEach(creator => {
      creatorsMap[creator.id] = creator;
    });
    
    const membersByProject = {};
    membersResult.rows.forEach(member => {
      if (!membersByProject[member.project_id]) {
        membersByProject[member.project_id] = [];
      }
      membersByProject[member.project_id].push({
        user_id: member.user_id,
        name: member.name,
        email: member.email,
        role: member.role
      });
    });
    
    const taskCountsByProject = {};
    taskCountsResult.rows.forEach(row => {
      taskCountsByProject[row.project_id] = parseInt(row.task_count);
    });
    
    const result = projects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      created_by: project.created_by,
      created_at: project.created_at,
      updated_at: project.updated_at,
      user_role: project.user_role,
      task_count: taskCountsByProject[project.id] || 0,
      created_by_user: creatorsMap[project.created_by] || null,
      members: membersByProject[project.id] || []
    }));
    
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Error in getProjects:', error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const projectResult = await pool.query(
      `SELECT 
        p.id,
        p.title,
        p.description,
        p.created_by,
        p.created_at,
        p.updated_at,
        pm.role as user_role
       FROM projects p
       INNER JOIN project_members pm ON p.id = pm.project_id
       WHERE p.id = $1 AND pm.user_id = $2`,
      [id, userId]
    );
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const project = projectResult.rows[0];
    
    const membersResult = await pool.query(
      `SELECT 
        pm.user_id,
        pm.role,
        pm.joined_at,
        u.name,
        u.email
       FROM project_members pm
       INNER JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1`,
      [id]
    );
    
    const tasksResult = await pool.query(
      `SELECT 
        id,
        title,
        status,
        priority
       FROM tasks
       WHERE project_id = $1`,
      [id]
    );
    
    const result = {
      id: project.id,
      title: project.title,
      description: project.description,
      created_by: project.created_by,
      created_at: project.created_at,
      updated_at: project.updated_at,
      user_role: project.user_role,
      members: membersResult.rows,
      tasks: tasksResult.rows
    };
    
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Error in getProjectById:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateProject = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { title, description, members } = req.body;
    const userId = req.user.id;
    
    await client.query('BEGIN');
    
    const projectCheck = await client.query(
      'SELECT created_by FROM projects WHERE id = $1',
      [id]
    );
    
    if (projectCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (projectCheck.rows[0].created_by !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: "Only the project creator can edit this project" });
    }
    
    const creatorId = projectCheck.rows[0].created_by;
    
    const updateResult = await client.query(
      `UPDATE projects 
       SET title = $1, description = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [title, description, id]
    );
    
    const project = updateResult.rows[0];
    
    if (members && members.length > 0) {
    
      await client.query(
        `DELETE FROM project_members 
         WHERE project_id = $1 AND user_id != $2`,
        [id, creatorId]
      );
      
      for (const member of members) {
        await client.query(
          `INSERT INTO project_members (project_id, user_id, role, joined_at) 
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (project_id, user_id) 
           DO UPDATE SET role = EXCLUDED.role`,
          [id, member.userId, member.role]
        );
      }
    }
    
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role, joined_at) 
       VALUES ($1, $2, 'admin', NOW())
       ON CONFLICT (project_id, user_id) 
       DO UPDATE SET role = 'admin'`,
      [id, creatorId]
    );
    
    await client.query('COMMIT');
    
    res.status(200).json(project);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in updateProject:', error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const projectCheck = await pool.query(
      'SELECT created_by FROM projects WHERE id = $1',
      [id]
    );
    
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    if (projectCheck.rows[0].created_by !== userId) {
      return res.status(403).json({ message: "Only the project creator can delete this project" });
    }
    
    await pool.query(
      'DELETE FROM projects WHERE id = $1',
      [id]
    );
    
    res.status(200).json({ message: "Project deleted successfully" });
    
  } catch (error) {
    console.error('Error in deleteProject:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const memberCheck = await pool.query(
      'SELECT user_id FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const membersResult = await pool.query(
      `SELECT 
        pm.user_id,
        pm.role,
        u.name,
        u.email
       FROM project_members pm
       INNER JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1`,
      [id]
    );

    const tasksResult = await pool.query(
      `SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.created_at,
        t.updated_at,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'id', u.id,
              'name', u.name
            )
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'
        ) as assignees
       FROM tasks t
       LEFT JOIN task_assignees ta ON t.id = ta.task_id
       LEFT JOIN users u ON ta.user_id = u.id
       WHERE t.project_id = $1
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      [id]
    );

    res.status(200).json({
      project: {
        ...projectResult.rows[0],
        members: membersResult.rows
      },
      tasks: tasksResult.rows,
    });
    
  } catch (error) {
    console.error('Error in getProjectTasks:', error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAllProjectsStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const userProjectsResult = await pool.query(
      `SELECT p.*, 
              json_agg(
                json_build_object(
                  'id', t.id,
                  'title', t.title,
                  'status', t.status,
                  'due_date', t.due_date,
                  'project_id', t.project_id,
                  'updated_at', t.updated_at,
                  'priority', t.priority
                )
              ) FILTER (WHERE t.id IS NOT NULL) as tasks
       FROM projects p
       INNER JOIN project_members pm ON p.id = pm.project_id
       LEFT JOIN tasks t ON p.id = t.project_id
       WHERE pm.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId]
    );
    const projects = userProjectsResult.rows;

    const totalProjects = projects.length;

    const tasks = projects.flatMap((project) => project.tasks || []);

    const totalTasks = tasks.length;

    const totalProjectInProgress = projects.filter(
      (project) => project.status === "In Progress"
    ).length;

    const totalTaskDone = tasks.filter((task) => task.status === "Done").length;
    const totalTaskToDo = tasks.filter((task) => task.status === "To Do").length;
    const totalTaskTesting = tasks.filter((task) => task.status === "Testing").length;
    const totalTaskInProgress = tasks.filter((task) => task.status === "In Progress").length;

    const upcomingTasks = tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      const today = new Date();
      return (
        taskDate > today &&
        taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
    });

    const taskTrendsData = [
      { name: "Sun", completed: 0, inProgress: 0, toDo: 0, testing: 0 },
      { name: "Mon", completed: 0, inProgress: 0, toDo: 0, testing: 0 },
      { name: "Tue", completed: 0, inProgress: 0, toDo: 0, testing: 0 },
      { name: "Wed", completed: 0, inProgress: 0, toDo: 0, testing: 0 },
      { name: "Thu", completed: 0, inProgress: 0, toDo: 0, testing: 0 },
      { name: "Fri", completed: 0, inProgress: 0, toDo: 0, testing: 0 },
      { name: "Sat", completed: 0, inProgress: 0, toDo: 0, testing: 0 },
    ];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    for (const task of tasks) {
      if (!task.updated_at) continue;
      
      const taskDate = new Date(task.updated_at);
      const dayInDate = last7Days.findIndex(
        (date) =>
          date.getDate() === taskDate.getDate() &&
          date.getMonth() === taskDate.getMonth() &&
          date.getFullYear() === taskDate.getFullYear()
      );

      if (dayInDate !== -1) {
        const dayName = last7Days[dayInDate].toLocaleDateString("en-US", {
          weekday: "short",
        });

        const dayData = taskTrendsData.find((day) => day.name === dayName);

        if (dayData) {
          switch (task.status) {
            case "Done":
              dayData.completed++;
              break;
            case "In Progress":
              dayData.inProgress++;
              break;
            case "To Do":
              dayData.toDo++;
              break;
            case "Testing":
              dayData.testing++;
              break;
          }
        }
      }
    }

    const taskStatusData = [
      { name: "To Do", value: totalTaskToDo, color: "#6b7280" },
      { name: "In Progress", value: totalTaskInProgress, color: "#3b82f6" },
      { name: "Testing", value: totalTaskTesting, color: "#f59e0b" },
      { name: "Done", value: totalTaskDone, color: "#10b981" },
    ];

    const taskPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];

    for (const task of tasks) {
      switch (task.priority) {
        case "High":
          taskPriorityData[0].value++;
          break;
        case "Medium":
          taskPriorityData[1].value++;
          break;
        case "Low":
          taskPriorityData[2].value++;
          break;
      }
    }

    const stats = {
      totalProjects,
      totalTasks,
      totalProjectInProgress,
      totalTaskDone,
      totalTaskToDo,
      totalTaskInProgress,
      totalTaskTesting,
    };

    res.status(200).json({
      stats,
      taskTrendsData,
      taskStatusData, 
      taskPriorityData,
      upcomingTasks,
      recentProjects: projects.slice(0, 5),
    });
  } catch (error) {
    console.error('Error in getAllProjectsStats:', error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

export const getProjectStats = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    const project = projectResult.rows[0];

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const memberResult = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [project.id, userId]
    );
    const isMember = memberResult.rows.length > 0;

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const projectsResult = await pool.query(
      `SELECT p.*, 
              json_agg(
                json_build_object(
                  'id', t.id,
                  'title', t.title,
                  'status', t.status,
                  'due_date', t.due_date,
                  'project_id', t.project_id,
                  'updated_at', t.updated_at,
                  'priority', t.priority
                )
              ) FILTER (WHERE t.id IS NOT NULL) as tasks
       FROM projects p
       LEFT JOIN tasks t ON p.id = t.project_id
       WHERE p.id = $1
       GROUP BY p.id`,
      [id]
    );
    const projects = projectsResult.rows;

    const tasks = projects.flatMap((project) => project.tasks || []);

    const totalTasks = tasks.length;

    const totalProjects = 1;

    const totalProjectInProgress = project.status === "In Progress" ? 1 : 0;

    const totalTaskDone = tasks.filter((task) => task.status === "Done").length;
    const totalTaskToDo = tasks.filter((task) => task.status === "To Do").length;
    const totalTaskTesting = tasks.filter((task) => task.status === "Testing").length;
    const totalTaskInProgress = tasks.filter((task) => task.status === "In Progress").length;

    const upcomingTasks = tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      const today = new Date();
      return (
        taskDate > today &&
        taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
    });

    const taskTrendsData = [
      { name: "Sun", completed: 0, inProgress: 0, toDo: 0, testing: 0 },
      { name: "Mon", completed: 0, inProgress: 0, toDo: 0, testing: 0 },
      { name: "Tue", completed: 0, inProgress: 0, toDo: 0, testing: 0 },
      { name: "Wed", completed: 0, inProgress: 0, toDo: 0, testing: 0 },
      { name: "Thu", completed: 0, inProgress: 0, toDo: 0, testing: 0 },
      { name: "Fri", completed: 0, inProgress: 0, toDo: 0, testing: 0 },
      { name: "Sat", completed: 0, inProgress: 0, toDo: 0, testing: 0 },
    ];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    for (const task of tasks) {
      if (!task.updated_at) continue;
      
      const taskDate = new Date(task.updated_at);
      const dayInDate = last7Days.findIndex(
        (date) =>
          date.getDate() === taskDate.getDate() &&
          date.getMonth() === taskDate.getMonth() &&
          date.getFullYear() === taskDate.getFullYear()
      );

      if (dayInDate !== -1) {
        const dayName = last7Days[dayInDate].toLocaleDateString("en-US", {
          weekday: "short",
        });

        const dayData = taskTrendsData.find((day) => day.name === dayName);

        if (dayData) {
          switch (task.status) {
            case "Done":
              dayData.completed++;
              break;
            case "In Progress":
              dayData.inProgress++;
              break;
            case "To Do":
              dayData.toDo++;
              break;
            case "Testing":
              dayData.testing++;
              break;
          }
        }
      }
    }

    const taskStatusData = [
      { name: "To Do", value: totalTaskToDo, color: "#6b7280" },
      { name: "In Progress", value: totalTaskInProgress, color: "#3b82f6" },
      { name: "Testing", value: totalTaskTesting, color: "#f59e0b" },
      { name: "Done", value: totalTaskDone, color: "#10b981" },
    ];

    const taskPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];

    for (const task of tasks) {
      switch (task.priority) {
        case "High":
          taskPriorityData[0].value++;
          break;
        case "Medium":
          taskPriorityData[1].value++;
          break;
        case "Low":
          taskPriorityData[2].value++;
          break;
      }
    }

    const stats = {
      totalProjects,
      totalTasks,
      totalProjectInProgress,
      totalTaskDone,
      totalTaskToDo,
      totalTaskInProgress,
      totalTaskTesting,
    };

    res.status(200).json({
      stats,
      taskTrendsData,
      taskStatusData,
      taskPriorityData,
      upcomingTasks,
      recentProjects: projects,
    });
  } catch (error) {
    console.error('Error in getProjectStats:', error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

export { 
  createProject, 
  getProjects, 
  getProjectById,
  updateProject,
  deleteProject,
  getProjectTasks,
};