import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import StatusBadge from "@/components/status-badge";
import VendorStatusActions from "@/components/admin/vendor-status-actions";

export const dynamic = "force-dynamic";

export default async function AdminVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Vendors</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800">
            <tr>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                <td className="px-4 py-3">
                  <p className="font-medium">{v.storeName}</p>
                  {v.description && (
                    <p className="line-clamp-1 text-xs text-gray-500">{v.description}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p>{v.user.name}</p>
                  <p className="text-xs text-gray-500">{v.user.email}</p>
                </td>
                <td className="px-4 py-3">{v._count.products}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(v.createdAt)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={v.status} />
                </td>
                <td className="px-4 py-3">
                  <VendorStatusActions vendorId={v.id} status={v.status} />
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No vendors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
