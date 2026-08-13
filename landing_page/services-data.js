/**
 * Catálogo de serviços — Espaço Bárbara Rodrigues
 * Categorias e modalidades para a seção #servicos
 */
window.BR_SERVICES = {
  categories: [
    {
      id: 'massagens',
      label: 'Massagens',
      description: 'Técnicas manuais que aliviam tensões, restauram o corpo e renovam suas energias.',
    },
    {
      id: 'terapias',
      label: 'Terapias Corporais',
      description: 'Abordagens especializadas para desconfortos, circulação e equilíbrio físico.',
    },
    {
      id: 'relaxamento',
      label: 'Relaxamento',
      description: 'Experiências sensoriais que acalmam a mente e harmonizam corpo e espírito.',
    },
    /**
    {
      id: 'relaxamento',
      label: 'Alívio para os pés',
      description: 'Rituais de cuidado que valorizam seu bem-estar com toque refinado.',
    },
    */
  ],
  items: [
    {
      id: 'relaxante',
      category: 'massagens',
      title: 'Massagem Relaxante',
      tagline: 'Suavidade para desacelerar',
      description:
        'Movimentos lentos e envolventes que induzem o relaxamento profundo, reduzindo o estresse acumulado e preparando corpo e mente para um estado de calma duradoura.',
      benefits: ['Reduz o estresse e a ansiedade', 'Melhora a qualidade do sono', 'Alivia tensões musculares leves', 'Promove sensação de leveza'],
      duration: '50 min',
      price: null,
      img: './img/carrossel/post_relaxante.png',
    },
    {
      id: 'terapeutica',
      category: 'massagens',
      title: 'Massagem Terapêutica',
      tagline: 'Foco em alívio e recuperação',
      description:
        'Trabalho direcionado às regiões com dor ou rigidez, combinando pressões e técnicas adequadas ao seu quadro para restaurar conforto e mobilidade.',
      benefits: ['Contribui para aliviar tensões e desconfortos musculares', 'Reduz pontos de tensão', 'Melhora amplitude de movimento', 'Auxilia na recuperação pós-esforço'],
      duration: '50 min',
      price: null,
      img: './img/carrossel/post_terapeutica.png',
    },
    {
      id: 'quick',
      category: 'massagens',
      title: 'Quick Massage',
      tagline: 'Bem-estar em pouco tempo',
      description:
        'Sessão expressa e eficiente, ideal para pausas no dia a dia. Concentra-se em pescoço, ombros e costas para alívio imediato sem comprometer a agenda.',
      benefits: ['Alívio rápido de tensões', 'Revigora entre compromissos', 'Melhora disposição', 'Prática para rotinas corridas'],
      duration: '15 - 30 min',
      price: null,
      img: './img/carrossel/post_quick.png',
    },
    {
      id: 'pedras',
      category: 'massagens',
      title: 'Pedras Quentes',
      tagline: 'Calor que acalma profundamente',
      description:
        'Pedras vulcânicas aquecidas aplicadas com movimentos suaves, liberando calor terapêutico que relaxa músculos profundos e proporciona sensação envolvente de bem-estar.',
      benefits: ['Relaxamento muscular profundo', 'Estimula circulação', 'Alivia rigidez', 'Experiência sensorial única'],
      duration: '50 min',
      price: null,
      img: './img/carrossel/post_pedras.png',
    },
    {
      id: 'linfatica',
      category: 'terapias',
      title: 'Drenagem Linfática',
      tagline: 'Leveza e equilíbrio corporal',
      description:
        'Técnica suave e ritmada que estimula o sistema linfático, favorecendo a eliminação de líquidos retidos e promovendo sensação de corpo mais leve e desinchado.',
      benefits: ['Reduz inchaço e retenção', 'Estimula circulação linfática', 'Pode contribuir para reduzir inchaço Pós-Cirúrgico', 'Favorece sensação de leveza e bem-estar'],
      duration: '50 min',
      price: null,
      img: './img/carrossel/post_linfatica.png',
    },
    {
      id: 'shiatsu',
      category: 'terapias',
      title: 'Shiatsu',
      tagline: 'Equilíbrio pela pressão consciente',
      description:
        'Origem japonesa: pressões nos meridianos energéticos do corpo com polegares e palmas, buscando restaurar o fluxo vital e o equilíbrio entre corpo e mente.',
      benefits: ['Harmoniza energia corporal', 'Alivia dores e fadiga', 'Melhora flexibilidade', 'Promove relaxamento profundo'],
      duration: '50 min',
      price: null,
      img: './img/carrossel/post_shiatsu.png',
    },
    {
      id: 'miofascial',
      category: 'terapias',
      title: 'Liberação Miofascial',
      tagline: 'Liberdade para o movimento',
      description:
        'Trabalho na fáscia — tecido que envolve os músculos — para soltar aderências, melhorar postura e devolver amplitude de movimento com conforto progressivo.',
      benefits: ['Reduz rigidez e aderências', 'Melhora postura', 'Aumenta mobilidade', 'Pode contribuir para reduzir tensões e desconfortos'],
      duration: '50 min',
      price: null,
      img: './img/carrossel/post_miofascial.png',
    },
    {
      id: 'quiro',
      category: 'terapias',
      title: 'Quiroterapia',
      tagline: 'Alinhamento e alívio manual',
      description:
        'Conjunto de técnicas manuais voltadas ao alinhamento estrutural e ao alívio de desconfortos articulares e musculares, com abordagem cuidadosa e personalizada.',
      benefits: ['Contribui para uma melhor percepção corporal e postura', 'Alivia tensões articulares', 'Melhora conforto no dia a dia', 'Complementa outras terapias'],
      duration: '50 min',
      price: null,
      img: './img/carrossel/post_quiro.png',
    },
    {
      id: 'reflexologia',
      category: 'relaxamento',
      title: 'Reflexologia',
      tagline: 'Bem-estar pelos pontos reflexos',
      description:
        'Estimulação de pontos reflexos nos pés e mãos que correspondem a órgãos e sistemas do corpo, promovendo relaxamento integral e sensação de renovação.',
      benefits: ['Relaxamento profundo', 'EFavorece relaxamento e percepção de bem-estar', 'Reduz estresse', 'Melhora qualidade do sono'],
      duration: '40 min',
      price: null,
      img: './img/carrossel/post_reflexologia.png',
    },
    {
      id: 'bioenergetica',
      category: 'relaxamento',
      title: 'Bioenergética',
      tagline: 'Corpo, emoção e energia em harmonia',
      description:
        'Integra toque terapêutico e consciência corporal para liberar bloqueios emocionais e energéticos, favorecendo autoconhecimento e vitalidade.',
      benefits: ['Libera tensões emocionais', 'Aumenta disposição vital', 'Promove autoconhecimento', 'Harmoniza corpo e mente'],
      duration: '50 min',
      price: null,
      img: './img/carrossel/post_bioenergetica.png',
    },
    {
      id: 'spa-pes',
      category: 'relaxamento',
      title: 'SPA dos Pés',
      tagline: 'Ritual completo para seus pés',
      description:
        'Experiência indulgente com esfoliação, hidratação e massagem nos pés — perfeita para relaxamento e sensação de renovação.',
      benefits: ['Pés macios e hidratados', 'Relaxamento imediato', 'Melhora circulação local', 'Momento de autocuidado'],
      duration: '40 min',
      price: null,
      img: './img/carrossel/post_spa_pes.png',
    },
  ],
};
