//app/blog/[id]/page.tsx
//This component is the blog details page. It gets the data from params and fetches the blog data from the server. It also has a link to the blog list page.

import { GetServerSideProps } from "next";
// import { Blog } from "../../../types";
// import { getBlog } from "../../../utils/blog";
import Link from "next/link";
// import { Layout } from "../../../components/Layout";

// export const getServerSideProps: GetServerSideProps = async ({ params }) => {
//   const blog = await getBlog(params.id as string);
//   return {
//     props: { blog },
//   };
// };

export default function BlogPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">{"deneme"}</h1>
      <p className="text-lg text-gray-500">{"denememe"}</p>
    </div>
  );
}
