import Image from 'next/image';
import { site } from '@/lib/site';

export default function Avatar({ size = 80, className = '' }) {
  return (
    <Image
      className={`avatar ${className}`}
      src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${site.avatar}`}
      alt={`${site.name}'s avatar`}
      width={size}
      height={size}
    />
  );
}
