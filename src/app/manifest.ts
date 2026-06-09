import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Torelli Agendamentos',
    short_name: 'Torelli',
    description: 'Barbearia Premium Torelli - Agendamentos online',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#ffbf00',
    icons: [
      {
        src: 'https://picsum.photos/seed/torelli-icon/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/torelli-icon/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
