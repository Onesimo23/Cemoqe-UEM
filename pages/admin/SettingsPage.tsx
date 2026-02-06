
import React, { useState, useRef, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Server, 
  Globe, 
  Shield, 
  Save, 
  Smartphone, 
  Database, 
  Type, 
  Image as ImageIcon, 
  Upload, 
  X, 
  Palette,
  CheckCircle2,
  Building2,
  AppWindow
} from 'lucide-react';

import { db, storage } from '../../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'appearance' | 'security'>('appearance');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Appearance State
  const [brandSettings, setBrandSettings] = useState({
    platformName: 'EduPrime',
    institutionName: 'EduPrime Academy Group',
    applicationName: 'EduPrime LMS Portal',
    primaryColor: '#0E7038',
    accentColor: '#EAB308',
    fontFamily: 'Inter',
    logoUrl: ''
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    publicSignups: true,
    dynamicCache: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    require2FA: true,
    auditLogs: true,
    limitedSessions: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'system'));
        if (snap.exists()) {
          const data: any = snap.data();
          if (data.appearance) setBrandSettings((prev) => ({ ...prev, ...data.appearance }));
          if (data.system) setSystemSettings((prev) => ({ ...prev, ...data.system }));
          if (data.security) setSecuritySettings((prev) => ({ ...prev, ...data.security }));
        }
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await setDoc(
        doc(db, 'settings', 'system'),
        {
          appearance: brandSettings,
          system: systemSettings,
          security: securitySettings,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/svg+xml', 'image/png', 'image/webp', 'image/jpeg'];
      if (!validTypes.includes(file.type)) { alert('Formatos permitidos: SVG, PNG, WebP ou JPG.'); return; }
      if (file.size > 5 * 1024 * 1024) { alert('Tamanho máximo permitido é 5MB.'); return; }
      setUploadingLogo(true);
      try {
        const ts = Date.now();
        const ext = (file.name.split('.').pop() || 'png').toLowerCase();
        const supaPath = `branding/logo_${ts}.${ext}`;
        const storagePath = `branding/logo_${ts}.${ext}`;
        let finalUrl: string | null = null;
        const preferSupabase = isSupabaseConfigured || ((import.meta as any)?.env?.VITE_STORAGE_PROVIDER === 'supabase');

        if (preferSupabase) {
          try {
            const buckets = ['branding', 'profiles', 'public', 'PUBLIC'];
            for (const b of buckets) {
              const { error } = await supabase.storage.from(b as any).upload(supaPath, file, { upsert: true, contentType: file.type });
              if (!error) {
                const { data } = supabase.storage.from(b as any).getPublicUrl(supaPath);
                finalUrl = data?.publicUrl || null;
                break;
              }
            }
          } catch (se) {
            console.warn('Upload no Supabase falhou, tentando Firebase...', se);
          }
          if (!finalUrl) {
            try {
              const storageRef = ref(storage, storagePath);
              await uploadBytes(storageRef, file, { contentType: file.type });
              finalUrl = await getDownloadURL(storageRef);
            } catch (fe) {
              console.error('Falha nos dois provedores (Supabase e Firebase).', fe);
            }
          }
        } else {
          try {
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, file, { contentType: file.type });
            finalUrl = await getDownloadURL(storageRef);
          } catch (fe) {
            console.warn('Upload no Firebase falhou, tentando Supabase...', fe);
          }
          if (!finalUrl && isSupabaseConfigured) {
            try {
              const buckets = ['branding', 'profiles', 'public', 'PUBLIC'];
              for (const b of buckets) {
                const { error } = await supabase.storage.from(b as any).upload(supaPath, file, { upsert: true, contentType: file.type });
                if (!error) {
                  const { data } = supabase.storage.from(b as any).getPublicUrl(supaPath);
                  finalUrl = data?.publicUrl || null;
                  break;
                }
              }
            } catch (se) {
              console.error('Falha nos dois provedores (Firebase e Supabase).', se);
            }
          }
        }

        if (!finalUrl) throw new Error('Falha ao obter URL do logo.');
        setBrandSettings({ ...brandSettings, logoUrl: finalUrl });
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Configurações do Sistema</h1>
            <p className="text-slate-500 text-sm">Gerencie os parâmetros globais da plataforma EduPrime.</p>
          </div>
          {showSuccess && (
            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-100 animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 size={16} />
              <span className="text-xs font-bold uppercase tracking-tight">Alterações Aplicadas</span>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
           <aside className="w-full md:w-64 space-y-2">
              <SettingBtn active={activeTab === 'system'} label="Geral & Infra" icon={<Server size={18} />} onClick={() => setActiveTab('system')} />
              <SettingBtn active={activeTab === 'appearance'} label="Marca & Estilo" icon={<Globe size={18} />} onClick={() => setActiveTab('appearance')} />
              <SettingBtn active={activeTab === 'security'} label="Segurança" icon={<Shield size={18} />} onClick={() => setActiveTab('security')} />
           </aside>

           <div className="flex-1 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8 min-h-[500px]">
              {activeTab === 'system' && (
                 <div className="space-y-6 animate-in fade-in duration-300">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                      <Database size={20} className="text-brand-green" /> Infraestrutura
                    </h3>
                    <div className="space-y-4">
                      <ToggleSetting label="Modo Manutenção" description="Oculta a plataforma para utilizadores externos." checked={systemSettings.maintenanceMode} onChange={(v: boolean) => setSystemSettings(s => ({...s, maintenanceMode: v}))} />
                      <ToggleSetting label="Inscrições Públicas" description="Permite que novos estudantes criem contas." checked={systemSettings.publicSignups} onChange={(v: boolean) => setSystemSettings(s => ({...s, publicSignups: v}))} />
                      <ToggleSetting label="Cache Dinâmico" description="Aumenta performance, mas pode atrasar atualizações visuais." checked={systemSettings.dynamicCache} onChange={(v: boolean) => setSystemSettings(s => ({...s, dynamicCache: v}))} />
                    </div>
                 </div>
              )}

              {activeTab === 'appearance' && (
                 <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                       <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                          <Palette size={20} className="text-brand-green" /> Identidade Visual
                       </h3>
                    </div>

                    {/* Logo Section */}
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logotipo da Plataforma</p>
                       <div className="flex items-center gap-6">
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-green hover:bg-brand-light/20 transition-all group relative overflow-hidden"
                          >
                             {brandSettings.logoUrl ? (
                               <img src={brandSettings.logoUrl} className="w-full h-full object-contain p-4" alt="Logo" />
                             ) : (
                               <>
                                 <ImageIcon size={24} className="text-slate-300 group-hover:text-brand-green transition-colors" />
                                 <span className="text-[9px] font-black text-slate-400 mt-2 uppercase">Subir Logo</span>
                               </>
                             )}
                             {uploadingLogo && (
                               <div className="absolute inset-0 bg-black/30 text-white text-[10px] font-black grid place-items-center">Enviando...</div>
                             )}
                             <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                          </div>
                          <div className="flex-1 space-y-2">
                             <p className="text-sm font-bold text-slate-700">Formatos: SVG, PNG ou WebP</p>
                             <p className="text-xs text-slate-400 leading-relaxed">
                               O logotipo será exibido na barra de navegação e em rodapés. Recomendamos fundo transparente.
                             </p>
                             {brandSettings.logoUrl && (
                               <button 
                                onClick={() => setBrandSettings({ ...brandSettings, logoUrl: '' })}
                                className="text-[10px] font-black text-red-500 uppercase hover:underline flex items-center gap-1"
                               >
                                 <X size={12} /> Remover imagem
                               </button>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* General Style Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Instituição</label>
                          <div className="relative">
                             <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                             <input 
                               type="text" 
                               value={brandSettings.institutionName}
                               onChange={(e) => setBrandSettings({ ...brandSettings, institutionName: e.target.value })}
                               className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 transition-all outline-none" 
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Aplicação</label>
                          <div className="relative">
                             <AppWindow className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                             <input 
                               type="text" 
                               value={brandSettings.applicationName}
                               onChange={(e) => setBrandSettings({ ...brandSettings, applicationName: e.target.value })}
                               className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 transition-all outline-none" 
                             />
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipografia Principal</label>
                          <select 
                            value={brandSettings.fontFamily}
                            onChange={(e) => setBrandSettings({ ...brandSettings, fontFamily: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 transition-all outline-none cursor-pointer"
                          >
                             <option value="Inter">Inter (Padrão)</option>
                             <option value="Roboto">Roboto</option>
                             <option value="Poppins">Poppins</option>
                             <option value="Montserrat">Montserrat</option>
                          </select>
                       </div>
                       <div className="hidden md:block"></div>
                    </div>

                    {/* Colors Section */}
                    <div className="space-y-4 pt-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paleta de Cores</p>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 hover:bg-white transition-colors group">
                             <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase">Cor Primária</p>
                                <input 
                                  type="color" 
                                  value={brandSettings.primaryColor}
                                  onChange={(e) => setBrandSettings({ ...brandSettings, primaryColor: e.target.value })}
                                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" 
                                />
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl shadow-lg border-2 border-white" style={{ backgroundColor: brandSettings.primaryColor }}></div>
                                <div>
                                   <span className="text-sm font-mono font-black text-slate-900 uppercase">{brandSettings.primaryColor}</span>
                                   <p className="text-[9px] text-slate-400 font-bold uppercase">Base da Identidade</p>
                                </div>
                             </div>
                          </div>
                          
                          <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 hover:bg-white transition-colors group">
                             <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase">Cor de Acento</p>
                                <input 
                                  type="color" 
                                  value={brandSettings.accentColor}
                                  onChange={(e) => setBrandSettings({ ...brandSettings, accentColor: e.target.value })}
                                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" 
                                />
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl shadow-lg border-2 border-white" style={{ backgroundColor: brandSettings.accentColor }}></div>
                                <div>
                                   <span className="text-sm font-mono font-black text-slate-900 uppercase">{brandSettings.accentColor}</span>
                                   <p className="text-[9px] text-slate-400 font-bold uppercase">Botões e Destaques</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              )}

              {activeTab === 'security' && (
                 <div className="space-y-6 animate-in fade-in duration-300">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                      <Shield size={20} className="text-brand-green" /> Políticas de Acesso
                    </h3>
                    <div className="space-y-4">
                      <ToggleSetting label="Exigir 2FA" description="Obrigatório para administradores e instrutores logarem." checked={securitySettings.require2FA} onChange={(v: boolean) => setSecuritySettings(s => ({...s, require2FA: v}))} />
                      <ToggleSetting label="Auditoria de Logs" description="Registar cada login e alteração de conteúdo no sistema." checked={securitySettings.auditLogs} onChange={(v: boolean) => setSecuritySettings(s => ({...s, auditLogs: v}))} />
                      <ToggleSetting label="Sessões Limitadas" description="Desconectar usuários após 24 horas de inatividade." checked={securitySettings.limitedSessions} onChange={(v: boolean) => setSecuritySettings(s => ({...s, limitedSessions: v}))} />
                    </div>
                 </div>
              )}

              <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight italic">
                   * Algumas alterações podem levar até 5 minutos para propagar via CDN.
                 </p>
                 <button 
                  onClick={handleSave}
                  disabled={isSaving || loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-green text-white font-black uppercase text-xs tracking-widest px-12 py-4 rounded-2xl hover:bg-brand-dark transition-all shadow-xl shadow-green-900/10 active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                 >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        A guardar...
                      </>
                    ) : (
                      <>
                        <Save size={18} /> Aplicar Alterações
                      </>
                    )}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const SettingBtn = ({ active, label, icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] ${
      active 
      ? 'bg-brand-green text-white shadow-lg shadow-green-900/20' 
      : 'text-slate-500 hover:bg-white hover:text-brand-green border border-transparent hover:border-slate-100'
    }`}
  >
    {icon} {label}
  </button>
);

const ToggleSetting = ({ label, description, checked, onChange }: any) => (
  <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
     <div>
        <h4 className="text-sm font-bold text-slate-800">{label}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{description}</p>
     </div>
     <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={!!checked} onChange={(e) => onChange?.(e.target.checked)} className="sr-only peer" />
        <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:bg-brand-green after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"></div>
     </label>
  </div>
);

export default AdminSettingsPage;
