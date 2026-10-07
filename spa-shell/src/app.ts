// ============ Types ============
interface Route {
  id: string;
  title: string;
  description: string;
  render: () => string;
}

interface NotificationItem {
  id: number;
  title: string;
  time: string;
  read: boolean;
}

// ============ Helpers ============
const MOBILE_QUERY = window.matchMedia("(max-width: 900px)");
const STORAGE_KEY = "spa-shell:sidebar-collapsed";

function $<T extends HTMLElement>(selector: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function storageGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function storageSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
}

// ============ Routes ============
const page = (title: string, description: string, body = ""): string =>
  `<h1>${title}</h1><p>${description}</p>${body}`;

const statCards = (stats: [string, string][]): string =>
  `<div class="cards">${stats
    .map(([label, value]) => `<div class="card"><div class="card__label">${label}</div><div class="card__value">${value}</div></div>`)
    .join("")}</div>`;

const ROUTES: Route[] = [
  { id: "dashboard", title: "Dashboard", description: "Overview of your workspace",
    render() { return page(this.title, this.description, statCards([["Revenue", "$48,210"], ["Active users", "2,341"], ["Open tickets", "17"], ["Uptime", "99.98%"]])); } },
  { id: "projects", title: "Projects", description: "All active and archived projects",
    render() { return page(this.title, this.description, statCards([["Active", "12"], ["Archived", "34"], ["Due this week", "3"]])); } },
  { id: "team", title: "Team", description: "Manage members and roles",
    render() { return page(this.title, this.description, statCards([["Members", "24"], ["Admins", "3"], ["Pending invites", "2"]])); } },
  { id: "reports", title: "Reports", description: "Analytics and exported reports",
    render() { return page(this.title, this.description); } },
  { id: "messages", title: "Messages", description: "Conversations with your team",
    render() { return page(this.title, this.description); } },
  { id: "settings", title: "Settings", description: "Workspace and account preferences",
    render() { return page(this.title, this.description); } },
  { id: "profile", title: "My Profile", description: "Your personal information",
    render() { return page(this.title, this.description); } },
  { id: "billing", title: "Billing", description: "Plans, invoices and payment methods",
    render() { return page(this.title, this.description); } },
];

const DEFAULT_ROUTE = "dashboard";

// ============ Sidebar ============
class Sidebar {
  private app = $<HTMLDivElement>("#app");
  private menuBtn = $<HTMLButtonElement>("#menuBtn");
  private collapseBtn = $<HTMLButtonElement>("#collapseBtn");
  private backdrop = $<HTMLDivElement>("#backdrop");

  constructor() {
    if (storageGet(STORAGE_KEY) === "1") this.app.classList.add("is-collapsed");

    this.menuBtn.addEventListener("click", () => this.toggle());
    this.collapseBtn.addEventListener("click", () => this.toggleCollapsed());
    this.backdrop.addEventListener("click", () => this.closeMobile());
    MOBILE_QUERY.addEventListener("change", () => this.closeMobile());

    // Swipe left on the sidebar to close it on touch devices
    let startX = 0;
    const sidebar = $<HTMLElement>("#sidebar");
    sidebar.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    sidebar.addEventListener("touchend", (e) => {
      if (startX - e.changedTouches[0].clientX > 60) this.closeMobile();
    });

    this.syncAria();
  }

  toggle(): void {
    if (MOBILE_QUERY.matches) {
      this.app.classList.contains("is-mobile-open") ? this.closeMobile() : this.openMobile();
    } else {
      this.toggleCollapsed();
    }
  }

  toggleCollapsed(): void {
    const collapsed = this.app.classList.toggle("is-collapsed");
    storageSet(STORAGE_KEY, collapsed ? "1" : "0");
    this.syncAria();
  }

  openMobile(): void {
    this.app.classList.add("is-mobile-open");
    this.backdrop.hidden = false;
    this.syncAria();
  }

  closeMobile(): void {
    this.app.classList.remove("is-mobile-open");
    this.backdrop.hidden = true;
    this.syncAria();
  }

  private syncAria(): void {
    const expanded = MOBILE_QUERY.matches
      ? this.app.classList.contains("is-mobile-open")
      : !this.app.classList.contains("is-collapsed");
    this.menuBtn.setAttribute("aria-expanded", String(expanded));
    this.collapseBtn.setAttribute("aria-label", expanded ? "Collapse sidebar" : "Expand sidebar");
  }
}

// ============ Dropdowns ============
class Dropdown {
  private static all: Dropdown[] = [];
  private trigger: HTMLButtonElement;
  private panel: HTMLElement;

  constructor(private root: HTMLElement, private onOpen?: () => void) {
    this.trigger = $<HTMLButtonElement>("button[aria-haspopup]", root);
    this.panel = $<HTMLElement>(".dropdown__panel", root);
    Dropdown.all.push(this);

    this.trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      this.isOpen ? this.close() : this.open();
    });

    // Close after picking a menu item
    this.panel.querySelectorAll<HTMLElement>(".menu-item").forEach((item) =>
      item.addEventListener("click", () => this.close()),
    );

    this.panel.addEventListener("keydown", (e) => this.handleKeys(e));
  }

  get isOpen(): boolean {
    return !this.panel.hidden;
  }

  open(): void {
    Dropdown.closeAll();
    this.panel.hidden = false;
    this.trigger.setAttribute("aria-expanded", "true");
    this.onOpen?.();
    this.panel.querySelector<HTMLElement>(".menu-item")?.focus();
  }

  close(returnFocus = false): void {
    if (!this.isOpen) return;
    this.panel.hidden = true;
    this.trigger.setAttribute("aria-expanded", "false");
    if (returnFocus) this.trigger.focus();
  }

  isInside(e: Event): boolean {
    // composedPath survives re-renders that detach the clicked node
    return e.composedPath().includes(this.root);
  }

  static closeAll(returnFocus = false): void {
    Dropdown.all.forEach((d) => d.close(returnFocus && d.isOpen));
  }

  static handleOutsideClick(e: Event): void {
    Dropdown.all.forEach((d) => { if (!d.isInside(e)) d.close(); });
  }

  private handleKeys(e: KeyboardEvent): void {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(this.panel.querySelectorAll<HTMLElement>(".menu-item"));
    const idx = items.indexOf(document.activeElement as HTMLElement);
    const next = e.key === "ArrowDown" ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
    items[next]?.focus();
  }
}

// ============ Notifications ============
class Notifications {
  private list = $<HTMLUListElement>("#notifList");
  private badge = $<HTMLSpanElement>("#notifBadge");
  private items: NotificationItem[] = [
    { id: 1, title: "Sam commented on “Q4 Roadmap”", time: "2 min ago", read: false },
    { id: 2, title: "New deployment succeeded", time: "18 min ago", read: false },
    { id: 3, title: "Priya invited you to “Design Review”", time: "1 hr ago", read: false },
    { id: 4, title: "Your weekly report is ready", time: "Yesterday", read: true },
  ];

  constructor() {
    $<HTMLButtonElement>("#markAllRead").addEventListener("click", (e) => {
      e.stopPropagation();
      this.items.forEach((n) => (n.read = true));
      this.render();
    });

    this.list.addEventListener("click", (e) => {
      const li = (e.target as HTMLElement).closest<HTMLLIElement>("[data-id]");
      if (!li) return;
      const item = this.items.find((n) => n.id === Number(li.dataset.id));
      if (item) item.read = true;
      this.render();
    });

    this.render();
  }

  private render(): void {
    const unread = this.items.filter((n) => !n.read).length;
    this.badge.textContent = unread > 9 ? "9+" : String(unread);
    this.badge.hidden = unread === 0;

    this.list.innerHTML = this.items.length
      ? this.items
          .map((n) => `
            <li class="notif-item${n.read ? " is-read" : ""}" data-id="${n.id}">
              <span class="notif-item__dot"></span>
              <div>
                <div class="notif-item__title">${escapeHtml(n.title)}</div>
                <div class="notif-item__time">${escapeHtml(n.time)}</div>
              </div>
            </li>`)
          .join("")
      : `<li class="notif-item"><span class="muted">You're all caught up</span></li>`;
  }
}

// ============ Search ============
class Search {
  private form = $<HTMLFormElement>("#searchForm");
  private input = $<HTMLInputElement>("#searchInput");
  private results = $<HTMLUListElement>("#searchResults");
  private matches: Route[] = [];
  private highlighted = -1;

  constructor() {
    this.input.addEventListener("input", () => this.update());
    this.input.addEventListener("focus", () => { if (this.input.value) this.update(); });
    this.input.addEventListener("keydown", (e) => this.handleKeys(e));
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.select(this.highlighted >= 0 ? this.highlighted : 0);
    });
    this.results.addEventListener("mousedown", (e) => {
      const li = (e.target as HTMLElement).closest<HTMLLIElement>("[data-index]");
      if (li) this.select(Number(li.dataset.index));
    });
    this.input.addEventListener("blur", () => this.hide());

    // Ctrl/Cmd + K focuses search
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.input.focus();
        this.input.select();
      }
    });
  }

  private update(): void {
    const q = this.input.value.trim().toLowerCase();
    if (!q) return this.hide();

    this.matches = ROUTES.filter(
      (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q),
    );
    this.highlighted = this.matches.length ? 0 : -1;
    this.renderResults();
    this.results.hidden = false;
  }

  private renderResults(): void {
    this.results.innerHTML = this.matches.length
      ? this.matches
          .map((r, i) => `<li role="option" data-index="${i}" class="${i === this.highlighted ? "is-highlighted" : ""}">${escapeHtml(r.title)} <span class="muted">— ${escapeHtml(r.description)}</span></li>`)
          .join("")
      : `<li class="empty">No results for “${escapeHtml(this.input.value)}”</li>`;
  }

  private handleKeys(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this.hide();
      this.input.blur();
      return;
    }
    if (!this.matches.length || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
    e.preventDefault();
    const n = this.matches.length;
    this.highlighted = e.key === "ArrowDown" ? (this.highlighted + 1) % n : (this.highlighted - 1 + n) % n;
    this.renderResults();
  }

  private select(index: number): void {
    const route = this.matches[index];
    if (!route) return;
    location.hash = `#/${route.id}`;
    this.input.value = "";
    this.hide();
    this.input.blur();
  }

  private hide(): void {
    this.results.hidden = true;
    this.matches = [];
    this.highlighted = -1;
  }
}

// ============ Router ============
class Router {
  private content = $<HTMLElement>("#content");
  private links = document.querySelectorAll<HTMLAnchorElement>(".nav-link");

  constructor(private sidebar: Sidebar) {
    window.addEventListener("hashchange", () => this.render());
    this.render();
  }

  private render(): void {
    const id = location.hash.replace(/^#\/?/, "") || DEFAULT_ROUTE;
    const route = ROUTES.find((r) => r.id === id);

    if (!route) {
      location.replace(`#/${DEFAULT_ROUTE}`);
      return;
    }

    this.content.innerHTML = route.render();
    document.title = `${route.title} · Nimbus`;
    this.links.forEach((link) => {
      const active = link.dataset.route === route.id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    if (MOBILE_QUERY.matches) this.sidebar.closeMobile();
  }
}

// ============ Bootstrap ============
function init(): void {
  const sidebar = new Sidebar();
  new Router(sidebar);
  new Search();
  new Notifications();
  new Dropdown($<HTMLElement>("#notifDropdown"));
  new Dropdown($<HTMLElement>("#userDropdown"));

  document.addEventListener("click", (e) => Dropdown.handleOutsideClick(e));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      Dropdown.closeAll(true);
      sidebar.closeMobile();
    }
  });

  $<HTMLButtonElement>("#themeToggle").addEventListener("click", () => {
    const root = document.documentElement;
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  });

  $<HTMLButtonElement>("#signOutBtn").addEventListener("click", () => {
    alert("Signed out (wire this up to your auth logic).");
  });
}

init();
