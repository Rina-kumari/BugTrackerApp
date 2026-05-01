Below are the Postman Apis for register, login and CRUD operations

1)	Register user - POST - http://localhost:5000/api-v1/auth/register
 Click on the "Headers" tab 
 Add: Content-Type: application/json
{
	  "name": "Test",
    "email": "test1@gmail.com",
    "role": "admin",
    "password": "1234567890"
}
2)	Login user – POST - http://localhost:5000/api-v1/auth/login
{
    	   "email": "test1@gmail.com",
    	   "password": "1234567890"
}
3)	Create project - POST - http://localhost:5000/api-v1/projects/
Need to pass Bearer token – token from login api
{
		“title”: “test project”,
		“description”: “test description”
}
4)	Get all projects – GET - http://localhost:5000/api-v1/projects/
Need to pass Bearer token – token from login api
5)	Get projectByID – GET - http://localhost:5000/api-v1/projects/:id
Need to pass Bearer token – token from login api
6)	Update project – PUT - http://localhost:5000/api-v1/projects/:id
Need to pass Bearer token – token from login api
{
“title”: “test project update”,
	   “description”: “test description update”
}
7)	Delete project – DELETE - http://localhost:5000/api-v1/projects/:id
Need to pass Bearer token – token from login api


Database is Postgresql and pgAdmin

1)	User table – 
 CREATE TABLE public.users (
 id SERIAL PRIMARY KEY,
 email VARCHAR(255) NOT NULL UNIQUE,
 password VARCHAR(255) NOT NULL,
 name VARCHAR(255) NOT NULL,
 last_login TIMESTAMP,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 role VARCHAR(50) DEFAULT 'user'
 );

2)	Project table – 
CREATE TABLE public.projects (
 id SERIAL PRIMARY KEY,
 title VARCHAR(255) NOT NULL,
 description TEXT,
 created_by INTEGER NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_projects_created_by
    FOREIGN KEY (created_by)
REFERENCES public.users(id)
ON DELETE CASCADE 
);

3)	Project_member table – 
CREATE TABLE public.project_members (
 id SERIAL PRIMARY KEY,
 project_id INTEGER NOT NULL,
 user_id INTEGER NOT NULL,
 role VARCHAR(50) DEFAULT 'member',
 joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_project_members_project
 		FOREIGN KEY (project_id)
 		REFERENCES public.projects(id)
 		ON DELETE CASCADE, 
CONSTRAINT fk_project_members_user
 	FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE,
   CONSTRAINT unique_project_user
 	UNIQUE (project_id, user_id)
 );






