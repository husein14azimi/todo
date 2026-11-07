export class SnackbarService {
  private el: HTMLElement;
  private messageEl: HTMLElement;
  private actionBtn: HTMLButtonElement;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private onActionCallback: (() => void) | null = null;

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'm3-snackbar';
    this.el.setAttribute('role', 'status');
    this.el.setAttribute('aria-live', 'polite');

    this.messageEl = document.createElement('span');
    this.messageEl.className = 'm3-snackbar-message';

    this.actionBtn = document.createElement('button');
    this.actionBtn.className = 'm3-snackbar-action';
    this.actionBtn.style.display = 'none';

    this.actionBtn.addEventListener('click', () => {
      if (this.onActionCallback) {
        this.onActionCallback();
      }
      this.dismiss();
    });

    this.el.appendChild(this.messageEl);
    this.el.appendChild(this.actionBtn);
    document.body.appendChild(this.el);
  }

  public show(message: string, actionText?: string, onAction?: () => void, duration = 4000): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.messageEl.textContent = message;
    if (actionText && onAction) {
      this.actionBtn.textContent = actionText;
      this.actionBtn.style.display = 'inline-block';
      this.onActionCallback = onAction;
    } else {
      this.actionBtn.style.display = 'none';
      this.onActionCallback = null;
    }

    this.el.classList.add('visible');

    this.timeoutId = setTimeout(() => {
      this.dismiss();
    }, duration);
  }

  public dismiss(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.el.classList.remove('visible');
  }
}

export const snackbar = new SnackbarService();
