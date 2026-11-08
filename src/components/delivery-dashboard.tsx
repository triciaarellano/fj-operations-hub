"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDownToLine, ArrowRight, ArrowUpDown, BookOpen, CalendarDays, Check, CheckCheck, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Database, FileSpreadsheet, GraduationCap, LayoutDashboard, Menu, RefreshCw, Search, ShieldCheck, SlidersHorizontal, Users, X, type LucideIcon } from "lucide-react";
import { COHORTS, PATHWAYS, SAMPLE_LEARNERS, fetchLearners, type Learner, type LearnerResponse } from "@/lib/learners";

type View = "overview" | "learners" | "lectures";
const navigation: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "learners", label: "Learner directory", icon: Users },
  { id: "lectures", label: "Lecture schedule", icon: CalendarDays },
];
const viewTitles: Record<View, string> = { overview: "Francis James Delivery Dashboard", learners: "Learner directory", lectures: "Lecture schedule" };
const PAGE_SIZE = 8;

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label className="filter-select"><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}><option value="all">All {label.toLowerCase()}</option>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} aria-hidden="true" /></label>;
}

function MetricCard({ label, value, icon: Icon, tone, children }: { label: string; value: number; icon: LucideIcon; tone: string; children: ReactNode }) {
  return <article className={`metric-card ${tone}`}><div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={19} strokeWidth={1.7} /></span></div><div className="metric-number">{value}<span className="metric-spark" aria-hidden="true">{[35, 52, 44, 65, 58, 78, 70, 91, 83, 100].map((height, i) => <i key={i} style={{ height: `${height}%`, opacity: 0.3 + i * 0.07 }} />)}</span></div><div className="metric-description">{children}</div></article>;
}

export function DeliveryDashboard() {
  const [data, setData] = useState<LearnerResponse>({ learners: SAMPLE_LEARNERS, source: "sample", message: "Sample data is displayed. Connect your Google Sheet to see live learners.", updatedAt: "" });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("overview");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [pathway, setPathway] = useState("all");
  const [cohort, setCohort] = useState("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"source" | "asc" | "desc">("source");
  const [mobileNav, setMobileNav] = useState(false);
  const [dialogContent, setDialogContent] = useState<"integration" | "help" | Learner>("integration");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setRefreshing(true);
    setError("");
    try {
      const result = await fetchLearners(controller.signal);
      if (!controller.signal.aborted) { setData(result); setPage(1); }
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to refresh learner data.");
    } finally {
      if (!controller.signal.aborted) setRefreshing(false);
    }
  }, []);

  useEffect(() => { void refresh(); return () => requestRef.current?.abort(); }, [refresh]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") { event.preventDefault(); document.getElementById("learner-search")?.focus(); }
      if (event.key === "Escape") setMobileNav(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const counts = useMemo(() => ({
    total: data.learners.length,
    l4: data.learners.filter((learner) => learner.level === 4).length,
    l5: data.learners.filter((learner) => learner.level === 5).length,
    l6: data.learners.filter((learner) => learner.level === 6).length,
  }), [data.learners]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = data.learners.filter((learner) =>
      (!query || [learner.name, learner.email, learner.id].some((value) => value.toLowerCase().includes(query))) &&
      (level === "all" || learner.level === Number(level.replace("Level ", ""))) &&
      (pathway === "all" || learner.pathway === pathway) &&
      (cohort === "all" || learner.cohort === cohort));
    return sort === "source" ? result : result.sort((a, b) => sort === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  }, [data.learners, search, level, pathway, cohort, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = search || level !== "all" || pathway !== "all" || cohort !== "all";
  const changeFilter = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };
  const resetFilters = () => { setSearch(""); setLevel("all"); setPathway("all"); setCohort("all"); setPage(1); };
  const navigate = (next: View) => { setView(next); resetFilters(); setMobileNav(false); };
  const openDialog = (content: typeof dialogContent) => { setDialogContent(content); setMobileNav(false); dialogRef.current?.showModal(); };
  const exportCsv = () => {
    const header = ["Learner No / ID", "Learner Name", "Email", "Level", "Lecture Nights", "Study Pathway", "Bridging / Special Requirements", "Comments / Notes", "Cohort / Intake"];
    const escape = (value: string | number) => `"${String(value).replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""')}"`;
    const csv = [header, ...filtered.map((l) => [l.id, l.name, l.email, l.level, l.lectureNights, l.pathway, l.requirements, l.notes, l.cohort])].map((row) => row.map(escape).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `francis-james-learners-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(url);
  };

  return <div className="dashboard-shell">
    <a href="#main-content" className="skip-link">Skip to dashboard</a>
    {mobileNav && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <a className="brand" href="/" aria-label="Francis James dashboard"><span className="brand-mark">fj<span>.</span></span><span className="brand-name">FRANCIS JAMES<small>BUILDING FUTURES</small></span></a>
      <div className="workspace-label"><span className="workspace-icon"><GraduationCap size={17} /></span><div>Staff workspace<small>Delivery & operations</small></div><span className="workspace-dot" /></div>
      <div className="nav-section-label">WORKSPACE</div>
      <nav aria-label="Main navigation">{navigation.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => navigate(id)} className={`nav-item ${view === id ? "active" : ""}`} aria-current={view === id ? "page" : undefined}><Icon size={18} strokeWidth={1.7} /><span>{label}</span></button>)}</nav>
      <div className="nav-section-label tools-label">MANAGEMENT</div>
      <button className="nav-item" onClick={() => openDialog("integration")}><Database size={18} strokeWidth={1.7} /><span>Data integration</span><span className={`connection-dot ${data.source === "sample" ? "demo" : ""}`} /></button>
      <div className="sidebar-bottom"><div className="sheet-card"><span className="sheet-icon"><FileSpreadsheet size={20} /></span><strong>Your data, connected.</strong><p>A single view of your delivery spreadsheet.</p><button onClick={() => openDialog("integration")}>{data.source === "sample" ? "Connect Google Sheet" : "View connection"}<ArrowRight size={14} /></button></div><button className="help-link" onClick={() => openDialog("help")}><CircleHelp size={17} />Help & support<ArrowRight size={14} /></button><div className="sidebar-user"><span className="user-avatar">FJ</span><span>Delivery team<small>Staff administrator</small></span><ShieldCheck size={16} /></div></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="breadcrumb"><button className="icon-button menu-toggle" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={20} /></button><span className="breadcrumb-home">Workspace</span><ChevronRight size={13} /><span>{navigation.find((n) => n.id === view)?.label}</span></div><div className="topbar-right"><span className="internal-badge"><ShieldCheck size={13} />Internal staff portal</span><span className="topbar-divider" /><span className="topbar-avatar">FJ</span></div></header>
      <main id="main-content" className="main-content">
        <div className="page-heading"><div><div className="eyebrow">DELIVERY & OPERATIONS</div><h1>{viewTitles[view]}</h1><p>Your learners and lectures. All in one place.</p></div><button className="primary-button" onClick={() => void refresh()} disabled={refreshing}><RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />{refreshing ? "Refreshing…" : "Refresh Data"}</button></div>
        <div className="sync-line" aria-live="polite"><span className={`connection-dot ${data.source === "sample" ? "demo" : ""}`} /><span>{data.source === "sample" ? "Sample data" : "Google Sheets connected"}</span><span className="sync-separator">·</span><span>{refreshing ? "Checking for updates…" : data.updatedAt ? `Last refreshed at ${new Date(data.updatedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : "Ready to connect your Google Sheet"}</span><button onClick={() => openDialog("integration")}>View data source<ArrowRight size={12} /></button></div>
        {error && <div role="alert" className="error-banner">{error} Your displayed data has been retained.<button onClick={() => void refresh()}>Try again</button></div>}
        <section className="metrics-grid" aria-label="Learner overview">
          <MetricCard label="Total active learners" value={counts.total} icon={Users} tone="slate"><span className="tiny-dot green" />Across all levels & pathways</MetricCard>
          <MetricCard label="Level 4 learners" value={counts.l4} icon={BookOpen} tone="blue"><CalendarDays size={13} />Tuesday & Thursday lectures</MetricCard>
          <MetricCard label="Level 5 learners" value={counts.l5} icon={GraduationCap} tone="purple"><CalendarDays size={13} />Monday & Wednesday lectures</MetricCard>
          <MetricCard label="Level 6 learners" value={counts.l6} icon={GraduationCap} tone="emerald"><CalendarDays size={13} />Monday & Wednesday lectures</MetricCard>
        </section>

        {view === "lectures" ? <section className="schedule-full"><div className="section-heading"><div><h2>Your teaching week</h2><p>Recurring lecture nights by learner level.</p></div><span className="subtle-badge">Weekly schedule</span></div><div className="week-grid">{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, i) => <article key={day} className="week-day"><div className="week-day-title">{day}<CalendarDays size={16} /></div>{i < 4 ? <><span className={`level-badge level-${i % 2 === 0 ? 5 : 4}`}>{i % 2 === 0 ? "Level 5 & 6" : "Level 4"}</span><h3>{i % 2 === 0 ? "Higher level lectures" : "Level 4 lectures"}</h3><p><Users size={14} />{i % 2 === 0 ? (counts.l5 + counts.l6) : counts.l4} learners</p><span className="schedule-note">All study pathways</span></> : <p className="no-lectures">No scheduled lectures</p>}</article>)}</div><div className="schedule-footnote"><CircleHelp size={15} />Lecture times and meeting links are managed by the delivery team.</div></section> : <section className="learner-panel" aria-labelledby="learner-heading">
          <div className="panel-heading"><div className="panel-title"><h2 id="learner-heading">Learner overview</h2><span className="count-badge">{counts.total} learners</span></div><button className="secondary-button export-button" onClick={exportCsv} disabled={filtered.length === 0}><ArrowDownToLine size={15} />Export CSV</button></div>
          <div className="filters"><div className="search-field"><Search size={17} /><label htmlFor="learner-search" className="sr-only">Search by learner name, email or ID</label><input id="learner-search" placeholder="Search by name, email or learner ID…" value={search} onChange={(event) => changeFilter(setSearch, event.target.value)} />{search ? <button className="clear-search" aria-label="Clear search" onClick={() => changeFilter(setSearch, "")}><X size={14} /></button> : <kbd>⌘ K</kbd>}</div><div className="filter-group"><FilterSelect label="levels" value={level} options={["Level 4", "Level 5", "Level 6"]} onChange={(value) => changeFilter(setLevel, value)} /><FilterSelect label="pathways" value={pathway} options={PATHWAYS} onChange={(value) => changeFilter(setPathway, value)} /><FilterSelect label="intakes" value={cohort} options={COHORTS} onChange={(value) => changeFilter(setCohort, value)} /><span className="filters-icon" title="Filter learners"><SlidersHorizontal size={16} /></span></div></div>
          {hasFilters && <div className="filter-summary"><span>{filtered.length} matching learner{filtered.length !== 1 ? "s" : ""}</span><button onClick={resetFilters}>Clear filters<X size={12} /></button></div>}
          <div id="learner-results">
            <div className="table-scroll" tabIndex={0} role="region" aria-label="Learner records; scroll horizontally for all columns" aria-busy={refreshing}>
              <table><caption className="sr-only">Learner records with lecture nights, study pathways, requirements and notes.</caption><thead><tr><th>Learner ID</th><th><button className="sort-button" onClick={() => setSort(sort === "asc" ? "desc" : "asc")}>Learner name<ArrowUpDown size={12} /></button></th><th>Email address</th><th>Level</th><th>Lecture nights</th><th>Study pathway</th><th>Special requirements</th><th>Comments / notes</th></tr></thead><tbody>{visible.map((learner, i) => <tr key={learner.id}><td className="learner-id">{learner.id}</td><td><button className="learner-name" onClick={() => openDialog(learner)}><span className={`learner-avatar avatar-${i % 4}`}>{learner.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span><span>{learner.name}</span></button></td><td><a className="email-link" href={`mailto:${learner.email}`}>{learner.email}</a></td><td><span className={`level-badge level-${learner.level}`}>Level {learner.level}</span></td><td><span className="lecture-cell"><CalendarDays size={12} />{learner.lectureNights}</span></td><td className="pathway-cell">{learner.pathway}</td><td>{learner.requirements ? <span className="requirement-tag">{learner.requirements}</span> : <span className="empty-value">—</span>}</td><td className="notes-cell">{learner.notes || "—"}</td></tr>)}</tbody></table>
              {filtered.length === 0 && <div className="empty-state"><span><Search size={25} /></span><h3>No learners found</h3><p>Try a different search or adjust your filters.</p><button className="secondary-button" onClick={resetFilters}>Clear all filters</button></div>}
            </div>
          </div>
          <div className="pagination"><span aria-live="polite">Showing <strong>{filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> learners</span><div className="pagination-buttons"><button className="pagination-arrow" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={15} /></button>{Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map((p, i, pages) => <span className="page-number-wrap" key={p}>{i > 0 && p - pages[i - 1] > 1 && <span className="page-ellipsis">…</span>}<button className={`page-number ${currentPage === p ? "current" : ""}`} aria-label={`Page ${p}`} aria-current={currentPage === p ? "page" : undefined} onClick={() => setPage(p)}>{p}</button></span>)}<button className="pagination-arrow" aria-label="Next page" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={15} /></button></div></div>
        </section>}

        <div className="bottom-grid"><section className="summary-card lecture-summary"><div className="summary-heading"><h2><CalendarDays size={17} />Weekly lecture nights</h2><button className="text-link" onClick={() => navigate("lectures")}>View schedule<ArrowRight size={13} /></button></div><div className="lecture-groups"><div className="lecture-group"><span className="day-icon blue-days">T<span>T</span></span><div><strong>Tuesday & Thursday</strong><p>Level 4<span>·</span>{counts.l4} learners</p></div><span className="level-badge level-4">L4</span></div><div className="lecture-group"><span className="day-icon purple-days">M<span>W</span></span><div><strong>Monday & Wednesday</strong><p>Levels 5 & 6<span>·</span>{(counts.l5 + counts.l6)} learners</p></div><span className="level-badge level-5">L5 / L6</span></div></div></section>
        </div>
        <footer className="page-footer"><span>Francis James<span className="footer-dot">·</span>Building futures through education.</span><span><ShieldCheck size={13} />Staff access only</span></footer>
      </main>
    </div>
    <dialog ref={dialogRef} aria-label={typeof dialogContent === "string" ? dialogContent === "integration" ? "Google Sheets connection" : "Dashboard help" : `Learner record: ${dialogContent.name}`} className="detail-dialog" onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}><div className="dialog-content"><button className="dialog-close icon-button" aria-label="Close dialog" onClick={() => dialogRef.current?.close()}><X size={20} /></button>{typeof dialogContent === "string" ? dialogContent === "integration" ? <><span className="dialog-icon"><FileSpreadsheet size={25} /></span><div className="eyebrow">DATA INTEGRATION</div><h2>Connect your Google Sheet</h2><p>{data.message}</p><ol className="setup-steps"><li>Deploy your Google Apps Script as a Web App that returns learner records as JSON.</li><li>Copy <code>.env.example</code> to <code>.env.local</code> and set <code>GOOGLE_APPS_SCRIPT_URL</code> to your deployment’s <code>/exec</code> URL.</li><li>Restart the app and select <strong>Refresh Data</strong>.</li></ol><div className="dialog-info"><ShieldCheck size={18} /><span>The endpoint is called on the server. Your deployment URL stays out of the browser.</span></div><button className="primary-button" onClick={() => { dialogRef.current?.close(); void refresh(); }}><RefreshCw size={15} />Check connection</button></> : <><span className="dialog-icon"><CircleHelp size={25} /></span><div className="eyebrow">STAFF WORKSPACE</div><h2>A clearer view of delivery</h2><p>Search by name, email or learner ID. Combine level, pathway and intake filters to narrow your view.</p><ul className="help-list"><li><Search size={17} /><span>Use <kbd>⌘ / Ctrl + K</kbd> to jump to learner search.</span></li><li><Users size={17} /><span>Select a learner’s name to view their full record.</span></li><li><ArrowDownToLine size={17} /><span>Export CSV downloads all records matching your current filters.</span></li><li><CheckCheck size={17} /><span>Update learner records in your source Google Sheet, then refresh the dashboard.</span></li></ul></> : <><div className="eyebrow">LEARNER RECORD</div><h2>{dialogContent.name}</h2><p>{dialogContent.id}<span className="footer-dot">·</span>{dialogContent.cohort} intake</p><div className="learner-detail-badges"><span className={`level-badge level-${dialogContent.level}`}>Level {dialogContent.level}</span></div><dl className="learner-details"><div><dt>Email address</dt><dd><a href={`mailto:${dialogContent.email}`}>{dialogContent.email}</a></dd></div><div><dt>Study pathway</dt><dd>{dialogContent.pathway}</dd></div><div><dt>Lecture nights</dt><dd>{dialogContent.lectureNights}</dd></div><div><dt>Bridging / special requirements</dt><dd>{dialogContent.requirements || "None recorded"}</dd></div><div><dt>Comments / notes</dt><dd>{dialogContent.notes || "No notes recorded"}</dd></div></dl><div className="dialog-info"><Check size={17} /><span>Records are managed in the delivery spreadsheet.</span></div></>}</div></dialog>
  </div>;
}
