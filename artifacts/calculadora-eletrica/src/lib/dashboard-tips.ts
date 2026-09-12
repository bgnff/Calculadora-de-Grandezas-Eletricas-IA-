import type { EnergyProfile } from '@/hooks/use-energy-profile';
import type { CalculationRecord, EnergyDevice, VoltivaSettings } from '@/hooks/use-voltiva-data';
import { deviceMonthlyKwh, totalMonthlyKwh } from '@/hooks/use-voltiva-data';

export type DashboardTipKind = 'profile' | 'consumption' | 'goal' | 'calculation' | 'safety';

export interface DashboardTip {
  id: string;
  kind: DashboardTipKind;
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  action: string;
}

interface DashboardTipContext {
  profile: EnergyProfile | null;
  calculations: CalculationRecord[];
  devices: EnergyDevice[];
  settings: VoltivaSettings;
}

function goalTip(total: number, target: number, devices: EnergyDevice[]): DashboardTip {
  if (!total) {
    return {
      id: 'start-consumption',
      kind: 'consumption',
      eyebrow: 'Próximo passo',
      title: 'Comece pelo seu mapa de consumo',
      text: `Sua meta está em ${target.toLocaleString('pt-BR')} kWh por mês. Cadastre os equipamentos que mais usa para transformar essa referência em uma estimativa baseada na sua rotina.`,
      href: '/app/consumption',
      action: 'Mapear consumo',
    };
  }

  if (total > target) {
    const difference = total - target;
    return {
      id: 'above-goal',
      kind: 'goal',
      eyebrow: 'Atenção ao consumo',
      title: 'Sua estimativa passou da meta',
      text: `A base atual está ${difference.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kWh acima do seu limite de ${target.toLocaleString('pt-BR')} kWh. Investigue primeiro o equipamento que mais pesa no mês.`,
      href: '/app/savings',
      action: 'Ver oportunidades',
    };
  }

  if (total >= target * 0.8) {
    return {
      id: 'near-goal',
      kind: 'goal',
      eyebrow: 'Meta mensal',
      title: 'Você está perto do limite definido',
      text: `Sua estimativa usa ${total.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} de ${target.toLocaleString('pt-BR')} kWh. Pequenas mudanças no tempo de uso podem preservar essa margem.`,
      href: '/app/savings',
      action: 'Acompanhar economia',
    };
  }

  return {
    id: 'under-goal',
    kind: 'goal',
    eyebrow: 'Meta mensal',
    title: 'Há margem dentro da sua meta',
    text: `A estimativa atual está em ${total.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kWh, abaixo dos ${target.toLocaleString('pt-BR')} kWh configurados. Continue registrando os usos para manter essa leitura confiável.`,
    href: '/app/consumption',
    action: devices.length ? 'Revisar equipamentos' : 'Adicionar equipamento',
  };
}

function deviceTip(devices: EnergyDevice[]): DashboardTip | null {
  if (!devices.length) return null;
  const total = totalMonthlyKwh(devices);
  const device = [...devices].sort((a, b) => deviceMonthlyKwh(b) - deviceMonthlyKwh(a))[0];
  const monthly = deviceMonthlyKwh(device);
  const share = total ? monthly / total : 0;

  if (share < 0.3 && device.hoursPerDay < 8) return null;

  return {
    id: 'largest-load',
    kind: 'consumption',
    eyebrow: 'Ponto de atenção',
    title: `${device.name} merece sua próxima revisão`,
    text: `${device.name} representa ${Math.round(share * 100)}% da estimativa cadastrada (${monthly.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kWh/mês). Compare o tempo de uso antes de trocar o equipamento.`,
    href: '/app/consumption',
    action: 'Revisar consumo',
  };
}

function calculationTip(calculation: CalculationRecord): DashboardTip {
  const messages: Record<CalculationRecord['type'], Omit<DashboardTip, 'id' | 'kind' | 'eyebrow'>> = {
    resistance: {
      title: 'Continue a análise da carga',
      text: 'Você calculou a resistência de um circuito. Calcule a corrente com a mesma tensão para conferir a carga antes de tomar uma decisão.',
      href: '/app/calculator',
      action: 'Calcular corrente',
    },
    current: {
      title: 'Confira a potência desse circuito',
      text: 'Depois de encontrar a corrente, estime a potência para comparar a carga com os equipamentos que você acompanha.',
      href: '/app/calculator',
      action: 'Calcular potência',
    },
    power: {
      title: 'Relacione a potência ao consumo',
      text: 'Você já calculou uma potência. Compare esse resultado com o tempo de uso no seu mapa de consumo para entender o impacto mensal.',
      href: '/app/consumption',
      action: 'Comparar consumo',
    },
    voltage: {
      title: 'Valide a tensão antes de avançar',
      text: 'O último cálculo encontrou uma tensão. Use esse valor junto da potência ou da corrente do equipamento para continuar o diagnóstico.',
      href: '/app/calculator',
      action: 'Novo cálculo',
    },
  };

  return {
    id: 'continue-calculation',
    kind: 'calculation',
    eyebrow: 'Ação recente',
    ...messages[calculation.type],
  };
}

function profileTip(profile: EnergyProfile | null): DashboardTip | null {
  if (!profile) {
    return {
      id: 'complete-profile',
      kind: 'profile',
      eyebrow: 'Personalização',
      title: 'Complete seu perfil energético',
      text: 'Suas escolhas de objetivo e interesse ajudam a ordenar as próximas recomendações da Voltiva para o que você quer resolver.',
      href: '/app/dashboard',
      action: 'Começar perfil',
    };
  }

  if (profile.interests.includes('safety')) {
    return {
      id: 'safety-context',
      kind: 'safety',
      eyebrow: 'Boa prática',
      title: 'Priorize segurança nas próximas decisões',
      text: 'Ao revisar um equipamento ou circuito, confirme tensão, corrente e potência compatíveis antes de alterar a instalação.',
      href: '/app/calculator',
      action: 'Revisar grandezas',
    };
  }

  if (profile.goal === 'learn') {
    return {
      id: 'learn-context',
      kind: 'profile',
      eyebrow: 'Seu objetivo',
      title: 'Aprenda a partir do que você já registrou',
      text: 'Use seus cálculos salvos como exemplos e compare cada grandeza com um equipamento real do seu mapa.',
      href: '/app/history',
      action: 'Abrir histórico',
    };
  }

  if (profile.goal === 'diagnose') {
    return {
      id: 'diagnose-context',
      kind: 'profile',
      eyebrow: 'Seu objetivo',
      title: 'Organize o diagnóstico por evidências',
      text: 'Comece pela carga mais relevante, registre as grandezas conhecidas e só depois compare cenários de consumo.',
      href: '/app/calculator',
      action: 'Iniciar diagnóstico',
    };
  }

  return null;
}

export function createDashboardTips({ profile, calculations, devices, settings }: DashboardTipContext): DashboardTip[] {
  const total = totalMonthlyKwh(devices);
  const tips: DashboardTip[] = [];
  const add = (tip: DashboardTip | null) => {
    if (tip && !tips.some((item) => item.id === tip.id)) tips.push(tip);
  };

  add(profileTip(profile));
  add(goalTip(total, settings.monthlyGoal, devices));
  add(deviceTip(devices));
  if (calculations.length) add(calculationTip(calculations[0]));

  return tips.slice(0, 3);
}