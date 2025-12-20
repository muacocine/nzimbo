import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { cn } from '@/lib/utils';

interface VerificationRequest {
  id: string;
  user_id: string;
  full_name: string;
  reason: string;
  document_type: string;
  social_links: string[];
  status: 'pending' | 'approved' | 'rejected';
  badge_type: 'blue' | 'black' | null;
  created_at: string;
  profile?: {
    avatar_url: string | null;
    email: string;
  };
}

export default function AdminPage() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/home');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin, filter]);

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch profiles for each request
      if (data) {
        const requestsWithProfiles = await Promise.all(
          data.map(async (req) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('avatar_url, email')
              .eq('user_id', req.user_id)
              .maybeSingle();
            return { ...req, profile } as VerificationRequest;
          })
        );
        setRequests(requestsWithProfiles);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, badgeType: 'blue' | 'black') => {
    setProcessingId(requestId);
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Update verification request
      const { error: reqError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          badge_type: badgeType,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (reqError) throw reqError;

      // Update user profile with badge
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_verified: true,
          badge_type: badgeType
        })
        .eq('user_id', request.user_id);

      if (profileError) throw profileError;

      toast({
        title: 'Aprovado!',
        description: `Usuário verificado com badge ${badgeType === 'blue' ? 'azul' : 'preto'}.`
      });

      fetchRequests();
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível aprovar.',
        variant: 'destructive'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Rejeitado',
        description: 'A solicitação foi rejeitada.'
      });

      fetchRequests();
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível rejeitar.',
        variant: 'destructive'
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (adminLoading || loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
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
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Painel Admin
            </h1>
            <p className="text-sm text-muted-foreground">Gerenciar verificações</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { label: 'Pendentes', value: requests.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-yellow-500' },
            { label: 'Aprovados', value: requests.filter(r => r.status === 'approved').length, icon: CheckCircle, color: 'text-green-500' },
            { label: 'Rejeitados', value: requests.filter(r => r.status === 'rejected').length, icon: XCircle, color: 'text-red-500' },
          ].map((stat) => (
            <div key={stat.label} className="nzimbo-card p-4 text-center">
              <stat.icon className={cn('w-6 h-6 mx-auto mb-2', stat.color)} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
          {[
            { id: 'pending', label: 'Pendentes' },
            { id: 'approved', label: 'Aprovados' },
            { id: 'rejected', label: 'Rejeitados' },
            { id: 'all', label: 'Todos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={cn(
                'px-4 py-2 rounded-full font-medium text-sm transition-all whitespace-nowrap',
                filter === tab.id
                  ? 'nzimbo-gradient text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {requests.length === 0 ? (
            <div className="text-center py-12 nzimbo-card">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="nzimbo-card p-4"
              >
                {/* User Info */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                    {request.profile?.avatar_url ? (
                      <img src={request.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-primary">
                        {request.full_name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{request.full_name}</h3>
                      {request.status === 'approved' && request.badge_type && (
                        <VerifiedBadge type={request.badge_type} size="sm" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{request.profile?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString('pt-AO')}
                    </p>
                  </div>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    request.status === 'pending' && 'bg-yellow-500/20 text-yellow-600',
                    request.status === 'approved' && 'bg-green-500/20 text-green-600',
                    request.status === 'rejected' && 'bg-red-500/20 text-red-600'
                  )}>
                    {request.status === 'pending' ? 'Pendente' : 
                     request.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                  </span>
                </div>

                {/* Reason */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Motivo:</p>
                  <p className="text-sm">{request.reason}</p>
                </div>

                {/* Links */}
                {request.social_links && request.social_links.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Links:</p>
                    <div className="flex flex-wrap gap-2">
                      {request.social_links.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Link {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <Button
                      onClick={() => handleApprove(request.id, 'blue')}
                      disabled={processingId === request.id}
                      size="sm"
                      className="flex-1 rounded-full bg-blue-500 hover:bg-blue-600"
                    >
                      <VerifiedBadge type="blue" size="sm" className="mr-2" />
                      Badge Azul
                    </Button>
                    <Button
                      onClick={() => handleApprove(request.id, 'black')}
                      disabled={processingId === request.id}
                      size="sm"
                      className="flex-1 rounded-full bg-gray-800 hover:bg-gray-900"
                    >
                      <VerifiedBadge type="black" size="sm" className="mr-2" />
                      Badge Preto
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      size="sm"
                      variant="outline"
                      className="rounded-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
