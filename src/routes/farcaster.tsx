import { createFileRoute } from '@tanstack/react-router'
import FarcasterApp from '../components/FarcasterApp'

export const Route = createFileRoute('/farcaster')({
  component: () => <FarcasterApp />,
})