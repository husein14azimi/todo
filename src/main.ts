import './styles/theme.css';
import './styles/main.css';
import './components/m3-components';
import { themeEngine, PRESET_SEED_COLORS } from './theme/theme-engine';
import { todoService } from './services/todo-service';
import { snackbar } from './services/snackbar-service';
import { TodoItem, FilterView, Category, Priority } from './models/todo';

class Material3TodoApp {
  private container: HTMLElement;
  private currentView: FilterView = 'all';
  private selectedCategory: Category | 'All' = 'All';
  private searchQuery = '';
  private editingTaskId: string | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init(): void {
    this.renderSkeleton();
    this.bindEvents();
    this.updateView();

    todoService.subscribe(() => {
      this.updateView();
    });

    themeEngine.subscribe(() => {
      this.updateThemeDialogActiveState();
    });
  }

  private renderSkeleton(): void {
    this.container.innerHTML = `
      <!-- Top App Bar -->
      <header class="m3-top-app-bar">
        <div class="m3-app-bar-headline">
          <div class="m3-logo-badge">
            <span class="material-symbols-outlined">checklist</span>
          </div>
          <div>
            <h1>M3 Tasks</h1>
          </div>
        </div>

        <div class="m3-app-bar-actions">
          <div class="m3-search-bar">
            <span class="material-symbols-outlined" style="font-size: 20px;">search</span>
            <input type="text" id="searchInput" placeholder="Search tasks..." autocomplete="off" />
          </div>

          <md-icon-button id="paletteBtn" title="Customize M3 Theme Color">
            <span class="material-symbols-outlined">palette</span>
          </md-icon-button>

          <md-icon-button id="themeToggleBtn" title="Toggle Light/Dark Theme">
            <span class="material-symbols-outlined" id="themeIcon">dark_mode</span>
          </md-icon-button>
        </div>
      </header>

      <!-- Layout Body: Navigation Rail + Main View -->
      <div class="m3-layout-body">
        <!-- Navigation Rail (Desktop) -->
        <nav class="m3-navigation-rail" id="desktopNavRail">
          <button class="m3-rail-item active" data-view="all">
            <div class="m3-rail-icon-wrapper">
              <span class="material-symbols-outlined">inbox</span>
              <span class="m3-badge" id="railBadgeAll" style="display: none;">0</span>
            </div>
            <span class="m3-rail-label">All</span>
          </button>

          <button class="m3-rail-item" data-view="today">
            <div class="m3-rail-icon-wrapper">
              <span class="material-symbols-outlined">today</span>
              <span class="m3-badge" id="railBadgeToday" style="display: none;">0</span>
            </div>
            <span class="m3-rail-label">Today</span>
          </button>

          <button class="m3-rail-item" data-view="upcoming">
            <div class="m3-rail-icon-wrapper">
              <span class="material-symbols-outlined">event_upcoming</span>
            </div>
            <span class="m3-rail-label">Upcoming</span>
          </button>

          <button class="m3-rail-item" data-view="completed">
            <div class="m3-rail-icon-wrapper">
              <span class="material-symbols-outlined">task_alt</span>
            </div>
            <span class="m3-rail-label">Done</span>
          </button>
        </nav>

        <!-- Main Content Area -->
        <main class="m3-main-container">
          <!-- Filter & Statistics Bar -->
          <section class="m3-filter-section">
            <div class="m3-filter-chips-group" id="categoryChips">
              <md-filter-chip label="All" selected data-category="All"></md-filter-chip>
              <md-filter-chip label="Design" data-category="Design"></md-filter-chip>
              <md-filter-chip label="Work" data-category="Work"></md-filter-chip>
              <md-filter-chip label="Study" data-category="Study"></md-filter-chip>
              <md-filter-chip label="Personal" data-category="Personal"></md-filter-chip>
            </div>

            <div class="m3-stats-banner" id="statsBanner">
              <span class="m3-stat-item">
                <span class="material-symbols-outlined" style="font-size: 18px;">pending_actions</span>
                <span id="statPending">0 pending</span>
              </span>
              <span class="m3-stat-item">
                <span class="material-symbols-outlined" style="font-size: 18px;">check_circle</span>
                <span id="statCompleted">0 completed</span>
              </span>
            </div>
          </section>

          <!-- Task Cards List -->
          <section class="m3-task-list" id="taskListContainer" aria-label="Tasks List">
            <!-- Rendered dynamically -->
          </section>
        </main>
      </div>

      <!-- Mobile Navigation Bar -->
      <nav class="m3-navigation-bar" id="mobileNavBar">
        <button class="m3-rail-item active" data-view="all">
          <div class="m3-rail-icon-wrapper">
            <span class="material-symbols-outlined">inbox</span>
          </div>
          <span class="m3-rail-label">All</span>
        </button>
        <button class="m3-rail-item" data-view="today">
          <div class="m3-rail-icon-wrapper">
            <span class="material-symbols-outlined">today</span>
          </div>
          <span class="m3-rail-label">Today</span>
        </button>
        <button class="m3-rail-item" data-view="upcoming">
          <div class="m3-rail-icon-wrapper">
            <span class="material-symbols-outlined">event_upcoming</span>
          </div>
          <span class="m3-rail-label">Upcoming</span>
        </button>
        <button class="m3-rail-item" data-view="completed">
          <div class="m3-rail-icon-wrapper">
            <span class="material-symbols-outlined">task_alt</span>
          </div>
          <span class="m3-rail-label">Done</span>
        </button>
      </nav>

      <!-- Extended FAB for creating tasks -->
      <div class="m3-fab-wrapper">
        <md-fab id="createTaskFab" variant="primary" label="New Task">
          <span slot="icon" class="material-symbols-outlined">add</span>
        </md-fab>
      </div>

      <!-- M3 Task Create / Edit Dialog -->
      <md-dialog id="taskDialog">
        <div slot="headline" id="taskDialogTitle">Create Task</div>
        <form slot="content" id="taskForm" class="m3-dialog-content" method="dialog">
          <md-outlined-text-field
            id="taskTitleInput"
            label="Task title *"
            required
            style="width: 100%;"
          ></md-outlined-text-field>

          <md-outlined-text-field
            id="taskDescInput"
            label="Description (optional)"
            type="textarea"
            rows="3"
            style="width: 100%;"
          ></md-outlined-text-field>

          <div class="m3-form-row">
            <md-outlined-text-field
              id="taskDueDateInput"
              label="Due Date"
              type="date"
              style="flex: 1;"
            ></md-outlined-text-field>
          </div>

          <div class="m3-form-row" style="align-items: center; justify-content: space-between;">
            <label style="font-size: 14px; color: var(--md-sys-color-on-surface-variant);">Priority:</label>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="m3-pill priority-low priority-select" data-priority="low">Low</button>
              <button type="button" class="m3-pill priority-medium priority-select" data-priority="medium">Medium</button>
              <button type="button" class="m3-pill priority-high priority-select" data-priority="high">High</button>
            </div>
          </div>

          <div class="m3-form-row" style="align-items: center; justify-content: space-between;">
            <label style="font-size: 14px; color: var(--md-sys-color-on-surface-variant);">Category:</label>
            <select id="taskCategorySelect" style="
              padding: 8px 12px;
              border-radius: var(--md-sys-shape-corner-small);
              border: 1px solid var(--md-sys-color-outline);
              background: var(--md-sys-color-surface-container);
              color: var(--md-sys-color-on-surface);
              font-family: inherit;
              font-size: 14px;
            ">
              <option value="Design">Design</option>
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Personal">Personal</option>
              <option value="General">General</option>
            </select>
          </div>
        </form>
        <div slot="actions">
          <md-text-button id="taskCancelBtn">Cancel</md-text-button>
          <md-filled-button id="taskSaveBtn">Save Task</md-filled-button>
        </div>
      </md-dialog>

      <!-- M3 Dynamic Theme Customizer Dialog -->
      <md-dialog id="themeDialog">
        <div slot="headline">Material You Theme Engine</div>
        <div slot="content" class="m3-dialog-content">
          <p style="font-size: 14px; color: var(--md-sys-color-on-surface-variant); line-height: 1.4;">
            Material 3 generates an entire tonal palette across primary, secondary, tertiary, and neutral surface containers based on an algorithmic seed color (HCT color space).
          </p>

          <h4 style="font-size: 14px; font-weight: 500; color: var(--md-sys-color-on-surface);">Preset Seed Palettes:</h4>
          <div class="m3-palette-presets-grid" id="presetPaletteList">
            <!-- Dynamically populated -->
          </div>

          <h4 style="font-size: 14px; font-weight: 500; color: var(--md-sys-color-on-surface); margin-top: 8px;">Or Pick Any Custom Seed:</h4>
          <div class="m3-custom-color-row">
            <input type="color" id="customColorPicker" value="${themeEngine.getConfig().seedColor}" />
            <div>
              <div style="font-weight: 500; font-size: 14px;">Dynamic HCT Extraction</div>
              <div style="font-size: 12px; color: var(--md-sys-color-on-surface-variant);" id="customColorHexLabel">
                Current: ${themeEngine.getConfig().seedColor}
              </div>
            </div>
          </div>
        </div>
        <div slot="actions">
          <md-filled-button id="themeDialogCloseBtn">Done</md-filled-button>
        </div>
      </md-dialog>
    `;

    this.renderPresets();
    this.updateThemeIcon();
  }

  private renderPresets(): void {
    const list = document.getElementById('presetPaletteList');
    if (!list) return;

    const currentSeed = themeEngine.getConfig().seedColor.toLowerCase();

    list.innerHTML = PRESET_SEED_COLORS.map(
      (p) => `
      <button class="m3-color-swatch-button ${p.hex.toLowerCase() === currentSeed ? 'active' : ''}" data-color="${p.hex}">
        <span class="m3-color-dot" style="background-color: ${p.hex};"></span>
        <span>${p.name.split(' ')[0]}</span>
      </button>
    `
    ).join('');

    list.querySelectorAll<HTMLButtonElement>('.m3-color-swatch-button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const hex = btn.getAttribute('data-color');
        if (hex) {
          themeEngine.setSeedColor(hex);
          const picker = document.getElementById('customColorPicker') as HTMLInputElement;
          if (picker) picker.value = hex;
          const label = document.getElementById('customColorHexLabel');
          if (label) label.textContent = `Current: ${hex}`;
          this.updateThemeDialogActiveState();
          snackbar.show(`Applied ${btn.textContent?.trim()} theme palette`);
        }
      });
    });
  }

  private updateThemeDialogActiveState(): void {
    const currentSeed = themeEngine.getConfig().seedColor.toLowerCase();
    const list = document.getElementById('presetPaletteList');
    if (list) {
      list.querySelectorAll<HTMLButtonElement>('.m3-color-swatch-button').forEach((btn) => {
        const color = btn.getAttribute('data-color')?.toLowerCase();
        if (color === currentSeed) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    const picker = document.getElementById('customColorPicker') as HTMLInputElement;
    if (picker) {
      picker.value = themeEngine.getConfig().seedColor;
    }
    const label = document.getElementById('customColorHexLabel');
    if (label) {
      label.textContent = `Current: ${themeEngine.getConfig().seedColor}`;
    }
    this.updateThemeIcon();
  }

  private updateThemeIcon(): void {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;
    icon.textContent = themeEngine.getConfig().isDark ? 'light_mode' : 'dark_mode';
  }

  private bindEvents(): void {
    // Theme toggle
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
      themeEngine.toggleDarkMode();
      this.updateThemeIcon();
      snackbar.show(themeEngine.getConfig().isDark ? 'Dark mode enabled' : 'Light mode enabled');
    });

    // Theme dialog open
    const themeDialog = document.getElementById('themeDialog') as any;
    document.getElementById('paletteBtn')?.addEventListener('click', () => {
      themeDialog?.show();
    });

    document.getElementById('themeDialogCloseBtn')?.addEventListener('click', () => {
      themeDialog?.close();
    });

    // Custom color picker input
    const colorPicker = document.getElementById('customColorPicker') as HTMLInputElement;
    colorPicker?.addEventListener('input', (e) => {
      const hex = (e.target as HTMLInputElement).value;
      themeEngine.setSeedColor(hex);
      const label = document.getElementById('customColorHexLabel');
      if (label) label.textContent = `Current: ${hex}`;
      this.updateThemeDialogActiveState();
    });

    // Search input
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value;
      this.updateView();
    });

    // Navigation switching (Rail & Mobile Bar)
    const handleNavClick = (view: FilterView) => {
      this.currentView = view;
      document.querySelectorAll('.m3-rail-item').forEach((item) => {
        if (item.getAttribute('data-view') === view) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
      this.updateView();
    };

    document.querySelectorAll('.m3-rail-item').forEach((item) => {
      item.addEventListener('click', () => {
        const view = item.getAttribute('data-view') as FilterView;
        if (view) handleNavClick(view);
      });
    });

    // Category filter chips
    document.querySelectorAll('#categoryChips md-filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const cat = chip.getAttribute('data-category') as Category | 'All';
        this.selectedCategory = cat;

        document.querySelectorAll('#categoryChips md-filter-chip').forEach((c) => {
          (c as any).selected = c === chip;
        });

        this.updateView();
      });
    });

    // Task Dialog
    const taskDialog = document.getElementById('taskDialog') as any;
    const taskSaveBtn = document.getElementById('taskSaveBtn');
    const taskCancelBtn = document.getElementById('taskCancelBtn');
    const fab = document.getElementById('createTaskFab');

    let selectedPriority: Priority = 'medium';

    const updatePriorityButtons = (priority: Priority) => {
      selectedPriority = priority;
      document.querySelectorAll<HTMLElement>('.priority-select').forEach((btn) => {
        if (btn.getAttribute('data-priority') === priority) {
          btn.style.boxShadow = '0 0 0 2px var(--md-sys-color-primary)';
          btn.style.fontWeight = 'bold';
        } else {
          btn.style.boxShadow = 'none';
          btn.style.fontWeight = 'normal';
        }
      });
    };

    document.querySelectorAll('.priority-select').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = btn.getAttribute('data-priority') as Priority;
        if (p) updatePriorityButtons(p);
      });
    });

    fab?.addEventListener('click', () => {
      this.editingTaskId = null;
      const titleInput = document.getElementById('taskTitleInput') as any;
      const descInput = document.getElementById('taskDescInput') as any;
      const dateInput = document.getElementById('taskDueDateInput') as any;
      const catSelect = document.getElementById('taskCategorySelect') as HTMLSelectElement;
      const dialogTitle = document.getElementById('taskDialogTitle');

      if (dialogTitle) dialogTitle.textContent = 'Create New Task';
      if (titleInput) titleInput.value = '';
      if (descInput) descInput.value = '';
      if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
      if (catSelect) catSelect.value = 'Design';
      updatePriorityButtons('medium');

      taskDialog?.show();
    });

    taskCancelBtn?.addEventListener('click', () => {
      taskDialog?.close();
    });

    taskSaveBtn?.addEventListener('click', () => {
      const titleInput = document.getElementById('taskTitleInput') as any;
      const descInput = document.getElementById('taskDescInput') as any;
      const dateInput = document.getElementById('taskDueDateInput') as any;
      const catSelect = document.getElementById('taskCategorySelect') as HTMLSelectElement;

      const title = titleInput?.value?.trim();
      if (!title) {
        if (titleInput) {
          titleInput.error = true;
          titleInput.errorText = 'Title is required';
        }
        return;
      }

      if (this.editingTaskId) {
        todoService.update(this.editingTaskId, {
          title,
          description: descInput?.value?.trim() || '',
          dueDate: dateInput?.value || '',
          category: (catSelect?.value as Category) || 'General',
          priority: selectedPriority,
        });
        snackbar.show('Task updated');
      } else {
        todoService.add({
          title,
          description: descInput?.value?.trim() || '',
          dueDate: dateInput?.value || '',
          category: (catSelect?.value as Category) || 'General',
          priority: selectedPriority,
          completed: false,
        });
        snackbar.show('Task created');
      }

      taskDialog?.close();
    });
  }

  private updateView(): void {
    const todos = todoService.filter({
      view: this.currentView,
      category: this.selectedCategory,
      searchQuery: this.searchQuery,
    });

    this.renderTaskList(todos);
    this.updateStats();
  }

  private updateStats(): void {
    const stats = todoService.getStats();
    const statPending = document.getElementById('statPending');
    const statCompleted = document.getElementById('statCompleted');
    if (statPending) statPending.textContent = `${stats.pending} pending`;
    if (statCompleted) statCompleted.textContent = `${stats.completed} completed`;

    const badgeAll = document.getElementById('railBadgeAll');
    if (badgeAll) {
      badgeAll.textContent = String(stats.pending);
      badgeAll.style.display = stats.pending > 0 ? 'inline-block' : 'none';
    }

    const badgeToday = document.getElementById('railBadgeToday');
    if (badgeToday) {
      badgeToday.textContent = String(stats.today);
      badgeToday.style.display = stats.today > 0 ? 'inline-block' : 'none';
    }
  }

  private renderTaskList(todos: TodoItem[]): void {
    const container = document.getElementById('taskListContainer');
    if (!container) return;

    if (todos.length === 0) {
      container.innerHTML = `
        <div class="m3-empty-state">
          <span class="material-symbols-outlined">inbox</span>
          <h3>No tasks found</h3>
          <p>There are no tasks matching your current view or filters. Tap the "+" button below to add one!</p>
        </div>
      `;
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    container.innerHTML = todos
      .map((item) => {
        const isOverdue = !item.completed && item.dueDate && item.dueDate < todayStr;
        return `
        <div class="m3-task-card ${item.completed ? 'completed' : ''}" data-id="${item.id}">
          <md-checkbox
            class="m3-task-checkbox"
            ${item.completed ? 'checked' : ''}
            touch-target="wrapper"
          ></md-checkbox>

          <div class="m3-task-content">
            <div class="m3-task-header-row">
              <span class="m3-task-title">${this.escapeHtml(item.title)}</span>
              <div class="m3-task-actions">
                <md-icon-button class="edit-btn" title="Edit task">
                  <span class="material-symbols-outlined" style="font-size: 20px;">edit</span>
                </md-icon-button>
                <md-icon-button class="delete-btn" title="Delete task">
                  <span class="material-symbols-outlined" style="font-size: 20px;">delete</span>
                </md-icon-button>
              </div>
            </div>

            ${
              item.description
                ? `<p class="m3-task-desc">${this.escapeHtml(item.description)}</p>`
                : ''
            }

            <div class="m3-task-meta-row">
              <span class="m3-pill priority-${item.priority}">
                ${item.priority.toUpperCase()}
              </span>

              <span class="m3-pill category-tag">
                <span class="material-symbols-outlined" style="font-size: 14px;">folder</span>
                ${this.escapeHtml(item.category)}
              </span>

              ${
                item.dueDate
                  ? `
                <span class="m3-pill ${isOverdue ? 'date-overdue' : 'date-tag'}">
                  <span class="material-symbols-outlined" style="font-size: 14px;">event</span>
                  ${item.dueDate}${isOverdue ? ' (Overdue)' : ''}
                </span>
              `
                  : ''
              }
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    // Attach card event listeners
    todos.forEach((item) => {
      const cardEl = container.querySelector(`[data-id="${item.id}"]`);
      if (!cardEl) return;

      const checkbox = cardEl.querySelector('.m3-task-checkbox');
      checkbox?.addEventListener('change', () => {
        const updated = todoService.toggleComplete(item.id);
        if (updated?.completed) {
          snackbar.show('Task marked as completed', 'Undo', () => {
            todoService.toggleComplete(item.id);
          });
        }
      });

      const editBtn = cardEl.querySelector('.edit-btn');
      editBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openEditDialog(item);
      });

      const deleteBtn = cardEl.querySelector('.delete-btn');
      deleteBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const deleted = todoService.delete(item.id);
        if (deleted) {
          snackbar.show('Task deleted', 'Undo', () => {
            todoService.restore(deleted);
          });
        }
      });
    });
  }

  private openEditDialog(item: TodoItem): void {
    this.editingTaskId = item.id;
    const taskDialog = document.getElementById('taskDialog') as any;
    const dialogTitle = document.getElementById('taskDialogTitle');
    const titleInput = document.getElementById('taskTitleInput') as any;
    const descInput = document.getElementById('taskDescInput') as any;
    const dateInput = document.getElementById('taskDueDateInput') as any;
    const catSelect = document.getElementById('taskCategorySelect') as HTMLSelectElement;

    if (dialogTitle) dialogTitle.textContent = 'Edit Task';
    if (titleInput) titleInput.value = item.title;
    if (descInput) descInput.value = item.description;
    if (dateInput) dateInput.value = item.dueDate;
    if (catSelect) catSelect.value = item.category;

    // update priority buttons
    document.querySelectorAll<HTMLElement>('.priority-select').forEach((btn) => {
      if (btn.getAttribute('data-priority') === item.priority) {
        btn.style.boxShadow = '0 0 0 2px var(--md-sys-color-primary)';
        btn.style.fontWeight = 'bold';
      } else {
        btn.style.boxShadow = 'none';
        btn.style.fontWeight = 'normal';
      }
    });

    taskDialog?.show();
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Initialize on DOMContentLoaded or immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const appEl = document.getElementById('app');
    if (appEl) new Material3TodoApp(appEl);
  });
} else {
  const appEl = document.getElementById('app');
  if (appEl) new Material3TodoApp(appEl);
}
