"use strict";
// ============ Helpers ============
const MOBILE_QUERY = window.matchMedia("(max-width: 900px)");
const STORAGE_KEY = "spa-shell:sidebar-collapsed";
function $(selector, root = document) {
    const el = root.querySelector(selector);
    if (!el)
        throw new Error(`Element not found: ${selector}`);
    return el;
}
function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}
function storageGet(key) {
    try {
        return localStorage.getItem(key);
    }
    catch {
        return null;
    }
}
function storageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    }
    catch { /* storage unavailable */ }
}
// ============ Routes ============
const page = (title, description, body = "") => `<h1>${title}</h1><p>${description}</p>${body}`;
const statCards = (stats) => `<div class="cards">${stats
    .map(([label, value]) => `<div class="card"><div class="card__label">${label}</div><div class="card__value">${value}</div></div>`)
    .join("")}</div>`;
const ROUTES = [
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
    constructor() {
        this.app = $("#app");
        this.menuBtn = $("#menuBtn");
        this.collapseBtn = $("#collapseBtn");
        this.backdrop = $("#backdrop");
        if (storageGet(STORAGE_KEY) === "1")
            this.app.classList.add("is-collapsed");
        this.menuBtn.addEventListener("click", () => this.toggle());
        this.collapseBtn.addEventListener("click", () => this.toggleCollapsed());
        this.backdrop.addEventListener("click", () => this.closeMobile());
        MOBILE_QUERY.addEventListener("change", () => this.closeMobile());
        // Swipe left on the sidebar to close it on touch devices
        let startX = 0;
        const sidebar = $("#sidebar");
        sidebar.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
        sidebar.addEventListener("touchend", (e) => {
            if (startX - e.changedTouches[0].clientX > 60)
                this.closeMobile();
        });
        this.syncAria();
    }
    toggle() {
        if (MOBILE_QUERY.matches) {
            this.app.classList.contains("is-mobile-open") ? this.closeMobile() : this.openMobile();
        }
        else {
            this.toggleCollapsed();
        }
    }
    toggleCollapsed() {
        const collapsed = this.app.classList.toggle("is-collapsed");
        storageSet(STORAGE_KEY, collapsed ? "1" : "0");
        this.syncAria();
    }
    openMobile() {
        this.app.classList.add("is-mobile-open");
        this.backdrop.hidden = false;
        this.syncAria();
    }
    closeMobile() {
        this.app.classList.remove("is-mobile-open");
        this.backdrop.hidden = true;
        this.syncAria();
    }
    syncAria() {
        const expanded = MOBILE_QUERY.matches
            ? this.app.classList.contains("is-mobile-open")
            : !this.app.classList.contains("is-collapsed");
        this.menuBtn.setAttribute("aria-expanded", String(expanded));
        this.collapseBtn.setAttribute("aria-label", expanded ? "Collapse sidebar" : "Expand sidebar");
    }
}
// ============ Dropdowns ============
class Dropdown {
    constructor(root, onOpen) {
        this.root = root;
        this.onOpen = onOpen;
        this.trigger = $("button[aria-haspopup]", root);
        this.panel = $(".dropdown__panel", root);
        Dropdown.all.push(this);
        this.trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            this.isOpen ? this.close() : this.open();
        });
        // Close after picking a menu item
        this.panel.querySelectorAll(".menu-item").forEach((item) => item.addEventListener("click", () => this.close()));
        this.panel.addEventListener("keydown", (e) => this.handleKeys(e));
    }
    get isOpen() {
        return !this.panel.hidden;
    }
    open() {
        Dropdown.closeAll();
        this.panel.hidden = false;
        this.trigger.setAttribute("aria-expanded", "true");
        this.onOpen?.();
        this.panel.querySelector(".menu-item")?.focus();
    }
    close(returnFocus = false) {
        if (!this.isOpen)
            return;
        this.panel.hidden = true;
        this.trigger.setAttribute("aria-expanded", "false");
        if (returnFocus)
            this.trigger.focus();
    }
    isInside(e) {
        // composedPath survives re-renders that detach the clicked node
        return e.composedPath().includes(this.root);
    }
    static closeAll(returnFocus = false) {
        Dropdown.all.forEach((d) => d.close(returnFocus && d.isOpen));
    }
    static handleOutsideClick(e) {
        Dropdown.all.forEach((d) => { if (!d.isInside(e))
            d.close(); });
    }
    handleKeys(e) {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp")
            return;
        e.preventDefault();
        const items = Array.from(this.panel.querySelectorAll(".menu-item"));
        const idx = items.indexOf(document.activeElement);
        const next = e.key === "ArrowDown" ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
        items[next]?.focus();
    }
}
Dropdown.all = [];
// ============ Notifications ============
class Notifications {
    constructor() {
        this.list = $("#notifList");
        this.badge = $("#notifBadge");
        this.items = [
            { id: 1, title: "Sam commented on “Q4 Roadmap”", time: "2 min ago", read: false },
            { id: 2, title: "New deployment succeeded", time: "18 min ago", read: false },
            { id: 3, title: "Priya invited you to “Design Review”", time: "1 hr ago", read: false },
            { id: 4, title: "Your weekly report is ready", time: "Yesterday", read: true },
        ];
        $("#markAllRead").addEventListener("click", (e) => {
            e.stopPropagation();
            this.items.forEach((n) => (n.read = true));
            this.render();
        });
        this.list.addEventListener("click", (e) => {
            const li = e.target.closest("[data-id]");
            if (!li)
                return;
            const item = this.items.find((n) => n.id === Number(li.dataset.id));
            if (item)
                item.read = true;
            this.render();
        });
        this.render();
    }
    render() {
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
    constructor() {
        this.form = $("#searchForm");
        this.input = $("#searchInput");
        this.results = $("#searchResults");
        this.matches = [];
        this.highlighted = -1;
        this.input.addEventListener("input", () => this.update());
        this.input.addEventListener("focus", () => { if (this.input.value)
            this.update(); });
        this.input.addEventListener("keydown", (e) => this.handleKeys(e));
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.select(this.highlighted >= 0 ? this.highlighted : 0);
        });
        this.results.addEventListener("mousedown", (e) => {
            const li = e.target.closest("[data-index]");
            if (li)
                this.select(Number(li.dataset.index));
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
    update() {
        const q = this.input.value.trim().toLowerCase();
        if (!q)
            return this.hide();
        this.matches = ROUTES.filter((r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
        this.highlighted = this.matches.length ? 0 : -1;
        this.renderResults();
        this.results.hidden = false;
    }
    renderResults() {
        this.results.innerHTML = this.matches.length
            ? this.matches
                .map((r, i) => `<li role="option" data-index="${i}" class="${i === this.highlighted ? "is-highlighted" : ""}">${escapeHtml(r.title)} <span class="muted">— ${escapeHtml(r.description)}</span></li>`)
                .join("")
            : `<li class="empty">No results for “${escapeHtml(this.input.value)}”</li>`;
    }
    handleKeys(e) {
        if (e.key === "Escape") {
            this.hide();
            this.input.blur();
            return;
        }
        if (!this.matches.length || (e.key !== "ArrowDown" && e.key !== "ArrowUp"))
            return;
        e.preventDefault();
        const n = this.matches.length;
        this.highlighted = e.key === "ArrowDown" ? (this.highlighted + 1) % n : (this.highlighted - 1 + n) % n;
        this.renderResults();
    }
    select(index) {
        const route = this.matches[index];
        if (!route)
            return;
        location.hash = `#/${route.id}`;
        this.input.value = "";
        this.hide();
        this.input.blur();
    }
    hide() {
        this.results.hidden = true;
        this.matches = [];
        this.highlighted = -1;
    }
}
// ============ Router ============
class Router {
    constructor(sidebar) {
        this.sidebar = sidebar;
        this.content = $("#content");
        this.links = document.querySelectorAll(".nav-link");
        window.addEventListener("hashchange", () => this.render());
        this.render();
    }
    render() {
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
            if (active)
                link.setAttribute("aria-current", "page");
            else
                link.removeAttribute("aria-current");
        });
        if (MOBILE_QUERY.matches)
            this.sidebar.closeMobile();
    }
}
// ============ Bootstrap ============
function init() {
    const sidebar = new Sidebar();
    new Router(sidebar);
    new Search();
    new Notifications();
    new Dropdown($("#notifDropdown"));
    new Dropdown($("#userDropdown"));
    document.addEventListener("click", (e) => Dropdown.handleOutsideClick(e));
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            Dropdown.closeAll(true);
            sidebar.closeMobile();
        }
    });
    $("#themeToggle").addEventListener("click", () => {
        const root = document.documentElement;
        root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    });
    $("#signOutBtn").addEventListener("click", () => {
        alert("Signed out (wire this up to your auth logic).");
    });
}
init();
//# sourceMappingURL=app.js.map