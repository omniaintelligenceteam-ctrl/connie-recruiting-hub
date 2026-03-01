import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useCandidates } from '../../hooks/useCandidates';
import { exportCandidatesCSV, exportPipelineReport } from '../../lib/exportUtils';
import { useToast } from '../shared/Toast';

type State = { profile_name: string; profile_role: string; profile_org: string; show_daily_digest: boolean; show_overdue_alerts: boolean; sound_notifications: boolean };
const KEY='crh_settings_v1';
const defaults: State = { profile_name: 'Connie', profile_role: 'Physician Recruiter', profile_org: 'Baptist Health Paducah', show_daily_digest: true, show_overdue_alerts: true, sound_notifications: false };
const load = (): State => { try { return { ...defaults, ...(JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<State>) }; } catch { return defaults; } };

export default function Settings(){
  const {showToast}=useToast(); const {candidates}=useCandidates();
  const [s,setS]=useState<State>(load());
  const [url,setUrl]=useState(localStorage.getItem('openclaw_gateway_url') ?? '');
  const [token,setToken]=useState(localStorage.getItem('openclaw_gateway_token') ?? '');
  const [show,setShow]=useState(false);
  const [conn,setConn]=useState<'idle'|'ok'|'error'|'testing'>('idle');
  const saveProfile=()=>{localStorage.setItem(KEY,JSON.stringify(s)); localStorage.setItem('crh_settings_show_daily_digest',String(s.show_daily_digest)); localStorage.setItem('crh_settings_show_overdue_alerts',String(s.show_overdue_alerts)); localStorage.setItem('crh_settings_sound_notifications',String(s.sound_notifications)); showToast('Settings saved.','success');};
  const saveConn=()=>{localStorage.setItem('openclaw_gateway_url',url); localStorage.setItem('openclaw_gateway_token',token); showToast('AI connection saved.','success');};
  const test=async()=>{ if(!url.trim()) return showToast('Add a gateway URL first.','error'); try{ setConn('testing'); const r=await fetch(url,{headers: token?{Authorization:`Bearer ${token}`}:{}}); setConn(r.ok?'ok':'error'); showToast(r.ok?'Gateway connection successful.':'Gateway test failed.', r.ok?'success':'error'); }catch{setConn('error');showToast('Gateway test failed.','error');} };

  return <section className="space-y-6"><header><h1 className="text-3xl font-bold">Settings</h1></header>
    <div className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">User Profile</h2><div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3"><input value={s.profile_name} onChange={(e)=>setS((p)=>({...p,profile_name:e.target.value}))} className="rounded-lg border border-slate-300 px-3 py-2" /><input value={s.profile_role} onChange={(e)=>setS((p)=>({...p,profile_role:e.target.value}))} className="rounded-lg border border-slate-300 px-3 py-2" /><input value={s.profile_org} onChange={(e)=>setS((p)=>({...p,profile_org:e.target.value}))} className="rounded-lg border border-slate-300 px-3 py-2" /></div><button type="button" onClick={saveProfile} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Save</button></div>
    <div className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">AI Connection</h2><div className="mt-3 grid gap-3"><input value={url} onChange={(e)=>setUrl(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="OpenClaw Gateway URL" /><div className="relative"><input value={token} type={show?'text':'password'} onChange={(e)=>setToken(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10" placeholder="Gateway Token" /><button type="button" onClick={()=>setShow((p)=>!p)} className="absolute top-1/2 right-2 -translate-y-1/2 text-slate-500">{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></div><div className="mt-3 flex gap-2"><button type="button" onClick={()=>{void test();}} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">{conn==='testing'?'Testing...':'Test Connection'}</button><button type="button" onClick={saveConn} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Save</button><span className="text-sm">{conn==='ok'?'✅ Connected':conn==='error'?'❌ Failed':''}</span></div></div>
    <div className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">Notification Preferences</h2><div className="mt-3 space-y-3"><label className="flex items-center justify-between"><span className="text-sm">Show daily digest on dashboard</span><input type="checkbox" checked={s.show_daily_digest} onChange={(e)=>setS((p)=>({...p,show_daily_digest:e.target.checked}))}/></label><label className="flex items-center justify-between"><span className="text-sm">Show overdue alerts</span><input type="checkbox" checked={s.show_overdue_alerts} onChange={(e)=>setS((p)=>({...p,show_overdue_alerts:e.target.checked}))}/></label><label className="flex items-center justify-between"><span className="text-sm">Sound on new notifications</span><input type="checkbox" checked={s.sound_notifications} onChange={(e)=>setS((p)=>({...p,sound_notifications:e.target.checked}))}/></label></div></div>
    <div className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">Data Management</h2><div className="mt-3 flex gap-2"><button type="button" onClick={()=>exportCandidatesCSV(candidates)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Export All Candidates</button><button type="button" onClick={()=>exportPipelineReport(candidates)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Export Pipeline Report</button></div></div>
  </section>;
}
