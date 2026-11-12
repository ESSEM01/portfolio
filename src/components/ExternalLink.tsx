import type { ComponentProps } from 'react'

/** Every link that leaves the site goes through here, so rel/target stay consistent. */
export function ExternalLink(props: Omit<ComponentProps<'a'>, 'target' | 'rel'>) {
  return <a {...props} target="_blank" rel="noopener noreferrer" />
}
