import { useMemo } from 'react';

export interface PasswordStrength {
  score: number; // 0-4
  label: 'Muito Fraca' | 'Fraca' | 'Razoável' | 'Boa' | 'Forte';
  color: string;
  feedback: string[];
}

export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => {
    const feedback: string[] = [];
    let score = 0;

    if (!password) {
      return { score: 0, label: 'Muito Fraca', color: 'bg-muted', feedback: [] };
    }

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Mínimo 8 caracteres');
    }

    if (password.length >= 12) {
      score += 1;
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 0.5;
    } else {
      feedback.push('Adicione letras minúsculas');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 0.5;
    } else {
      feedback.push('Adicione letras maiúsculas');
    }

    // Number check
    if (/[0-9]/.test(password)) {
      score += 0.5;
    } else {
      feedback.push('Adicione números');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 0.5;
    } else {
      feedback.push('Adicione caracteres especiais (!@#$%)');
    }

    // Common patterns penalty
    const commonPatterns = ['123456', 'password', 'qwerty', 'abc123', '111111'];
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      score -= 1;
      feedback.push('Evite padrões comuns');
    }

    // Normalize score to 0-4
    const normalizedScore = Math.max(0, Math.min(4, Math.round(score)));

    const labels: PasswordStrength['label'][] = ['Muito Fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'];
    const colors = [
      'bg-destructive',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-400',
      'bg-green-500'
    ];

    return {
      score: normalizedScore,
      label: labels[normalizedScore],
      color: colors[normalizedScore],
      feedback: feedback.slice(0, 3)
    };
  }, [password]);
}
