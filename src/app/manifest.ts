
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  const logoUrl = "https://www.dropbox.com/scl/fi/70fwazrji2098g5fwn6de/Logo.jpg?rlkey=jxz0q85l1qo54pnk0wa2huiqm&st=ead76oo8&raw=1";

  return {
    name: 'Barber Torelli',
    short_name: 'Barber Torelli',
    description: 'Barbearia Premium Torelli - Agendamentos online',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#ffbf00',
    icons: [
      {
        src: logoUrl,
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'any'
      },
      {
        src: logoUrl,
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any'
      },
      {
        src: logoUrl,
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'maskable'
      }
    ],
  }
}
