import Shop from "../../components/shop";
export default function ProductPage({ params }: { params: { id: string } }) {
  return <Shop mode="detail" id={params.id} />;
}
