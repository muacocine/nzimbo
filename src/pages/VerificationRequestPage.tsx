import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, User, FileText, Link as LinkIcon, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import badgeBlue from '@/assets/badge-blue.png';
import badgeBlack from '@/assets/badge-black.png';

const STEPS = [
  { id: 1, title: 'Informações', icon: User },
  { id: 2, title: 'Motivo', icon: FileText },
  { id: 3, title: 'Links', icon: LinkIcon },
  { id: 4, title: 'Confirmação', icon: Check },
];

export default function VerificationRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    document_type: 'bi',
    reason: '',
    social_links: ['', '', ''],
  });

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSocialLink = (index: number, value: string) => {
    const links = [...formData.social_links];
    links[index] = value;
    updateFormData('social_links', links);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.full_name.trim().length >= 3;
      case 2:
        return formData.reason.trim().length >= 20;
      case 3:
        return formData.social_links.some(link => link.trim().length > 0);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          full_name: formData.full_name,
          document_type: formData.document_type,
          reason: formData.reason,
          social_links: formData.social_links.filter(link => link.trim()),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Solicitação enviada!',
        description: 'Sua solicitação de verificação foi enviada para análise.'
      });
      navigate('/settings');
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível enviar a solicitação.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showFooter={false}>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-display font-bold">Solicitar Verificação</h1>
                <p className="text-sm text-muted-foreground">
                  Passo {currentStep} de 4
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.id
                        ? 'nzimbo-gradient text-primary-foreground'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-12 sm:w-20 h-1 mx-2 rounded-full transition-all ${
                      currentStep > step.id ? 'nzimbo-gradient' : 'bg-secondary'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="nzimbo-card p-6"
            >
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="flex justify-center gap-4 mb-4">
                      <img src={badgeBlue} alt="Badge Azul" className="w-16 h-16" />
                      <img src={badgeBlack} alt="Badge Preto" className="w-16 h-16" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Seja Verificado</h2>
                    <p className="text-muted-foreground text-sm">
                      Ganhe destaque e credibilidade com o selo de verificação
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nome Completo (como no documento)</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => updateFormData('full_name', e.target.value)}
                        placeholder="Seu nome completo"
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de Documento</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'bi', label: 'Bilhete de Identidade' },
                          { id: 'passport', label: 'Passaporte' },
                        ].map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => updateFormData('document_type', doc.id)}
                            className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                              formData.document_type === doc.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            {doc.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h2 className="text-xl font-semibold mb-2">Por que você merece ser verificado?</h2>
                    <p className="text-muted-foreground text-sm">
                      Conte-nos sobre você e suas conquistas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Motivo da Verificação</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => updateFormData('reason', e.target.value)}
                      placeholder="Ex: Sou um profissional reconhecido na área de desenvolvimento web, com mais de 5 anos de experiência e diversos projetos de sucesso..."
                      className="rounded-xl resize-none min-h-[200px]"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.reason.length}/500 caracteres (mínimo 20)
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <LinkIcon className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h2 className="text-xl font-semibold mb-2">Links de Comprovação</h2>
                    <p className="text-muted-foreground text-sm">
                      Adicione links para suas redes sociais ou portfólio
                    </p>
                  </div>

                  <div className="space-y-4">
                    {['Link 1 (obrigatório)', 'Link 2 (opcional)', 'Link 3 (opcional)'].map((label, i) => (
                      <div key={i} className="space-y-2">
                        <Label htmlFor={`link-${i}`}>{label}</Label>
                        <Input
                          id={`link-${i}`}
                          value={formData.social_links[i]}
                          onChange={(e) => updateSocialLink(i, e.target.value)}
                          placeholder="https://..."
                          className="h-12 rounded-xl"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full nzimbo-gradient flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Confirmar Solicitação</h2>
                    <p className="text-muted-foreground text-sm">
                      Revise suas informações antes de enviar
                    </p>
                  </div>

                  <div className="space-y-4 bg-secondary/50 rounded-xl p-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Nome</p>
                      <p className="font-medium">{formData.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Documento</p>
                      <p className="font-medium">
                        {formData.document_type === 'bi' ? 'Bilhete de Identidade' : 'Passaporte'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Motivo</p>
                      <p className="text-sm">{formData.reason.substring(0, 100)}...</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Links</p>
                      <div className="space-y-1">
                        {formData.social_links.filter(l => l).map((link, i) => (
                          <p key={i} className="text-sm text-primary truncate">{link}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Ao enviar, você concorda com nossos termos de uso e confirma que as informações são verdadeiras.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button
              onClick={handlePrev}
              variant="outline"
              disabled={currentStep === 1}
              className="rounded-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="rounded-full nzimbo-gradient text-primary-foreground"
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-full nzimbo-gradient text-primary-foreground"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Solicitação
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
