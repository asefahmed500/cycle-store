import { DataTable } from "@/components/dashboard/DataTable"
import { columns } from "./columns"

const data = [
  {
    id: "728ed52f",
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    role: "user",
  },
  {
    id: "489e1d42",
    name: "Jane Smith",
    email: "jane@example.com",
    status: "inactive",
    role: "admin",
  },
  // Add more mock data as needed
]

export default function UserManagement() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
      <DataTable columns={columns} data={data} />
    </div>
  )
}

