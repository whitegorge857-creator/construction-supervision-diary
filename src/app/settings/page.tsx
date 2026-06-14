import Layout from '@/components/Layout';

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">系统设置</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">基本设置</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                系统名称
              </label>
              <input
                type="text"
                defaultValue="监督日记系统"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主题
              </label>
              <select className="w-full p-2 border rounded-lg">
                <option>浅色主题</option>
                <option>深色主题</option>
              </select>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              保存设置
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
