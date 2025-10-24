import PlatformTable from '@/components/PlatformTable';

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Platform Management</h1>
      <PlatformTable />
    </div>
  );
}
