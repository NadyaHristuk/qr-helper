import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'QR-Помічник',
    short_name: 'QR-Помічник',
    description: 'Створення та замовлення QR-продуктів для малого бізнесу.',
    start_url: '/ua',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#17365f',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
