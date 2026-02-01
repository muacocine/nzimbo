import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Code, Palette, GraduationCap, TrendingUp, PenTool, Video, Briefcase, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/components/layout/AppLayout';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Code, Palette, GraduationCap, TrendingUp, PenTool, Video, Briefcase, MoreHorizontal
};

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  courses: string[];
  education_level: string | null;
  rating: number;
  total_reviews: number;
  is_verified: boolean | null;
  badge_type: string | null;
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [freelancers, setFreelancers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, freelancersRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('profiles').select('*').eq('is_freelancer', true).order('rating', { ascending: false }).limit(50)
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (freelancersRes.data) setFreelancers(freelancersRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFreelancers = freelancers.filter(f => {
    const matchesSearch = 
      f.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.courses?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <AnimatedIcon icon="conecte" size="md" />
            <h1 className="text-2xl font-display font-bold text-foreground">
              Explorar
            </h1>
          </div>
          <p className="text-muted-foreground">
            Encontre freelancers por categoria
          </p>
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
            placeholder="Buscar freelancers..."
            className="h-12 pl-12 rounded-xl bg-secondary border-0"
          />
        </motion.div>

        {/* Categories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <AnimatedIcon icon="cracha" size="sm" />
            <h2 className="text-lg font-display font-semibold">Categorias</h2>
          </div>
          
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all',
                !selectedCategory
                  ? 'nzimbo-gradient text-primary-foreground shadow-nzimbo-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              Todos
            </button>
            {categories.map((category) => {
              const IconComponent = CATEGORY_ICONS[category.icon || 'MoreHorizontal'] || MoreHorizontal;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all',
                    selectedCategory === category.id
                      ? 'nzimbo-gradient text-primary-foreground shadow-nzimbo-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* Freelancers Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AnimatedIcon icon="utilizador" size="sm" />
              <h2 className="text-lg font-display font-semibold">Freelancers</h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredFreelancers.length} encontrados
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="nzimbo-card p-4 animate-pulse">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : filteredFreelancers.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredFreelancers.map((freelancer, i) => (
                <motion.div
                  key={freelancer.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => navigate(`/user/${freelancer.user_id}`)}
                  className="nzimbo-card p-4 text-center cursor-pointer group"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-3 overflow-hidden group-hover:ring-2 group-hover:ring-primary transition-all">
                    {freelancer.avatar_url ? (
                      <img 
                        src={freelancer.avatar_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {freelancer.full_name.charAt(0)}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors flex items-center justify-center gap-1">
                    {freelancer.full_name}
                    {freelancer.is_verified && freelancer.badge_type && (
                      <VerifiedBadge type={freelancer.badge_type as 'blue' | 'black'} size="sm" />
                    )}
                  </h3>

                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">
                      {freelancer.rating.toFixed(1)} ({freelancer.total_reviews})
                    </span>
                  </div>

                  {freelancer.courses && freelancer.courses.length > 0 && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {freelancer.courses[0]}
                    </p>
                  )}

                  {freelancer.education_level && (
                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {freelancer.education_level === 'medio' ? 'Médio' : 'Universidade'}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <AnimatedIcon icon="conecte" size="lg" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Nenhum freelancer encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Tente outra busca ou categoria
              </p>
            </motion.div>
          )}
        </motion.section>
      </div>
    </AppLayout>
  );
}
