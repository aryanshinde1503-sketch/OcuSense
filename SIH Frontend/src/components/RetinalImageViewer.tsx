import type { RetinalImage } from '../types';
import Badge from './Badge';

export default function RetinalImageViewer({
  image,
  size = 'md',
}: {
  image: Pick<RetinalImage, 'url' | 'qualityLabel'>;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dims = size === 'lg' ? 'h-72 w-72 sm:h-80 sm:w-80' : size === 'sm' ? 'h-24 w-24' : 'h-48 w-48';
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className={`overflow-hidden rounded-full ring-4 ring-navy-800/90 ${dims}`}>
        <img src={image.url} alt="Retinal fundus scan" className="h-full w-full object-cover" />
      </div>
      {size !== 'sm' && <Badge tone="teal">Image quality: {image.qualityLabel}</Badge>}
    </div>
  );
}
