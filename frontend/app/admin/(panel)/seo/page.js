import PermissionRoute from "@/components/routes/PermissionRoute";
import AdminSeo from "@/components/Admin/AdminSeo";
export default function SeoPage() {
  return <PermissionRoute moduleKey="seo"><AdminSeo /></PermissionRoute>;
}
