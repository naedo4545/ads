import Archive from "../../components/archive";
export default function DetailPage({ params }: { params: { id: string } }) {
  return <Archive mode="detail" id={params.id} />;
}
