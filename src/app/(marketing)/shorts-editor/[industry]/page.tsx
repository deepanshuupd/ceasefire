import { buildIndustryPage } from "@/modules/seo-pages/generators/page-builder";

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ industry: string }>;
}) {
  const { industry } = await params;
  const page = buildIndustryPage(industry);

  return (
    <div>
      <h1>{page.title}</h1>
      <p>{page.description}</p>
    </div>
  );
}
