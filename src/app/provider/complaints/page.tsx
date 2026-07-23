"use client";

import { ComplaintList } from "@/components/complaint-list";
import { PageHeader } from "@/components/ui";

export default function ProviderComplaintsPage() {
  return (
    <div>
      <PageHeader
        title="Complaints"
        description="Order issues reported by your customers. Update the status and reply so customers know what happened."
      />
      <ComplaintList endpoint="/complaints/provider" />
    </div>
  );
}