import { createRootRoute, Outlet } from '@tanstack/react-router'
import GlobalHeader from '../components/GlobalHeader'

export const Route = createRootRoute({
  component: () => (
    <div style={{ minHeight: '100vh' }}>
      <GlobalHeader />
      <div style={{ paddingTop: '80px' }}>
        <Outlet />
      </div>
    </div>
  ),
})