import PlatformTable from '@/components/PlatformTable';
import FormatMappingTable from '@/components/FormatMappingTable';

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Platform Management</h1>
      <PlatformTable />

      <div className="mt-12">
        <h1 className="text-2xl font-bold mb-6">Format Mappings</h1>
        <FormatMappingTable />
      </div>
    </div>
  );
}
