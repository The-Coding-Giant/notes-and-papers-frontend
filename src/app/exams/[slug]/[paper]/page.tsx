import { PaperPage, paperMetadata } from "@/components/shared/paper-page";

export const revalidate = 86400;
export const dynamicParams = true;

export async function generateMetadata(props: PageProps<"/exams/[slug]/[paper]">) {
  return paperMetadata((await props.params).paper);
}

export default async function Page(props: PageProps<"/exams/[slug]/[paper]">) {
  const { slug, paper } = await props.params;
  return <PaperPage slug={paper} canonical={{ exam: slug }} />;
}
