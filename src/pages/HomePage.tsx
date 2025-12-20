import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, MessageCircle, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/components/layout/AppLayout';
import { Logo } from '@/components/ui/Logo';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number | null;
  price_type: string | null;
  is_sponsored: boolean;
  images: string[];
  user_id: string;
  category_name?: string;
}

interface Profile {
  full_name: string;
  avatar_url: string | null;
  rating: number;
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<(Service & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data: servicesData, error } = await supabase
        .from('services')
        .select('*, categories(name)')
        .eq('is_active', true)
        .order('is_sponsored', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const userIds = [...new Set(servicesData?.map(s => s.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, rating')
        .in('user_id', userIds);

      const profileMap = new Map(profilesData?.map(p => [p.user_id, p]));

      const enrichedServices = servicesData?.map(s => ({
        ...s,
        category_name: s.categories?.name,
        profile: profileMap.get(s.user_id)
      })) || [];

      setServices(enrichedServices);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sponsoredServices = filteredServices.filter(s => s.is_sponsored);
  const regularServices = filteredServices.filter(s => !s.is_sponsored);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <p className="text-sm text-muted-foreground">Olá,</p>
            <h1 className="text-xl font-display font-bold text-foreground">
              {user?.user_metadata?.full_name || 'Visitante'}!
            </h1>
          </div>
          <Logo size="sm" showText={false} />
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar serviços..."
            className="h-12 pl-12 rounded-xl bg-secondary border-0"
          />
        </motion.div>

        {/* Sponsored Section */}
        {sponsoredServices.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <AnimatedIcon icon="ideia" size="sm" />
              <h2 className="text-lg font-display font-semibold">Patrocinados</h2>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              {sponsoredServices.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  onClick={() => navigate(`/service/${service.id}`)}
                  className="min-w-[280px] nzimbo-card p-4 cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full nzimbo-gradient text-xs text-primary-foreground font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Destaque
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {service.profile?.full_name?.charAt(0) || 'N'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {service.profile?.full_name || 'Usuário'}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">
                          {service.profile?.rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{service.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{service.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      {service.price ? `${service.price.toLocaleString('pt-AO')} Kz` : 'A combinar'}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {service.category_name || 'Geral'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Regular Services */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-4">
            <AnimatedIcon icon="queda" size="sm" />
            <h2 className="text-lg font-display font-semibold">Serviços Disponíveis</h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="nzimbo-card p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          ) : regularServices.length > 0 ? (
            <div className="space-y-4">
              {regularServices.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => navigate(`/service/${service.id}`)}
                  className="nzimbo-card p-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {service.profile?.full_name?.charAt(0) || 'N'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{service.profile?.full_name || 'Usuário'}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">{service.profile?.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{service.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{service.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      {service.price ? `${service.price.toLocaleString('pt-AO')} Kz` : 'A combinar'}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {service.category_name || 'Geral'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <AnimatedIcon icon="ideia" size="lg" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Nenhum serviço encontrado</h3>
              <p className="text-sm text-muted-foreground">{searchQuery ? 'Tente outra busca' : 'Seja o primeiro a publicar!'}</p>
            </div>
          )}
        </motion.section>
      </div>
    </AppLayout>
  );
}
