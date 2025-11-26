import Dashboard from './Dashboard'

export default function Index() {
  // Since Layout handles the Login view when not authenticated,
  // Index will only be rendered when authenticated (due to Layout logic)
  // So we can safely render Dashboard here.
  return <Dashboard />
}
