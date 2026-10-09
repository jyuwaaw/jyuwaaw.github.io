import Image from 'next/image';
import { site } from '@/lib/site';

export default function Avatar({ size = 80, className = '' }) {
  return (
    <span className={`avatar ${className}`} style={{ width: size, height: size }}>
      <Image
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${site.avatar}`}
        alt={site.name}
        width={1086}
        height={1448}
      />
    </span>
  );
}
