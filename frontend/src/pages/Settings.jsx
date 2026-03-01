import { useState, useEffect } from 'react';
import { Loader2, Building2, Link2, Trash2, Plus, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { api } from '../lib/api';

const BUSINESS_TYPES = ['Sole Trader','Limited Company','Partnership','LLP','CIC','Charity','Other'];

export default function Settings() {
  const { user, profile, fetchProfile } = useAuth();

  const [profileForm, setProfileForm] = useState({
    business_name: '',
    business_type: '',
    postcode:      '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg,    setProfileMsg   ] = useState('');

  const [banks, setBanks]         = useState([]);
  const [banksLoading, setBanksL] = useState(true);
  const [bankMsg, setBankMsg]     = useState('');
  const [syncing, setSyncing]     = useState(null);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        business_name: profile.business_name || '',
        business_type: profile.business_type || '',
        postcode:      profile.postcode       || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    loadBanks();
  }, []);

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
        .upsert(
          { id: user.id, email: user.email, ...profileForm },
          { onConflict: 'id' }
        );
      if (error) throw error;
      await fetchProfile(user.id);
      setProfileMsg('Profile saved successfully.');
    } catch (err) {
      setProfileMsg(`Error: ${err.message}`);
    } finally { setProfileSaving(false); }
  }

  async function connectBank() {
    try {
      const { url } = await api.banks.authUrl();
      window.location.href = url;
    } catch (err) {
      setBankMsg(`Error: ${err.message}`);
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
    } finally { setSyncing(null); }
  }

  async function removeBank(id) {
    if (!confirm('Remove this bank connection? All associated transactions will be preserved.')) return;
    try {
      await api.banks.remove(id);
      setBanks(b => b.filter(x => x.id !== id));
    } catch (err) {
      setBankMsg(`Error: ${err.message}`);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your business profile and bank connections</p>
      </div>

      {/* ── Business profile ── */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Business profile
        </h2>
        <p className="text-sm text-slate-500 mb-5">This information appears on your bill summaries.</p>

        {profileMsg && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2
            ${profileMsg.startsWith('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {!profileMsg.startsWith('Error') && <CheckCircle className="w-4 h-4 shrink-0" />}
            {profileMsg}
          </div>
        )}

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Business name</label>
            <input
              type="text"
              value={profileForm.business_name}
              onChange={e => setProfileForm(f => ({ ...f, business_name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business type</label>
              <select
                value={profileForm.business_type}
                onChange={e => setProfileForm(f => ({ ...f, business_type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
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
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-sm cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={profileSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            {profileSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {profileSaving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </section>

      {/* ── Bank connections ── */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Link2 className="w-4 h-4" /> Bank connections
          </h2>
          <button
            onClick={connectBank}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Connect bank
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-5">Connected via Open Banking (TrueLayer). Read-only access.</p>

        {bankMsg && (
          <div className={`mb-4 p-3 rounded-lg text-sm
            ${bankMsg.startsWith('Error') || bankMsg.startsWith('Sync error')
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-green-50 border border-green-200 text-green-700'}`}>
            {bankMsg}
          </div>
        )}

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
                      : 'Never synced'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${bank.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {bank.status}
                  </span>
                  <button
                    onClick={() => syncBank(bank.id)}
                    disabled={syncing === bank.id}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-40"
                    title="Sync transactions"
                  >
                    {syncing === bank.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <RefreshCw className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeBank(bank.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove connection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
