import { PledgeEditPage } from "@/client/pages/pledge-edit/PledgeEditPage.client";

export const metadata = {
  title: "공약 수정 | 공약포럼",
};

export default function Page({ params }: { params: { id: string } }) {
  return <PledgeEditPage pledgeId={params.id} />;
}
