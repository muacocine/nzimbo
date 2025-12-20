import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/Logo';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const COURSES = [
  'Engenharia Informática',
  'Design Gráfico',
  'Marketing Digital',
  'Administração',
  'Direito',
  'Medicina',
  'Arquitectura',
  'Economia',
  'Psicologia',
  'Comunicação Social',
  'Outro'
];

const EDUCATION_LEVELS = [
  { value: 'medio', label: 'Ensino Médio', icon: 'cracha' as const },
  { value: 'universidade', label: 'Universidade', icon: 'ideia' as const }
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    courses: [] as string[],
    educationLevel: '',
    password: '',
    confirmPassword: ''
  });

  const totalSteps = 5;

  const updateField = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCourse = (course: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(course)
        ? prev.courses.filter(c => c !== course)
        : [...prev.courses, course]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return formData.fullName.trim().length >= 3;
      case 1: return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      case 2: return formData.courses.length > 0;
      case 3: return formData.educationLevel !== '';
      case 4: return formData.password.length >= 8 && formData.password === formData.confirmPassword;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const { error } = await signUp(formData.email, formData.password, {
          full_name: formData.fullName,
          courses: formData.courses,
          education_level: formData.educationLevel
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Email já registrado',
              description: 'Tente fazer login ou use outro email.',
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Erro ao criar conta',
              description: error.message,
              variant: 'destructive'
            });
          }
        } else {
          toast({
            title: 'Conta criada com sucesso!',
            description: 'Bem-vindo ao Nzimbo!'
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
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Decorative top border with curve effect */}
      <div className="relative">
        <div className="h-28 nzimbo-gradient" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[2rem]" />
      </div>

      <div className="flex-1 container mx-auto px-6 -mt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Logo size="sm" showText={false} />
          <div className="w-10" />
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator currentStep={step} totalSteps={totalSteps} />
        </div>

        {/* Form Steps */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait" custom={step}>
            {step === 0 && (
              <motion.div
                key="name"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <AnimatedIcon icon="utilizador" size="xl" />
                  </div>
                  <h1 className="text-2xl font-display font-bold mb-2">
                    Qual é o seu nome?
                  </h1>
                  <p className="text-muted-foreground">
                    Como gostaria de ser chamado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="Ex: João Silva"
                    className="h-14 text-lg rounded-xl"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="email"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <AnimatedIcon icon="conecte" size="xl" />
                  </div>
                  <h1 className="text-2xl font-display font-bold mb-2">
                    Qual é o seu email?
                  </h1>
                  <p className="text-muted-foreground">
                    Usaremos para entrar em contato
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="h-14 text-lg rounded-xl"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="courses"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <AnimatedIcon icon="ideia" size="xl" />
                  </div>
                  <h1 className="text-2xl font-display font-bold mb-2">
                    Suas áreas de interesse
                  </h1>
                  <p className="text-muted-foreground">
                    Selecione um ou mais cursos
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {COURSES.map((course) => (
                    <button
                      key={course}
                      onClick={() => toggleCourse(course)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                        formData.courses.includes(course)
                          ? 'nzimbo-gradient text-primary-foreground shadow-nzimbo-sm'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      )}
                    >
                      {formData.courses.includes(course) && (
                        <Check className="w-4 h-4 inline mr-1" />
                      )}
                      {course}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="education"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <AnimatedIcon icon="cracha" size="xl" />
                  </div>
                  <h1 className="text-2xl font-display font-bold mb-2">
                    Nível de Educação
                  </h1>
                  <p className="text-muted-foreground">
                    Qual é o seu nível educacional?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {EDUCATION_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => updateField('educationLevel', level.value)}
                      className={cn(
                        'p-6 rounded-2xl border-2 text-center transition-all duration-200',
                        formData.educationLevel === level.value
                          ? 'border-primary bg-primary/5 shadow-nzimbo-sm'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className="flex justify-center mb-2">
                        <AnimatedIcon icon={level.icon} size="lg" />
                      </div>
                      <span className="font-medium text-foreground">{level.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="password"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <AnimatedIcon icon="conta" size="xl" />
                  </div>
                  <h1 className="text-2xl font-display font-bold mb-2">
                    Crie sua senha
                  </h1>
                  <p className="text-muted-foreground">
                    Uma senha forte para proteger sua conta
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="••••••••"
                      className="h-14 text-lg rounded-xl"
                      autoFocus
                    />
                    <PasswordStrengthIndicator password={formData.password} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      className={cn(
                        'h-14 text-lg rounded-xl',
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-destructive focus-visible:ring-destructive'
                          : ''
                      )}
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-sm text-destructive">As senhas não coincidem</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="container mx-auto px-6 py-6">
        <Button
          onClick={handleNext}
          disabled={!canProceed() || loading}
          className="w-full h-14 text-lg font-semibold rounded-2xl nzimbo-gradient text-primary-foreground shadow-nzimbo-md hover:shadow-nzimbo-lg transition-all duration-300 disabled:opacity-50"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full"
            />
          ) : step === totalSteps - 1 ? (
            'Criar Conta'
          ) : (
            <>
              Continuar
              <ArrowRight className="ml-2 w-5 h-5" />
            </>
          )}
        </Button>
      </div>

      {/* Decorative bottom border */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-6 bg-background rounded-b-[2rem]" />
        <div className="h-20 nzimbo-gradient opacity-50" />
      </div>
    </div>
  );
}
