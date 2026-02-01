import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Edit, Star, MapPin, Mail, Phone, MessageCircle, Plus, Briefcase, 
  GraduationCap, Share2, Camera, Image, Calendar, Clock, Award, Users, Heart, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  phone: string | null;
  whatsapp: string | null;
  education_level: string | null;
  courses: string[];
  location: string | null;
  rating: number;
  total_reviews: number;
  is_verified: boolean | null;
  badge_type: string | null;
  created_at: string;
}

interface Service {
  id: string;
  title: string;
  price: number | null;
  is_sponsored: boolean;
  views: number;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const [profileRes, servicesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('services')
          .select('id, title, price, is_sponsored, views')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast({
        title: 'Foto atualizada!',
        description: 'Sua foto de perfil foi alterada.'
      });
    } catch (err) {
      console.error('Error uploading avatar:', err);
      toast({
        title: 'Erro ao enviar foto',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const uploadCover = async (file: File) => {
    if (!user) return;
    
    setUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, cover_url: publicUrl } : null);
      toast({
        title: 'Capa atualizada!',
        description: 'Sua foto de capa foi alterada.'
      });
    } catch (err) {
      console.error('Error uploading cover:', err);
      toast({
        title: 'Erro ao enviar capa',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
    } finally {
      setUploadingCover(false);
    }
  };

  const shareProfile = async () => {
    const url = `${window.location.origin}/user/${user?.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.full_name} - Nzimbo`,
          text: `Confira o perfil de ${profile?.full_name} no Nzimbo`,
          url
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copiado!',
        description: 'O link do seu perfil foi copiado para a área de transferência.'
      });
    }
  };

  const totalViews = services.reduce((sum, s) => sum + (s.views || 0), 0);
  const memberSince = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString('pt-AO', { month: 'long', year: 'numeric' })
    : '';

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="w-24 h-24 mx-auto rounded-full bg-muted -mt-12" />
            <div className="h-6 bg-muted rounded w-1/2 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground">Perfil não encontrado</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto">
        {/* Cover Photo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-40 rounded-b-3xl overflow-hidden"
        >
          {profile.cover_url ? (
            <img 
              src={profile.cover_url} 
              alt="" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full nzimbo-gradient opacity-60" />
          )}
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground"
          >
            {uploadingCover ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
              />
            ) : (
              <Image className="w-5 h-5" />
            )}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadCover(file);
            }}
          />
        </motion.div>

        <div className="px-4">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-28 h-28 mx-auto -mt-14 mb-3"
          >
            <div className="w-full h-full rounded-full bg-background p-1">
              <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-primary">
                    {profile.full_name.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full nzimbo-gradient flex items-center justify-center text-primary-foreground shadow-nzimbo-sm"
            >
              {uploadingAvatar ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar(file);
              }}
            />
          </motion.div>

          {/* Name & Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-2xl font-display font-bold text-foreground">
                {profile.full_name}
              </h1>
              {profile.is_verified && profile.badge_type && (
                <VerifiedBadge type={profile.badge_type as 'blue' | 'black'} size="md" />
              )}
            </div>
            
            <div className="flex items-center justify-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{profile.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({profile.total_reviews} avaliações)</span>
            </div>

            {profile.location && (
              <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </p>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <Button
              onClick={shareProfile}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button
              onClick={() => navigate('/settings')}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            {!profile.is_verified && (
              <Button
                onClick={() => navigate('/verification-request')}
                size="sm"
                className="rounded-full nzimbo-gradient text-primary-foreground"
              >
                <Award className="w-4 h-4 mr-2" />
                Verificar
              </Button>
            )}
          </motion.div>

          {/* Stats Grid - 4 items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-4 gap-2 mb-6"
          >
            <div className="nzimbo-card p-3 text-center">
              <Briefcase className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{services.length}</p>
              <p className="text-xs text-muted-foreground">Serviços</p>
            </div>
            <div className="nzimbo-card p-3 text-center">
              <Eye className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{totalViews}</p>
              <p className="text-xs text-muted-foreground">Visitas</p>
            </div>
            <div className="nzimbo-card p-3 text-center">
              <Star className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{profile.total_reviews}</p>
              <p className="text-xs text-muted-foreground">Avaliações</p>
            </div>
            <div className="nzimbo-card p-3 text-center">
              <Heart className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{profile.rating.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </motion.div>

          {/* Bio */}
          {profile.bio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="nzimbo-card p-4 mb-6"
            >
              <h2 className="font-semibold text-foreground mb-2">Sobre</h2>
              <p className="text-muted-foreground text-sm">{profile.bio}</p>
            </motion.div>
          )}

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            {/* Education */}
            <div className="nzimbo-card p-4">
              <GraduationCap className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Educação</p>
              <p className="font-medium text-foreground text-sm">
                {profile.education_level === 'medio' ? 'Ensino Médio' : 'Universidade'}
              </p>
            </div>

            {/* Member Since */}
            <div className="nzimbo-card p-4">
              <Calendar className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Membro desde</p>
              <p className="font-medium text-foreground text-sm capitalize">
                {memberSince}
              </p>
            </div>
          </motion.div>

          {/* Courses */}
          {profile.courses && profile.courses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h2 className="font-semibold text-foreground mb-3">Áreas de Interesse</h2>
              <div className="flex flex-wrap gap-2">
                {profile.courses.map((course) => (
                  <span
                    key={course}
                    className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="nzimbo-card p-4 mb-6"
          >
            <h2 className="font-semibold text-foreground mb-3">Contato</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm text-foreground">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground">{profile.phone}</span>
                </div>
              )}
              {profile.whatsapp && (
                <a
                  href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">WhatsApp</span>
                </a>
              )}
            </div>
          </motion.div>

          {/* Services */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Meus Serviços</h2>
              <Button
                onClick={() => navigate('/create-service')}
                size="sm"
                className="rounded-full nzimbo-gradient text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-1" />
                Novo
              </Button>
            </div>

            {services.length > 0 ? (
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => navigate(`/service/${service.id}`)}
                    className={cn(
                      'nzimbo-card p-4 cursor-pointer',
                      service.is_sponsored && 'ring-2 ring-primary'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{service.title}</h3>
                        <p className="text-sm text-primary font-semibold">
                          {service.price ? `${service.price.toLocaleString('pt-AO')} Kz` : 'A combinar'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          {service.views || 0}
                        </span>
                        {service.is_sponsored && (
                          <span className="px-2 py-1 text-xs rounded-full nzimbo-gradient text-primary-foreground">
                            Patrocinado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 nzimbo-card">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">Você ainda não tem serviços</p>
                <Button
                  onClick={() => navigate('/create-service')}
                  className="rounded-full nzimbo-gradient text-primary-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Serviço
                </Button>
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </AppLayout>
  );
}
