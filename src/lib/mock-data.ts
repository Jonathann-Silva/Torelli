export const BARBERS = [
  {
    id: 'b1',
    name: 'Ricardo Silva',
    specialty: 'Barba e Toalha Quente',
    image: 'barber1',
    status: 'active',
    schedule: 'Seg - Sex, 09:00 - 19:00',
    break: '12:30 - 13:30'
  },
  {
    id: 'b2',
    name: 'Arthur Fontes',
    specialty: 'Cortes Modernos e Fade',
    image: 'barber2',
    status: 'inactive',
    schedule: 'Sem escala definida',
    break: '-'
  },
  {
    id: 'b3',
    name: 'Marco Aurélio',
    specialty: 'Visagismo e Barba Heritage',
    image: 'barber3',
    status: 'active',
    schedule: 'Ter - Sáb, 10:00 - 20:00',
    break: '14:00 - 15:00'
  }
];

export const SERVICES = [
  {
    id: 's1',
    name: 'Corte Signature Elite',
    description: 'Corte personalizado, lavagem com produtos premium e finalização com pomada importada.',
    duration: 45,
    price: 85,
    image: 'service-cut'
  },
  {
    id: 's2',
    name: 'Barba Imperial',
    description: 'Toalha quente, barbear com navalha e hidratação de fios.',
    duration: 30,
    price: 55,
    image: 'service-beard'
  },
  {
    id: 's3',
    name: 'Combo Master',
    description: 'Corte de cabelo + Barba + Sobrancelha inclusa.',
    duration: 75,
    price: 120,
    image: 'service-razor'
  }
];

export const APPOINTMENTS = [
  {
    id: 'a1',
    clientName: 'Ricardo Mendes',
    serviceName: 'Corte Degradê + Barba',
    barberName: 'Marcos Silva',
    date: '15 de Outubro, 2023',
    time: '14:00',
    status: 'ongoing',
    clientImage: 'client1'
  },
  {
    id: 'a2',
    clientName: 'Thiago Oliveira',
    serviceName: 'Corte Social',
    barberName: 'Gabriel Costa',
    date: '15 de Outubro, 2023',
    time: '15:00',
    status: 'confirmed',
    clientImage: 'client2'
  }
];