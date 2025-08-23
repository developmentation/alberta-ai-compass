import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "./admin/AdminDashboard";

export default function Admin() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}