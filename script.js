 // --- Utility Functions ---
        function generateUniqueId() {
            return 'id-' + Math.random().toString(36).substr(2, 9);
        }

        // --- Advancement Tracker Functions ---
        function updateAdvancementProgress(advancementId) {
            const advancementElement = document.querySelector(`[data-advancement="${advancementId}"]`);
            if (!advancementElement) return;

            const checkboxes = advancementElement.querySelectorAll('input[type="checkbox"]');
            let completedParts = 0;
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    completedParts++;
                }
            });

            const totalParts = checkboxes.length;
            const percentage = totalParts > 0 ? Math.round((completedParts / totalParts) * 100) : 0;

            const progressBar = advancementElement.querySelector(`#${advancementId}-bar`);
            const progressText = advancementElement.querySelector(`#${advancementId}-progress`);

            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
                progressBar.textContent = `${percentage}%`;
            }
            if (progressText) {
                progressText.textContent = `${percentage}%`;
            }

            saveAdvancementState(advancementId);
        }

        function saveAdvancementState(advancementId) {
            const advancementElement = document.querySelector(`[data-advancement="${advancementId}"]`);
            if (!advancementElement) return;

            const checkboxes = advancementElement.querySelectorAll('input[type="checkbox"]');
            const state = {};
            checkboxes.forEach(checkbox => {
                state[checkbox.dataset.part] = checkbox.checked;
            });
            localStorage.setItem(`advancement-${advancementId}`, JSON.stringify(state));
        }

        function loadAdvancementState(advancementId) {
            const savedState = localStorage.getItem(`advancement-${advancementId}`);
            if (savedState) {
                const state = JSON.parse(savedState);
                const advancementElement = document.querySelector(`[data-advancement="${advancementId}"]`);
                if (!advancementElement) return;

                const checkboxes = advancementElement.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    if (state[checkbox.dataset.part] !== undefined) {
                        checkbox.checked = state[checkbox.dataset.part];
                    }
                });
                updateAdvancementProgress(advancementId);
            }
        }

        // --- Quick Notes Functions ---
        function saveQuickNotes() {
            const notesTextarea = document.getElementById('notes-textarea');
            if (notesTextarea) {
                localStorage.setItem('minecraft-quick-notes', notesTextarea.value);
            }
        }

        function loadQuickNotes() {
            const notesTextarea = document.getElementById('notes-textarea');
            if (notesTextarea) {
                notesTextarea.value = localStorage.getItem('minecraft-quick-notes') || '';
            }
        }

        function clearQuickNotes() {
            const notesTextarea = document.getElementById('notes-textarea');
            if (notesTextarea) {
                notesTextarea.value = '';
                localStorage.removeItem('minecraft-quick-notes');
            }
        }

        // --- Project Planner Functions ---
        let projects = []; // Array to hold project data

        function saveProjects() {
            localStorage.setItem('minecraft-projects', JSON.stringify(projects));
        }

        function loadProjects() {
            const savedProjects = localStorage.getItem('minecraft-projects');
            if (savedProjects) {
                projects = JSON.parse(savedProjects);
            } else {
                projects = [];
            }
            renderProjects();
        }

        function renderProjects() {
            const projectsContainer = document.getElementById('projects-container');
            if (!projectsContainer) return;

            projectsContainer.innerHTML = ''; // Clear existing projects

            if (projects.length === 0) {
                projectsContainer.innerHTML = '<p class="text-center text-secondary">No projects added yet. Start planning!</p>';
                return;
            }

            projects.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                projectCard.dataset.projectId = project.id;

                const projectHeader = document.createElement('div');
                projectHeader.className = 'flex justify-between items-center mb-4';
                projectHeader.innerHTML = `
                    <h4>${project.name}</h4>
                    <button class="delete-project-btn btn bg-red-600 hover:bg-red-700 text-sm">Delete Project</button>
                `;
                projectCard.appendChild(projectHeader);

                const addTaskContainer = document.createElement('div');
                addTaskContainer.className = 'flex gap-2 mb-4';
                addTaskContainer.innerHTML = `
                    <input type="text" placeholder="New task for ${project.name}..." class="flex-grow add-task-input">
                    <button class="add-task-btn btn text-sm">Add Task</button>
                `;
                projectCard.appendChild(addTaskContainer);

                const taskList = document.createElement('ul');
                taskList.className = 'project-task-list';
                project.tasks.forEach(task => {
                    const taskItem = document.createElement('li');
                    taskItem.className = `project-task-item ${task.completed ? 'completed' : ''}`;
                    taskItem.dataset.taskId = task.id;
                    taskItem.innerHTML = `
                        <label>
                            <input type="checkbox" ${task.completed ? 'checked' : ''}>
                            <span>${task.text}</span>
                        </label>
                        <button class="delete-task-btn">X</button>
                    `;
                    taskList.appendChild(taskItem);
                });
                projectCard.appendChild(taskList);

                projectsContainer.appendChild(projectCard);
            });

            // Re-attach event listeners after rendering
            attachProjectEventListeners();
        }

        function addProject() {
            const newProjectInput = document.getElementById('new-project-input');
            if (newProjectInput && newProjectInput.value.trim() !== '') {
                const newProject = {
                    id: generateUniqueId(),
                    name: newProjectInput.value.trim(),
                    tasks: []
                };
                projects.push(newProject);
                newProjectInput.value = '';
                saveProjects();
                renderProjects();
            }
        }

        function addTask(projectId, taskText) {
            const project = projects.find(p => p.id === projectId);
            if (project && taskText.trim() !== '') {
                const newId = generateUniqueId();
                project.tasks.push({ id: newId, text: taskText.trim(), completed: false });
                saveProjects();
                renderProjects();
            }
        }

        function toggleTaskCompletion(projectId, taskId) {
            const project = projects.find(p => p.id === projectId);
            if (project) {
                const task = project.tasks.find(t => t.id === taskId);
                if (task) {
                    task.completed = !task.completed;
                    saveProjects();
                    renderProjects();
                }
            }
        }

        function deleteProject(projectId) {
            projects = projects.filter(p => p.id !== projectId);
            saveProjects();
            renderProjects();
        }

        function deleteTask(projectId, taskId) {
            const project = projects.find(p => p.id === projectId);
            if (project) {
                project.tasks = project.tasks.filter(t => t.id !== taskId);
                saveProjects();
                renderProjects();
            }
        }

        function attachProjectEventListeners() {
            // Add Project button
            const addProjectBtn = document.getElementById('add-project-btn');
            if (addProjectBtn) {
                addProjectBtn.onclick = addProject;
            }

            // Add Task buttons
            document.querySelectorAll('.add-task-btn').forEach(button => {
                button.onclick = (event) => {
                    const projectCard = event.target.closest('.project-card');
                    const projectId = projectCard.dataset.projectId;
                    const taskInput = projectCard.querySelector('.add-task-input');
                    addTask(projectId, taskInput.value);
                    taskInput.value = ''; // Clear input after adding
                };
            });

            // Task Checkboxes
            document.querySelectorAll('.project-task-item input[type="checkbox"]').forEach(checkbox => {
                checkbox.onchange = (event) => {
                    const projectCard = event.target.closest('.project-card');
                    const projectId = projectCard.dataset.projectId;
                    const taskItem = event.target.closest('.project-task-item');
                    const taskId = taskItem.dataset.taskId;
                    toggleTaskCompletion(projectId, taskId);
                };
            });

            // Delete Project buttons
            document.querySelectorAll('.delete-project-btn').forEach(button => {
                button.onclick = (event) => {
                    const projectCard = event.target.closest('.project-card');
                    const projectId = projectCard.dataset.projectId;
                    deleteProject(projectId);
                };
            });

            // Delete Task buttons
            document.querySelectorAll('.project-task-item .delete-task-btn').forEach(button => {
                button.onclick = (event) => {
                    const projectCard = event.target.closest('.project-card');
                    const projectId = projectCard.dataset.projectId;
                    const taskItem = event.target.closest('.project-task-item');
                    const taskId = taskItem.dataset.taskId;
                    deleteTask(projectId, taskId);
                };
            });
        }

        // --- Dropdown Navbar Functions ---
        function toggleDropdown() {
            document.getElementById("dropdown-content").classList.toggle("show");
        }

        // Close the dropdown if the user clicks outside of it
        window.onclick = function(event) {
            if (!event.target.matches('#dropdown-btn') && !event.target.closest('.dropdown-content')) {
                const dropdowns = document.getElementsByClassName("dropdown-content");
                for (let i = 0; i < dropdowns.length; i++) {
                    const openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                        openDropdown.classList.remove('show');
                    }
                }
            }
        }

        // --- Initialize all features on page load ---
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize Advancement Tracker
            document.querySelectorAll('[data-advancement]').forEach(advancementElement => {
                const advancementId = advancementElement.dataset.advancement;
                loadAdvancementState(advancementId);

                advancementElement.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        updateAdvancementProgress(advancementId);
                    });
                });
            });

            // Initialize Quick Notes
            loadQuickNotes();
            const notesTextarea = document.getElementById('notes-textarea');
            if (notesTextarea) {
                notesTextarea.addEventListener('input', saveQuickNotes);
            }
            const clearNotesBtn = document.getElementById('clear-notes-btn');
            if (clearNotesBtn) {
                clearNotesBtn.addEventListener('click', clearQuickNotes);
            }

            // Initialize Project Planner
            loadProjects(); // Loads projects and renders them

            // Initialize Dropdown Navbar
            const dropdownBtn = document.getElementById('dropdown-btn');
            if (dropdownBtn) {
                dropdownBtn.addEventListener('click', toggleDropdown);
            }
        });