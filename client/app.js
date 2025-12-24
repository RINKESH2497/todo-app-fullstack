// ============================================
// Modern Todo App - JavaScript
// ============================================

class TodoApp {
  constructor() {
    this.tasks = [];
    this.currentFilter = "all";
    this.searchQuery = "";
    this.draggedElement = null;
    this.isLoading = false;

    this.initializeElements();
    this.attachEventListeners();
    this.init();
  }

  // Initialize app by loading tasks from API
  async init() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if not authenticated
      window.location.href = 'auth.html';
      return;
    }

    // Display user info
    this.displayUserInfo();

    // Load tasks
    await this.loadTasks();
  }

  displayUserInfo() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      document.getElementById('user-name').textContent = user.name;
      document.getElementById('user-email').textContent = user.email;
    }

    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        apiService.logout();
      }
    });
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  initializeElements() {
    // Input elements
    this.taskInput = document.getElementById("task-input");
    this.prioritySelect = document.getElementById("priority-select");
    this.categoryInput = document.getElementById("category-input");
    this.dueDateInput = document.getElementById("due-date-input");
    this.addTaskBtn = document.getElementById("add-task-btn");

    // Filter elements
    this.searchInput = document.getElementById("search-input");
    this.filterBtns = document.querySelectorAll(".filter-btn");

    // Display elements
    this.tasksList = document.getElementById("tasks-list");
    this.emptyState = document.getElementById("empty-state");

    // Stats elements
    this.totalTasksStat = document.getElementById("total-tasks-stat");
    this.completedTasksStat = document.getElementById("completed-tasks-stat");
    this.activeTasksStat = document.getElementById("active-tasks-stat");
    this.completionRateStat = document.getElementById("completion-rate-stat");
    this.completionProgress = document.getElementById("completion-progress");
  }

  attachEventListeners() {
    // Add task
    this.addTaskBtn.addEventListener("click", () => this.addTask());
    this.taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTask();
    });

    // Search
    this.searchInput.addEventListener("input", (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.render();
    });

    // Filters
    this.filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.filterBtns.forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.currentFilter = e.target.dataset.filter;
        this.render();
      });
    });
  }

  // ============================================
  // TASK MANAGEMENT
  // ============================================
  async addTask() {
    const text = this.taskInput.value.trim();

    if (!text) {
      this.shakeElement(this.taskInput);
      return;
    }

    const taskData = {
      text,
      priority: this.prioritySelect.value,
      category: this.categoryInput.value.trim() || "General",
      dueDate: this.dueDateInput.value || null,
      completed: false,
    };

    try {
      this.isLoading = true;
      const newTask = await apiService.createTask(taskData);
      this.tasks.unshift(newTask);
      this.clearInputs();
      this.render();
      this.updateStats();

      // Animate the new task
      setTimeout(() => {
        const firstTask = this.tasksList.querySelector(".task-item");
        if (firstTask) {
          firstTask.style.animation = "none";
          setTimeout(() => {
            firstTask.style.animation = "";
          }, 10);
        }
      }, 10);
    } catch (error) {
      this.showError("Failed to add task: " + error.message);
    } finally {
      this.isLoading = false;
    }
  }

  async toggleTask(id) {
    const task = this.tasks.find((t) => (t._id || t.id) === id);
    if (task) {
      try {
        const updatedTask = await apiService.updateTask(id, {
          completed: !task.completed
        });
        task.completed = updatedTask.completed;
        this.render();
        this.updateStats();
      } catch (error) {
        this.showError("Failed to update task: " + error.message);
      }
    }
  }

  async deleteTask(id) {
    const taskElement = document.querySelector(`[data-task-id="${id}"]`);

    if (taskElement) {
      taskElement.style.animation = "taskSlideIn 0.3s ease-out reverse";
      setTimeout(async () => {
        try {
          await apiService.deleteTask(id);
          this.tasks = this.tasks.filter((t) => (t._id || t.id) !== id);
          this.render();
          this.updateStats();
        } catch (error) {
          this.showError("Failed to delete task: " + error.message);
          taskElement.style.animation = "";
        }
      }, 300);
    }
  }

  editTask(id) {
    const task = this.tasks.find((t) => (t._id || t.id) === id);
    if (task) {
      this.taskInput.value = task.text;
      this.prioritySelect.value = task.priority;
      this.categoryInput.value = task.category;
      this.dueDateInput.value = task.dueDate ? task.dueDate.split('T')[0] : '';
      this.deleteTask(id);
      this.taskInput.focus();
    }
  }

  // ============================================
  // DRAG AND DROP
  // ============================================
  handleDragStart(e, id) {
    this.draggedElement = e.target;
    e.target.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const afterElement = this.getDragAfterElement(e.clientY);
    const draggable = this.draggedElement;

    if (afterElement == null) {
      this.tasksList.appendChild(draggable);
    } else {
      this.tasksList.insertBefore(draggable, afterElement);
    }
  }

  handleDragEnd(e) {
    e.target.classList.remove("dragging");
    this.updateTaskOrder();
  }

  getDragAfterElement(y) {
    const draggableElements = [
      ...this.tasksList.querySelectorAll(".task-item:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  async updateTaskOrder() {
    const taskElements = this.tasksList.querySelectorAll(".task-item");
    const newOrder = [];

    taskElements.forEach((el) => {
      const id = el.dataset.taskId;
      const task = this.tasks.find((t) => (t._id || t.id) === id);
      if (task) newOrder.push(task);
    });

    this.tasks = newOrder;

    try {
      // Send reordered tasks to API
      await apiService.reorderTasks(this.tasks);
    } catch (error) {
      this.showError("Failed to save task order: " + error.message);
    }
  }

  // ============================================
  // FILTERING & SEARCH
  // ============================================
  getFilteredTasks() {
    let filtered = [...this.tasks];

    // Apply filter
    switch (this.currentFilter) {
      case "active":
        filtered = filtered.filter((t) => !t.completed);
        break;
      case "completed":
        filtered = filtered.filter((t) => t.completed);
        break;
      case "high":
        filtered = filtered.filter(
          (t) => t.priority === "high" && !t.completed
        );
        break;
      case "medium":
        filtered = filtered.filter(
          (t) => t.priority === "medium" && !t.completed
        );
        break;
      case "low":
        filtered = filtered.filter((t) => t.priority === "low" && !t.completed);
        break;
    }

    // Apply search
    if (this.searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.text.toLowerCase().includes(this.searchQuery) ||
          t.category.toLowerCase().includes(this.searchQuery)
      );
    }

    return filtered;
  }

  // ============================================
  // RENDERING
  // ============================================
  render() {
    const filteredTasks = this.getFilteredTasks();

    if (filteredTasks.length === 0) {
      this.emptyState.classList.remove("hidden");
      const existingTasks = this.tasksList.querySelectorAll(".task-item");
      existingTasks.forEach((t) => t.remove());
      return;
    }

    this.emptyState.classList.add("hidden");

    // Clear existing tasks
    const existingTasks = this.tasksList.querySelectorAll(".task-item");
    existingTasks.forEach((t) => t.remove());

    // Render tasks
    filteredTasks.forEach((task) => {
      const taskElement = this.createTaskElement(task);
      this.tasksList.appendChild(taskElement);
    });
  }

  createTaskElement(task) {
    const taskDiv = document.createElement("div");
    taskDiv.className = `task-item ${task.completed ? "completed" : ""}`;
    taskDiv.dataset.taskId = task._id || task.id;
    taskDiv.draggable = true;

    // Drag event listeners
    taskDiv.addEventListener("dragstart", (e) =>
      this.handleDragStart(e, task._id || task.id)
    );
    taskDiv.addEventListener("dragend", (e) => this.handleDragEnd(e));

    // Checkbox
    const checkbox = document.createElement("div");
    checkbox.className = `task-checkbox ${task.completed ? "checked" : ""}`;
    checkbox.addEventListener("click", () => this.toggleTask(task._id || task.id));

    // Content
    const content = document.createElement("div");
    content.className = "task-content";

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.text;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    // Priority badge
    const priorityBadge = document.createElement("span");
    priorityBadge.className = `task-priority-badge priority-${task.priority}`;
    const priorityIcons = { high: "🔴", medium: "🟡", low: "🟢" };
    priorityBadge.innerHTML = `${priorityIcons[task.priority]} ${
      task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
    }`;
    meta.appendChild(priorityBadge);

    // Category tag
    const categoryTag = document.createElement("span");
    categoryTag.className = "task-category-tag";
    categoryTag.textContent = task.category;
    meta.appendChild(categoryTag);

    // Due date
    if (task.dueDate) {
      const dueDate = document.createElement("span");
      dueDate.className = "task-due-date";
      const date = new Date(task.dueDate);
      const isOverdue = date < new Date() && !task.completed;
      if (isOverdue) dueDate.classList.add("overdue");
      dueDate.innerHTML = `📅 ${this.formatDate(task.dueDate)}`;
      meta.appendChild(dueDate);
    }

    content.appendChild(title);
    content.appendChild(meta);

    // Actions
    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-icon";
    editBtn.innerHTML = "✏️";
    editBtn.title = "Edit task";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.editTask(task._id || task.id);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-icon";
    deleteBtn.innerHTML = "🗑️";
    deleteBtn.title = "Delete task";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.deleteTask(task._id || task.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    taskDiv.appendChild(checkbox);
    taskDiv.appendChild(content);
    taskDiv.appendChild(actions);

    return taskDiv;
  }

  // ============================================
  // STATISTICS
  // ============================================
  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    const active = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    // Animate number changes
    this.animateValue(
      this.totalTasksStat,
      parseInt(this.totalTasksStat.textContent) || 0,
      total,
      500
    );
    this.animateValue(
      this.completedTasksStat,
      parseInt(this.completedTasksStat.textContent) || 0,
      completed,
      500
    );
    this.animateValue(
      this.activeTasksStat,
      parseInt(this.activeTasksStat.textContent) || 0,
      active,
      500
    );

    this.completionRateStat.textContent = `${completionRate}%`;
    this.completionProgress.style.width = `${completionRate}%`;
  }

  animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (
        (increment > 0 && current >= end) ||
        (increment < 0 && current <= end)
      ) {
        current = end;
        clearInterval(timer);
      }
      element.textContent = Math.round(current);
    }, 16);
  }

  // ============================================
  // UTILITIES
  // ============================================
  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  clearInputs() {
    this.taskInput.value = "";
    this.categoryInput.value = "";
    this.dueDateInput.value = "";
    this.prioritySelect.value = "medium";
  }

  shakeElement(element) {
    element.style.animation = "none";
    setTimeout(() => {
      element.style.animation = "pulse 0.5s ease-in-out";
    }, 10);
    setTimeout(() => {
      element.style.animation = "";
    }, 500);
  }

  // ============================================
  // API DATA MANAGEMENT
  // ============================================
  async loadTasks() {
    try {
      this.isLoading = true;
      this.tasks = await apiService.fetchTasks();
      this.render();
      this.updateStats();
    } catch (error) {
      this.showError("Failed to load tasks: " + error.message);
      console.error("Failed to load tasks:", error);
    } finally {
      this.isLoading = false;
    }
  }

  showError(message) {
    // Create error toast
    const toast = document.createElement("div");
    toast.className = "error-toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add("show"), 100);

    // Hide and remove toast
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// ============================================
// INITIALIZE APP
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  // Add drag over listener to tasks list
  const tasksList = document.getElementById("tasks-list");
  tasksList.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  // Initialize the app
  window.todoApp = new TodoApp();
});
