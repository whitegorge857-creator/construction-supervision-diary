import Layout from '@/components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">监督日记管理系统</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">今日日记</h2>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-gray-500 mt-2">还没有写日记</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">本周日记</h2>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-gray-500 mt-2">继续加油！</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">总日记数</h2>
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-gray-500 mt-2">开始记录吧</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
