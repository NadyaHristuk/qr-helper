import Image, { type StaticImageData } from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { HeroProducts } from './ProductMockup';
import styles from './HeroEnvironment.module.css';

export type HeroEnvironmentImage = {
  src: string | StaticImageData;
  alt: string;
  objectPosition?: {
    desktop?: string;
    mobile?: string;
  };
};

type HeroEnvironmentProps = {
  locale: 'ua' | 'en';
  image?: HeroEnvironmentImage;
  overlay?: ReactNode;
};

type CropStyle = CSSProperties & {
  '--hero-position-desktop': string;
  '--hero-position-mobile': string;
};

// To swap the fallback, pass one local /public image (or static import) and alt text.
// Keep essential localized copy in the page or overlay rather than baked into the image.
export function HeroEnvironment({ locale, image, overlay }: HeroEnvironmentProps) {
  const cropStyle: CropStyle | undefined = image ? {
    '--hero-position-desktop': image.objectPosition?.desktop ?? '50% 50%',
    '--hero-position-mobile': image.objectPosition?.mobile ?? image.objectPosition?.desktop ?? '50% 50%',
  } : undefined;

  return (
    <div className={styles.frame} style={cropStyle}>
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, (min-width: 640px) 520px, 100vw"
          className={styles.image}
        />
      ) : <HeroProducts locale={locale} />}
      {overlay && <div className={styles.overlay}>{overlay}</div>}
    </div>
  );
}
