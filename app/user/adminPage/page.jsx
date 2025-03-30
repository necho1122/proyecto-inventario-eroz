import UserManagement from '@/components/UserManagement'

export default function AdminPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
      <UserManagement />
    </div>
  )
}
