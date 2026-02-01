import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Camera, Save, LogOut, Bell, Moon, Shield, HelpCircle, 
  ChevronRight, Globe, Trash2, BadgeCheck, Lock, Eye, Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AppLayout } from '@/components/layout/AppLayout';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  is_verified: boolean | null;
  badge_type: string | null;
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    whatsapp: '',
    location: ''
  });

  // Settings states
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [profilePrivate, setProfilePrivate] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [language, setLanguage] = useState('pt');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
    // Check dark mode from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          bio: data.bio || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          location: data.location || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio || null,
          phone: formData.phone || null,
          whatsapp: formData.whatsapp || null,
          location: formData.location || null
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas alterações foram salvas com sucesso.'
      });
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar o perfil.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', String(enabled));
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast({
      title: enabled ? 'Modo escuro ativado' : 'Modo claro ativado',
      description: 'Tema alterado com sucesso.'
    });
  };

  const toggleNotifications = (enabled: boolean) => {
    setNotifications(enabled);
    toast({
      title: enabled ? 'Notificações ativadas' : 'Notificações desativadas',
      description: enabled ? 'Você receberá notificações.' : 'Notificações silenciadas.'
    });
  };

  const togglePrivacy = (enabled: boolean) => {
    setProfilePrivate(enabled);
    toast({
      title: enabled ? 'Perfil privado' : 'Perfil público',
      description: enabled ? 'Seu perfil está oculto.' : 'Seu perfil está visível.'
    });
  };

  const toggleOnlineStatus = (enabled: boolean) => {
    setShowOnlineStatus(enabled);
    toast({
      title: enabled ? 'Status online visível' : 'Status online oculto',
      description: enabled ? 'Outros podem ver quando você está online.' : 'Seu status online está oculto.'
    });
  };

  const handleDeleteAccount = async () => {
    toast({
      title: 'Conta marcada para exclusão',
      description: 'Sua conta será excluída em 30 dias.',
      variant: 'destructive'
    });
    await signOut();
    navigate('/');
  };

  const handleChangePassword = () => {
    toast({
      title: 'Email enviado',
      description: 'Verifique sua caixa de entrada para redefinir a senha.'
    });
  };

  const menuItems = [
    { 
      icon: Bell, 
      label: 'Notificações', 
      description: 'Receber alertas e atualizações',
      toggle: true,
      value: notifications,
      onChange: toggleNotifications
    },
    { 
      icon: Moon, 
      label: 'Tema Escuro', 
      description: 'Alternar modo escuro',
      toggle: true,
      value: darkMode,
      onChange: toggleDarkMode
    },
    { 
      icon: Shield, 
      label: 'Perfil Privado', 
      description: 'Ocultar perfil de buscas',
      toggle: true,
      value: profilePrivate,
      onChange: togglePrivacy
    },
    { 
      icon: Eye, 
      label: 'Status Online', 
      description: 'Mostrar quando está online',
      toggle: true,
      value: showOnlineStatus,
      onChange: toggleOnlineStatus
    },
    { 
      icon: BadgeCheck, 
      label: 'Solicitar Verificação', 
      description: 'Obter badge de verificado',
      action: () => navigate('/verification-request'),
      showBadge: profile?.is_verified && profile?.badge_type
    },
    { 
      icon: Lock, 
      label: 'Alterar Senha', 
      description: 'Redefinir sua senha',
      action: handleChangePassword
    },
    { 
      icon: Languages, 
      label: 'Idioma', 
      description: 'Português (Angola)',
      action: () => {
        toast({
          title: 'Idioma',
          description: 'Apenas Português disponível no momento.'
        });
      }
    },
    { 
      icon: Globe, 
      label: 'Sobre o Nzimbo', 
      description: 'Versão 1.0.0',
      action: () => {
        toast({
          title: 'Nzimbo',
          description: 'Plataforma de freelancers de Angola v1.0.0'
        });
      }
    },
    { 
      icon: HelpCircle, 
      label: 'Ajuda & Suporte', 
      description: 'Dúvidas e problemas',
      action: () => {
        window.open('mailto:suporte@nzimbo.ao', '_blank');
      }
    },
  ];

  if (loading) {
    return (
      <AppLayout showFooter={false}>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showFooter={false}>
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-display font-bold">Definições</h1>
        </motion.div>

        {/* Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="nzimbo-card p-6 mb-6"
        >
          <h2 className="font-semibold text-foreground mb-4">Perfil</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {formData.full_name.charAt(0) || 'N'}
                  </span>
                )}
              </div>
              <button 
                onClick={() => navigate('/profile')}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full nzimbo-gradient flex items-center justify-center text-primary-foreground"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{formData.full_name || 'Seu Nome'}</p>
                {profile?.is_verified && profile?.badge_type && (
                  <VerifiedBadge type={profile.badge_type as 'blue' | 'black'} size="sm" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Conte um pouco sobre você..."
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+244 XXX XXX XXX"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="+244 XXX XXX XXX"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Luanda, Angola"
                className="h-12 rounded-xl"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 rounded-xl nzimbo-gradient text-primary-foreground"
            >
              {saving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </motion.section>

        {/* Menu Items - 10 Functions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="nzimbo-card overflow-hidden mb-6"
        >
          <h2 className="font-semibold text-foreground p-4 border-b border-border">Configurações</h2>
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.toggle ? undefined : item.action}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors border-b border-border last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{item.label}</span>
                    {item.showBadge && (
                      <VerifiedBadge type={profile?.badge_type as 'blue' | 'black'} size="sm" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              {item.toggle ? (
                <Switch 
                  checked={item.value} 
                  onCheckedChange={item.onChange}
                />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          ))}
        </motion.section>

        {/* Delete Account */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Excluir Conta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Sua conta será permanentemente excluída
                  após 30 dias.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-12 rounded-xl"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair da Conta
          </Button>
        </motion.section>
      </div>
    </AppLayout>
  );
}
