import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Mail, Phone, MessageCircle, Briefcase, GraduationCap, Share2, ArrowLeft, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
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
  is_verified: boolean;
  badge_type: 'blue' | 'black' | null;
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: number | null;
  is_sponsored: boolean;
  images: string[];
}

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;

    try {
      const [profileRes, servicesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('services')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('is_sponsored', { ascending: false })
      ]);

      if (profileRes.data) setProfile(profileRes.data as Profile);
      if (servicesRes.data) setServices(servicesRes.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const shareProfile = async () => {
    const url = window.location.href;
    
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
        description: 'O link do perfil foi copiado.'
      });
    }
  };

  const openWhatsApp = () => {
    if (profile?.whatsapp) {
      const phone = profile.whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="animate-pulse">
          <div className="h-40 bg-muted" />
          <div className="container mx-auto px-4 -mt-16">
            <div className="w-24 h-24 rounded-full bg-muted border-4 border-background" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Perfil não encontrado</p>
          <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
            Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showFooter={false}>
      <div className="min-h-screen pb-8">
        {/* Cover Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary">
          {profile.cover_url && (
            <img 
              src={profile.cover_url} 
              alt="" 
              className="w-full h-full object-cover"
              draggable={false}
            />
          )}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="container mx-auto px-4 -mt-16 relative z-10">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-28 h-28 mx-auto mb-4"
          >
            <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center overflow-hidden ring-4 ring-background shadow-xl">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="" 
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <span className="text-4xl font-bold text-primary">
                  {profile.full_name.charAt(0)}
                </span>
              )}
            </div>
          </motion.div>

          {/* Name & Badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-2xl font-display font-bold text-foreground">
                {profile.full_name}
              </h1>
              {profile.is_verified && profile.badge_type && (
                <VerifiedBadge type={profile.badge_type} size="lg" />
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
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            {profile.whatsapp && (
              <Button
                onClick={openWhatsApp}
                className="rounded-full bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            )}
            <Button
              onClick={shareProfile}
              variant="outline"
              className="rounded-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </motion.div>

          {/* Bio */}
          {profile.bio && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="nzimbo-card p-4 mb-6"
            >
              <h2 className="font-semibold text-foreground mb-2">Sobre</h2>
              <p className="text-muted-foreground text-sm">{profile.bio}</p>
            </motion.div>
          )}

          {/* Stats Cards */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            <div className="nzimbo-card p-4 text-center">
              <GraduationCap className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Educação</p>
              <p className="font-medium text-foreground text-sm">
                {profile.education_level === 'medio' ? 'Ensino Médio' : 'Universidade'}
              </p>
            </div>
            <div className="nzimbo-card p-4 text-center">
              <Briefcase className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Serviços</p>
              <p className="font-medium text-foreground text-sm">
                {services.length} ativos
              </p>
            </div>
          </motion.div>

          {/* Courses */}
          {profile.courses && profile.courses.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
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

          {/* Contact Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
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
            </div>
          </motion.div>

          {/* Services */}
          {services.length > 0 && (
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="font-semibold text-foreground mb-4">Serviços</h2>
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => navigate(`/service/${service.id}`)}
                    className={cn(
                      'nzimbo-card p-4 cursor-pointer hover:shadow-lg transition-shadow',
                      service.is_sponsored && 'ring-2 ring-primary'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{service.title}</h3>
                          {service.is_sponsored && (
                            <span className="px-2 py-0.5 text-xs rounded-full nzimbo-gradient text-primary-foreground">
                              Destaque
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {service.description}
                        </p>
                        <p className="text-sm text-primary font-semibold mt-2">
                          {service.price ? `${service.price.toLocaleString('pt-AO')} Kz` : 'A combinar'}
                        </p>
                      </div>
                      {service.images?.[0] && (
                        <img 
                          src={service.images[0]} 
                          alt="" 
                          className="w-16 h-16 rounded-lg object-cover ml-3"
                          draggable={false}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
