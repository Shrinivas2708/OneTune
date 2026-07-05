import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  AdminApiError,
  AdminOverview,
  AdminUserDetail,
  AdminUserSummary,
  clearAdminToken,
  fetchOverview,
  fetchUserDetail,
  fetchUsers,
  hasAdminToken,
  login,
} from "./admin-api";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatArtists(artists: Array<{ name: string }>) {
  return artists.map((a) => a.name).join(", ") || "Unknown";
}

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      onSuccess();
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(
          err.status === 403
            ? "This account is not an admin."
            : err.message,
        );
      } else {
        setError("Login failed. Check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <p className="admin-kicker">OneTune</p>
        <h1>Admin</h1>
        <p className="admin-muted">Sign in with your admin account.</p>
        <form onSubmit={handleSubmit} className="admin-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="admin-error">{error}</p> : null}
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="admin-stat">
      <span className="admin-stat-label">{label}</span>
      <strong className="admin-stat-value">{value}</strong>
    </div>
  );
}

function UserDetailPanel({
  detail,
  onClose,
}: {
  detail: AdminUserDetail;
  onClose: () => void;
}) {
  const { user, stats, topArtists, recentHistory } = detail;

  return (
    <aside className="admin-detail">
      <div className="admin-detail-header">
        <div>
          <h2>{user.displayName}</h2>
          <p className="admin-muted">{user.email}</p>
        </div>
        <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="admin-detail-stats">
        <StatCard label="Total plays" value={stats.totalPlays} />
        <StatCard label="Last played" value={formatDate(stats.lastPlayedAt)} />
        <StatCard label="Joined" value={formatDate(user.createdAt)} />
      </div>

      <section className="admin-section">
        <h3>Top artists</h3>
        {topArtists.length === 0 ? (
          <p className="admin-muted">No listening data yet.</p>
        ) : (
          <table className="admin-table admin-table-compact">
            <thead>
              <tr>
                <th>Artist</th>
                <th>Plays</th>
              </tr>
            </thead>
            <tbody>
              {topArtists.map((artist) => (
                <tr key={artist.name}>
                  <td>{artist.name}</td>
                  <td>{artist.playCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="admin-section">
        <h3>Recent history</h3>
        {recentHistory.length === 0 ? (
          <p className="admin-muted">No history.</p>
        ) : (
          <div className="admin-history-list">
            {recentHistory.map((entry) => (
              <div key={entry.id} className="admin-history-item">
                <div>
                  <strong>{entry.track.title}</strong>
                  <span className="admin-muted">
                    {formatArtists(entry.track.artists)}
                  </span>
                </div>
                <time dateTime={entry.playedAt}>{formatDate(entry.playedAt)}</time>
              </div>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}

function Dashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, usersData] = await Promise.all([
        fetchOverview(),
        fetchUsers(),
      ]);
      setOverview(overviewData);
      setUsers(usersData);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        clearAdminToken();
        window.location.reload();
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    void fetchUserDetail(selectedId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load user.");
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  function handleLogout() {
    clearAdminToken();
    window.location.reload();
  }

  const filteredUsers = users.filter((user) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      user.displayName.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      (user.topArtist?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">OneTune Admin</p>
          <h1>Listening analytics</h1>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => void load()}>
            Refresh
          </button>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      {error ? <p className="admin-banner admin-banner-error">{error}</p> : null}

      {loading ? (
        <p className="admin-loading">Loading…</p>
      ) : (
        <>
          {overview ? (
            <section className="admin-overview">
              <StatCard label="Users" value={overview.totalUsers} />
              <StatCard label="Active listeners" value={overview.usersWithPlays} />
              <StatCard label="Total plays" value={overview.totalPlays} />
            </section>
          ) : null}

          {overview && overview.topArtistsGlobal.length > 0 ? (
            <section className="admin-section admin-global-artists">
              <h2>Top artists (all users)</h2>
              <div className="admin-chip-row">
                {overview.topArtistsGlobal.map((artist) => (
                  <span key={artist.name} className="admin-chip">
                    {artist.name}
                    <em>{artist.playCount}</em>
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="admin-section admin-users-section">
            <div className="admin-section-head">
              <h2>Users</h2>
              <input
                type="search"
                className="admin-search"
                placeholder="Search name, email, artist…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="admin-users-layout">
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Plays</th>
                      <th>Top artist</th>
                      <th>Last played</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className={selectedId === user.id ? "is-selected" : ""}
                        onClick={() => setSelectedId(user.id)}
                      >
                        <td>
                          <strong>{user.displayName}</strong>
                          <span className="admin-muted">{user.email}</span>
                        </td>
                        <td>{user.totalPlays}</td>
                        <td>{user.topArtist ?? "—"}</td>
                        <td>{formatDate(user.lastPlayedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedId ? (
                detailLoading || !detail ? (
                  <div className="admin-detail admin-detail-placeholder">
                    Loading user…
                  </div>
                ) : (
                  <UserDetailPanel detail={detail} onClose={() => setSelectedId(null)} />
                )
              ) : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default function AdminApp() {
  const [authed, setAuthed] = useState(hasAdminToken());

  return (
    <div className="admin-root">
      {authed ? (
        <Dashboard />
      ) : (
        <LoginScreen onSuccess={() => setAuthed(true)} />
      )}
    </div>
  );
}
