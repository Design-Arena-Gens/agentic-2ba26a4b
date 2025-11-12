"use client";
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';

type Player = { id: string; name: string; ign: string; rank?: string };

type Tournament = {
  id: string;
  name: string;
  game: string;
  date: string; // ISO
  teams: string[]; // team names
  rules: string;
};

type Announcement = { id: string; title: string; message: string; createdAt: string };

type PhoneMessage = { to: string; message: string };

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState] as const;
}

export default function Dashboard() {
  const [players, setPlayers] = useLocalStorage<Player[]>(
    'players',
    [
      { id: uid(), name: 'Aman', ign: 'AMAN_OP', rank: 'Diamond' },
      { id: uid(), name: 'Priya', ign: 'PR1YA', rank: 'Platinum' },
    ]
  );
  const [tournaments, setTournaments] = useLocalStorage<Tournament[]>(
    'tournaments',
    [
      {
        id: uid(),
        name: 'Weekend Scrims',
        game: 'BGMI',
        date: new Date(Date.now() + 86400000).toISOString(),
        teams: ['Team Alpha', 'Team Bravo'],
        rules: 'No stream sniping. Respect all players. Best of 3.',
      },
    ]
  );
  const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>(
    'announcements',
    []
  );

  const [formPlayer, setFormPlayer] = useState({ name: '', ign: '', rank: '' });
  const [formT, setFormT] = useState({ name: '', game: '', date: '', rules: '' });
  const [teamName, setTeamName] = useState('');
  const [sendPreview, setSendPreview] = useState('');
  const [sendTo, setSendTo] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string>('');

  const nextEventText = useMemo(() => {
    if (tournaments.length === 0) return 'No upcoming events.';
    const sorted = [...tournaments].sort((a, b) => a.date.localeCompare(b.date));
    const t = sorted[0];
    return `Next Event: ${t.name} (${t.game}) on ${format(new Date(t.date), 'dd MMM, hh:mm a')}`;
  }, [tournaments]);

  function addPlayer() {
    if (!formPlayer.name || !formPlayer.ign) return;
    setPlayers((p) => [...p, { id: uid(), ...formPlayer }]);
    setFormPlayer({ name: '', ign: '', rank: '' });
  }

  function removePlayer(id: string) {
    setPlayers((p) => p.filter((x) => x.id !== id));
  }

  function addTournament() {
    if (!formT.name || !formT.game || !formT.date) return;
    setTournaments((l) => [
      ...l,
      { id: uid(), name: formT.name, game: formT.game, date: new Date(formT.date).toISOString(), teams: [], rules: formT.rules || 'Fair play.' },
    ]);
    setFormT({ name: '', game: '', date: '', rules: '' });
  }

  function addTeam(tId: string) {
    if (!teamName) return;
    setTournaments((l) => l.map((t) => (t.id === tId ? { ...t, teams: [...t.teams, teamName] } : t)));
    setTeamName('');
  }

  function createAnnouncementTemplate(t: Tournament) {
    const text = `?? Tournament Update\n\n${t.name} (${t.game})\nDate: ${format(new Date(t.date), 'dd MMM yyyy, hh:mm a')}\nTeams: ${t.teams.join(', ') || 'TBD'}\nRules: ${t.rules}\n\nAll the best!`;
    setSendPreview(text);
  }

  function addAnnouncement() {
    if (!sendPreview.trim()) return;
    const a: Announcement = { id: uid(), title: 'Announcement', message: sendPreview, createdAt: new Date().toISOString() };
    setAnnouncements((l) => [a, ...l]);
    setSendPreview('');
  }

  async function sendWhatsApp() {
    setSending(true);
    setSendResult('');
    try {
      const payload: PhoneMessage = { to: sendTo.trim(), message: sendPreview.trim() };
      const res = await fetch('/api/whatsapp/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      setSendResult(res.ok ? `Sent: ${JSON.stringify(data)}` : `Error: ${data?.error || res.statusText}`);
    } catch (e: any) {
      setSendResult(`Error: ${e?.message || 'Failed'}`);
    } finally {
      setSending(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Group Snapshot</h2>
        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="badge">Players: {players.length}</span>
          <span className="badge">Events: {tournaments.length}</span>
          <span className="badge">Announcements: {announcements.length}</span>
        </div>
        <hr />
        <div className="small">{nextEventText}</div>
      </section>

      <section className="card">
        <h2>Players</h2>
        <div className="row">
          <div style={{ flex: 1 }}>
            <label className="label">Name</label>
            <input className="input" value={formPlayer.name} onChange={(e) => setFormPlayer({ ...formPlayer, name: e.target.value })} placeholder="Real name" />
          </div>
          <div style={{ flex: 1 }}>
            <label className="label">In-Game Name</label>
            <input className="input" value={formPlayer.ign} onChange={(e) => setFormPlayer({ ...formPlayer, ign: e.target.value })} placeholder="IGN" />
          </div>
          <div style={{ width: 150 }}>
            <label className="label">Rank</label>
            <input className="input" value={formPlayer.rank} onChange={(e) => setFormPlayer({ ...formPlayer, rank: e.target.value })} placeholder="e.g. Diamond" />
          </div>
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <button className="button" onClick={addPlayer}>Add Player</button>
        </div>
        <hr />
        <div>
          {players.map((p) => (
            <div key={p.id} className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <strong>{p.name}</strong> <span className="small">({p.ign}{p.rank ? ` ? ${p.rank}` : ''})</span>
              </div>
              <button className="button secondary" onClick={() => removePlayer(p.id)}>Remove</button>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Tournaments</h2>
        <div className="row">
          <div style={{ flex: 1 }}>
            <label className="label">Name</label>
            <input className="input" value={formT.name} onChange={(e) => setFormT({ ...formT, name: e.target.value })} placeholder="Event name" />
          </div>
          <div style={{ width: 160 }}>
            <label className="label">Game</label>
            <input className="input" value={formT.game} onChange={(e) => setFormT({ ...formT, game: e.target.value })} placeholder="e.g. BGMI" />
          </div>
          <div style={{ width: 220 }}>
            <label className="label">Date & Time</label>
            <input className="input" type="datetime-local" value={formT.date} onChange={(e) => setFormT({ ...formT, date: e.target.value })} />
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <label className="label">Rules</label>
          <textarea className="input" rows={3} value={formT.rules} onChange={(e) => setFormT({ ...formT, rules: e.target.value })} placeholder="Key rules" />
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <button className="button" onClick={addTournament}>Add Tournament</button>
        </div>
        <hr />
        {tournaments.map((t) => (
          <div key={t.id} className="card" style={{ padding: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <strong>{t.name}</strong> <span className="small">({t.game}) ? {format(new Date(t.date), 'dd MMM, hh:mm a')}</span>
              </div>
              <button className="button secondary" onClick={() => createAnnouncementTemplate(t)}>Create Announcement</button>
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <input className="input" placeholder="Add team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
              <button className="button" onClick={() => addTeam(t.id)}>Add Team</button>
            </div>
            <div className="small" style={{ marginTop: 8 }}>Teams: {t.teams.join(', ') || 'TBD'}</div>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Announcements</h2>
        <label className="label">Message</label>
        <textarea className="input" rows={6} value={sendPreview} onChange={(e) => setSendPreview(e.target.value)} placeholder="Compose announcement or use template from Tournaments" />
        <div className="row" style={{ marginTop: 8 }}>
          <button className="button" onClick={addAnnouncement}>Save</button>
          <button className="button secondary" onClick={() => copy(sendPreview)}>Copy for WhatsApp</button>
        </div>
        <hr />
        <div className="small">Send via WhatsApp Cloud API (1:1 broadcast)</div>
        <div className="row" style={{ marginTop: 6 }}>
          <input className="input" placeholder="Phone in E.164 (e.g. +911234567890)" value={sendTo} onChange={(e) => setSendTo(e.target.value)} />
          <button className="button" disabled={sending || !sendPreview || !sendTo} onClick={sendWhatsApp}>{sending ? 'Sending...' : 'Send'}</button>
        </div>
        {sendResult && (
          <div className="small" style={{ marginTop: 8 }}>
            <pre>{sendResult}</pre>
          </div>
        )}
        <hr />
        {announcements.map((a) => (
          <div key={a.id} className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <strong>{a.title}</strong> <span className="small">{format(new Date(a.createdAt), 'dd MMM, hh:mm a')}</span>
              <div className="small">{a.message.slice(0, 120)}{a.message.length > 120 ? '?' : ''}</div>
            </div>
            <button className="button secondary" onClick={() => copy(a.message)}>Copy</button>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Quick Templates</h2>
        <div className="row">
          <button className="button secondary" onClick={() => setSendPreview('?? Scrims tonight 8 PM. Room ID/Pass 15 mins before. Be on time!')}>
            Scrims Reminder
          </button>
          <button className="button secondary" onClick={() => setSendPreview('?? Registration open! Send IGN, Rank, Role by 6 PM.')}>
            Registration Open
          </button>
          <button className="button secondary" onClick={() => setSendPreview('? Results posted. GG everyone! Feedback welcome.')}>
            Results Posted
          </button>
        </div>
      </section>
    </div>
  );
}
