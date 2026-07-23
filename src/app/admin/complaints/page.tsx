"use client";

import { ComplaintList } from "@/components/complaint-list";
import { PageHeader } from "@/components/ui";

export default function AdminComplaintsPage() {
  return (
    <div>
      <PageHeader
        title="Complaints"
        description="All order issues reported across the platform."
      />
      <ComplaintList endpoint="/complaints/admin" showProvider />
    </div>
  );
}