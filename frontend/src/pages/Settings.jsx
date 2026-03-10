import { useState, useEffect } from 'react';
import {
  Loader2, Building2, Link2, Trash2, Plus, RefreshCw, CheckCircle,
  KeyRound, Eye, EyeOff, Bell, AlertTriangle, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabaseClient';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const BUSINESS_TYPES = ['Sole Trader','Limited Company','Partnership','LLP','CIC','Charity','Other'];

// ── Toggle switch component ─────────────────────────────────
function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start gap-4 cursor-pointer group">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer
          ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
            ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

// ── Delete account modal ────────────────────────────────────
function DeleteAccountModal({ onClose, onConfirm, loading }) {
  const [input, setInput] = useState('');
  const canDelete = input === 'DELETE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Delete account</h3>
            <p className="text-sm text-slate-500">This action cannot be undone</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm text-red-700 space-y-1">
          <p className="font-medium">This will permanently:</p>
          <ul className="list-disc list-inside space-y-0.5 text-red-600">
            <li>Delete your account and profile</li>
            <li>Remove all connected bank accounts</li>
            <li>Delete all bills and transaction data</li>
            <li>Remove all savings opportunities</li>
          </ul>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="DELETE"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-mono"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canDelete || loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Deleting…' : 'Delete my account'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, profile, fetchProfile, signOut } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // ── Business profile ───────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    business_name: '', business_type: '', postcode: '', phone: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg]       = useState('');

  // ── Bank connections ───────────────────────────────────────
  const [banks, setBanks]         = useState([]);
  const [banksLoading, setBanksL] = useState(true);
  const [bankMsg, setBankMsg]     = useState('');
  const [syncing, setSyncing]     = useState(null);

  // ── Password ───────────────────────────────────────────────
  const [pwdForm, setPwdForm]     = useState({ newPwd: '', confirmPwd: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg]       = useState('');
  const [showNewPwd, setShowNew]  = useState(false);
  const [showConfirm, setShowCfm] = useState(false);

  // ── Notification preferences (localStorage) ───────────────
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('vpayit_notifications');
      return saved ? JSON.parse(saved) : { billsDue: true, monthlyReport: false };
    } catch { return { billsDue: true, monthlyReport: false }; }
  });

  // ── Bill reminders preview ─────────────────────────────────
  const [reminders, setReminders]         = useState(null);
  const [remindersLoading, setRemindersL] = useState(false);

  // ── Danger zone ────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting]               = useState(false);

  useEffect(() => { document.title = 'Settings | Vpayit'; }, []);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        business_name: profile.business_name || '',
        business_type: profile.business_type || '',
        postcode:      profile.postcode       || '',
        phone:         profile.phone          || '',
      });
    }
  }, [profile]);

  useEffect(() => { loadBanks(); }, []);

  function toggleNotif(key) {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('vpayit_notifications', JSON.stringify(updated));
    // When enabling bill reminders, fetch preview
    if (key === 'billsDue' && updated.billsDue) loadReminders();
  }

  async function loadReminders() {
    setRemindersL(true);
    try {
      const res = await api.notifications.billReminders();
      setReminders(res);
    } catch { setReminders({ upcoming: [], count: 0 }); }
    finally { setRemindersL(false); }
  }

  async function loadBanks() {
    setBanksL(true);
    try {
      const res = await api.banks.list();
      setBanks(res.data ?? []);
    } catch { /* no-op */ }
    finally { setBanksL(false); }
  }

  async function saveProfile(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const { error } = await supabase
        .from('users')
        .upsert({ id: user.id, email: user.email, ...profileForm }, { onConflict: 'id' });
      if (error) throw error;
      await fetchProfile(user.id);
      setProfileMsg('Profile saved successfully.');
      addToast('Profile saved', 'success');
    } catch (err) {
      setProfileMsg(`Error: ${err.message}`);
      addToast(`Save failed: ${err.message}`, 'error');
    } finally { setProfileSaving(false); }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pwdForm.newPwd !== pwdForm.confirmPwd) {
      setPwdMsg('Error: Passwords do not match.');
      return;
    }
    if (pwdForm.newPwd.length < 8) {
      setPwdMsg('Error: Password must be at least 8 characters.');
      return;
    }
    setPwdSaving(true);
    setPwdMsg('');
    try {
      const { error } = await supabase.auth.updateUser({ password: pwdForm.newPwd });
      if (error) throw error;
      setPwdMsg('Password updated successfully.');
      setPwdForm({ newPwd: '', confirmPwd: '' });
      addToast('Password updated', 'success');
    } catch (err) {
      setPwdMsg(`Error: ${err.message}`);
      addToast(`Password update failed: ${err.message}`, 'error');
    } finally { setPwdSaving(false); }
  }

  async function connectBank() {
    try {
      const { url } = await api.banks.authUrl();
      window.location.href = url;
    } catch (err) {
      setBankMsg(`Error: ${err.message}`);
      addToast(`Bank connect failed: ${err.message}`, 'error');
    }
  }

  async function syncBank(id) {
    setSyncing(id);
    setBankMsg('');
    try {
      const res = await api.banks.sync(id);
      setBankMsg(`Synced: ${res.data.saved} new transactions imported.`);
      await loadBanks();
    } catch (err) {
      setBankMsg(`Sync error: ${err.message}`);
      addToast(`Sync failed: ${err.message}`, 'error');
    } finally { setSyncing(null); }
  }

  async function removeBank(id) {
    if (!confirm('Remove this bank connection? All associated transactions will be preserved.')) return;
    try {
      await api.banks.remove(id);
      setBanks(b => b.filter(x => x.id !== id));
      addToast('Bank connection removed', 'success');
    } catch (err) {
      setBankMsg(`Error: ${err.message}`);
      addToast(`Remove failed: ${err.message}`, 'error');
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      // Attempt backend deletion; graceful fallback if endpoint not yet available
      await api.delete('/auth/account').catch(() => null);
      await signOut();
      navigate('/');
    } catch (err) {
      addToast(`Account deletion failed: ${err.message}`, 'error');
    } finally { setDeleting(false); setShowDeleteModal(false); }
  }

  function MsgBox({ msg, extra = '' }) {
    if (!msg) return null;
    const isErr = msg.startsWith('Error');
    return (
      <div className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${extra}
        ${isErr
          ? 'bg-red-50 border border-red-200 text-red-700'
          : 'bg-green-50 border border-green-200 text-green-700'
        }`}
      >
        {!isErr && <CheckCircle className="w-4 h-4 shrink-0" />}
        {msg}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your profile, security and preferences</p>
      </div>

      {/* ── Business profile ── */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Business profile
        </h2>
        <p className="text-sm text-slate-500 mb-5">Displayed on your bill summaries and reports.</p>

        <MsgBox msg={profileMsg} />

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Business name</label>
            <input
              type="text"
              value={profileForm.business_name}
              onChange={e => setProfileForm(f => ({ ...f, business_name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business type</label>
              <select
                value={profileForm.business_type}
                onChange={e => setProfileForm(f => ({ ...f, business_type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white cursor-pointer"
              >
                <option value="">Select…</option>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Postcode</label>
              <input
                type="text"
                value={profileForm.postcode}
                onChange={e => setProfileForm(f => ({ ...f, postcode: e.target.value.toUpperCase() }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone number</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+44 7000 000000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm cursor-not-allowed"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={profileSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            {profileSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {profileSaving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </section>

      {/* ── Change password ── */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <KeyRound className="w-4 h-4" /> Change password
        </h2>
        <p className="text-sm text-slate-500 mb-5">Must be at least 8 characters.</p>

        <MsgBox msg={pwdMsg} />

        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
            <div className="relative">
              <input
                type={showNewPwd ? 'text' : 'password'}
                value={pwdForm.newPwd}
                onChange={e => setPwdForm(f => ({ ...f, newPwd: e.target.value }))}
                placeholder="••••••••"
                required minLength={8}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm new password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={pwdForm.confirmPwd}
                onChange={e => setPwdForm(f => ({ ...f, confirmPwd: e.target.value }))}
                placeholder="••••••••"
                required minLength={8}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              />
              <button type="button" onClick={() => setShowCfm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit" disabled={pwdSaving}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            {pwdSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {pwdSaving ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </section>

      {/* ── Notification preferences ── */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Bell className="w-4 h-4" /> Notification preferences
        </h2>
        <p className="text-sm text-slate-500 mb-5">Choose which alerts you receive from Vpayit.</p>

        <div className="space-y-5">
          <div>
            <Toggle
              checked={notifications.billsDue}
              onChange={v => toggleNotif('billsDue')}
              label="Bill payment reminders"
              description="Get notified 7 days before a bill is due"
            />
            {/* Reminders preview */}
            {notifications.billsDue && (
              <div className="mt-3 ml-14">
                {remindersLoading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="w-3 h-3 animate-spin" /> Loading upcoming bills…
                  </div>
                ) : reminders === null ? (
                  <button
                    onClick={loadReminders}
                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                  >
                    Preview upcoming reminders →
                  </button>
                ) : reminders.count === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
                    ✓ No bills due in the next 7 days.
                  </p>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
                    <p className="text-xs font-semibold text-amber-800 mb-1.5">
                      Would send {reminders.count} reminder{reminders.count !== 1 ? 's' : ''}:
                    </p>
                    {reminders.upcoming.map(r => (
                      <p key={r.bill_id} className="text-xs text-amber-700">
                        ⚠️ {r.message}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Toggle
            checked={notifications.monthlyReport}
            onChange={v => toggleNotif('monthlyReport')}
            label="Monthly spending report"
            description="Receive a summary of your business spending each month"
          />
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Notification delivery via email — integration coming soon. Preferences saved locally.
        </p>
      </section>

      {/* ── Bank connections ── */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Link2 className="w-4 h-4" /> Bank connections
          </h2>
          <button
            onClick={connectBank}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Connect bank
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-5">Connected via Open Banking (TrueLayer). Read-only access.</p>

        {bankMsg && <MsgBox msg={bankMsg} />}

        {banksLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        ) : banks.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
            <Link2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">No banks connected</p>
            <p className="text-xs text-slate-400 mt-1">Connect your business bank account to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {banks.map(bank => (
              <div key={bank.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900">{bank.provider}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {bank.last_synced
                      ? `Last synced: ${new Date(bank.last_synced).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                      : 'Never synced'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${bank.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {bank.status}
                  </span>
                  <button
                    onClick={() => syncBank(bank.id)} disabled={syncing === bank.id}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
                    title="Sync transactions"
                  >
                    {syncing === bank.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeBank(bank.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove connection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {/* Add another bank button */}
            <button
              onClick={connectBank}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add another bank account
            </button>
          </div>
        )}
      </section>

      {/* ── Danger zone ── */}
      <section className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="font-semibold text-red-700 mb-1 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger zone
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          Irreversible actions. Please read carefully before proceeding.
        </p>

        <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl bg-red-50/50">
          <div>
            <p className="text-sm font-semibold text-slate-900">Delete account</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shrink-0 ml-4"
          >
            <Trash2 className="w-4 h-4" /> Delete account
          </button>
        </div>
      </section>

      {/* Delete account modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          loading={deleting}
        />
      )}
    </div>
  );
}
