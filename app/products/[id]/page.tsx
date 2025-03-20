import db from "@/lib/db";

async function getProduct(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 10000));
}

export default async function ProductDetail({ 
  params: {id}
}:{
  params: {
    id: string;
  };
}) {
  const product = await getProduct(id);
  return <div>ProductDetail {id}</div>;
}
