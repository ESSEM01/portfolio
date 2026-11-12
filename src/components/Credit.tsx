import type { Photo } from '../content/photos'
import { ExternalLink } from './ExternalLink'

export function Credit({ photo, className = '' }: { photo: Photo; className?: string }) {
  return (
    <figcaption className={`font-sans text-xs text-(--color-muted) ${className}`}>
      {photo.place}. Photo by <ExternalLink href={photo.credit.href}>{photo.credit.name}</ExternalLink>
    </figcaption>
  )
}
