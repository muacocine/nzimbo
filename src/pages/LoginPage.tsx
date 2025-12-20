import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha email e senha.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'Credenciais inválidas',
            description: 'Email ou senha incorretos.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Erro ao entrar',
            description: error.message,
            variant: 'destructive'
          });
        }
      } else {
        toast({
          title: 'Bem-vindo de volta!',
          description: 'Login realizado com sucesso.'
        });
        navigate('/home');
      }
    } catch (err) {
      toast({
        title: 'Erro inesperado',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Decorative top border */}
      <div className="relative">
        <div className="h-28 nzimbo-gradient" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[2rem]" />
      </div>

      <div className="flex-1 container mx-auto px-6 -mt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Logo size="sm" showText={false} />
          <div className="w-10" />
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-display font-bold mb-2">
              Bem-vindo de volta!
            </h1>
            <p className="text-muted-foreground">
              Entre na sua conta Nzimbo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="h-14 text-lg rounded-xl"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-14 text-lg rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-semibold rounded-2xl nzimbo-gradient text-primary-foreground shadow-nzimbo-md hover:shadow-nzimbo-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground">
            Não tem uma conta?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-primary font-medium hover:underline"
            >
              Criar conta
            </button>
          </p>
        </motion.div>
      </div>

      {/* Decorative bottom border */}
      <div className="relative mt-auto">
        <div className="absolute top-0 left-0 right-0 h-6 bg-background rounded-b-[2rem]" />
        <div className="h-20 nzimbo-gradient opacity-50" />
      </div>
    </div>
  );
}
