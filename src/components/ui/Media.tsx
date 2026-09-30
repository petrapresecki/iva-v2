import type { Media as MediaItem } from '@/data/projects'
import LazyVideo from '@/components/ui/LazyVideo'

interface MediaProps {
  media: MediaItem
  className?: string
  // Apply the media's aspect ratio to the wrapper
  sized?: boolean
  rounded?: boolean
}

export default function Media({ media, className = '', sized = true, rounded = true }: MediaProps) {
  return (
    <div
      data-media
      className={`overflow-hidden bg-mist ${rounded ? 'rounded-[10px]' : ''} ${className}`}
      style={sized ? { aspectRatio: media.ratio } : undefined}
    >
      {media.type === 'video' ? (
        <LazyVideo src={media.src} className="h-full w-full object-cover" />
      ) : (
        <img src={media.src} alt={media.alt ?? ''} loading="lazy" className="h-full w-full object-cover" />
      )}
    </div>
  )
}
