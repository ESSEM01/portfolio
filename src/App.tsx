import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { HomePage } from './features/home/HomePage'
import { CaseStudyPage } from './features/work/CaseStudyPage'
import { NotFoundPage } from './features/not-found/NotFoundPage'

// The router lives in main.tsx so tests can wrap App in a MemoryRouter.
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="work/:slug" element={<CaseStudyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
