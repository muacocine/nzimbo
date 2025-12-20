import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Edit, Star, MapPin, Mail, Phone, MessageCircle, Plus, Briefcase, GraduationCap, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
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
  bio: string | null;
  phone: string | null;
  whatsapp: string | null;
  education_level: string | null;
  courses: string[];
  location: string | null;
  rating: number;
  total_reviews: number;
}

interface Service {
  id: string;
  title: string;
  price: number | null;
  is_sponsored: boolean;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

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
          .select('id, title, price, is_sponsored')
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

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-muted" />
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
      <div className="container mx-auto px-4 py-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Avatar */}
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center overflow-hidden ring-4 ring-primary/20">
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
            <button
              onClick={() => navigate('/settings')}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full nzimbo-gradient flex items-center justify-center text-primary-foreground shadow-nzimbo-sm"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          {/* Name & Rating */}
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">
            {profile.full_name}
          </h1>
          
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

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-4">
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
          </div>
        </motion.div>

        {/* Bio */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
          transition={{ delay: 0.2 }}
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

          {/* Services */}
          <div className="nzimbo-card p-4">
            <Briefcase className="w-5 h-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Serviços</p>
            <p className="font-medium text-foreground text-sm">
              {services.length} ativos
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
          transition={{ delay: 0.4 }}
          className="nzimbo-card p-4 mb-6"
        >
          <h2 className="font-semibold text-foreground mb-3">Contato</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-foreground">{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-foreground">{profile.phone}</span>
              </div>
            )}
            {profile.whatsapp && (
              <a
                href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-green-600"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">WhatsApp</span>
              </a>
            )}
          </div>
        </motion.div>

        {/* Services */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
                    {service.is_sponsored && (
                      <span className="px-2 py-1 text-xs rounded-full nzimbo-gradient text-primary-foreground">
                        Patrocinado
                      </span>
                    )}
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
    </AppLayout>
  );
}
