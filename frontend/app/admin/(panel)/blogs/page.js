import AdminBlogs from '@/components/Admin/AdminBlogs';

export default async function AdminBlogsPage({ searchParams }) {
  const params = await searchParams;
  const editId = typeof params?.edit === "string" && /^[a-fA-F0-9]{24}$/.test(params.edit) ? params.edit : "";
  return <AdminBlogs initialEditId={editId} />;
}
