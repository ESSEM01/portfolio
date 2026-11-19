import { site } from '../../content/site'
import { CrateHome } from '../crate/CrateHome'

export function HomePage() {
  return (
    <>
      <title>{`${site.name}, web developer`}</title>
      <CrateHome />
    </>
  )
}
