export default function PseudonymDisplay({ initialName }: { initialName: string }) {
  return <input type="text" defaultValue={initialName} className="ml-2 px-2 py-1 border rounded" />;
}
