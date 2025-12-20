import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: Users, title: 'Conecte-se', desc: 'Com milhares de freelancers' },
    { icon: Briefcase, title: 'Trabalhe', desc: 'Em projetos diversos' },
    { icon: GraduationCap, title: 'Cresça', desc: 'Desenvolva suas habilidades' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-32 nzimbo-gradient curved-border-top opacity-90" />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-primary/20 blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-accent/20 blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-20 pb-12 flex flex-col min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <Logo size="lg" />
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center flex-1 flex flex-col justify-center"
        >
          <div className="inline-flex items-center gap-2 mx-auto mb-6 px-4 py-2 rounded-full bg-secondary border border-border">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-secondary-foreground">
              Plataforma #1 em Angola
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight">
            <span className="text-foreground">Encontre </span>
            <span className="nzimbo-gradient-text">Talentos</span>
            <br />
            <span className="text-foreground">ou Ofereça </span>
            <span className="nzimbo-gradient-text">Serviços</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10">
            A plataforma de freelancers para estudantes e especialistas. 
            Conecte-se, trabalhe e cresça profissionalmente.
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-secondary flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <Button
            onClick={() => navigate('/register')}
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-2xl nzimbo-gradient text-primary-foreground shadow-nzimbo-md hover:shadow-nzimbo-lg transition-all duration-300 group"
          >
            Começar Agora
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary font-medium hover:underline"
            >
              Entrar
            </button>
          </p>
        </motion.div>
      </div>

      {/* Decorative bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-24 nzimbo-gradient curved-border-bottom opacity-50" />
    </div>
  );
}
