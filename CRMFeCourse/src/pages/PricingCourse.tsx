import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Plus, Edit } from 'lucide-react';

interface PricingPlan {
  id: string; // Lưu ý: MockAPI thường trả về ID là String ("1"), không phải Number
  name: string;
  price: string;
  salePrice: string;
  descript: string[];
}

export default function PricingCourse() {
    const [plans, setPlans] = useState <PricingPlan[]> ([]);
    const [loading, setLoading] = useState(false);

    const API_URL = "https://694cec27da5ddabf0037d71b.mockapi.io/pricing_plans";

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL);
            setPlans(response.data);
        } catch (error) {
            console.error("Lỗi lấy data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa gói này không?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        // Xóa thành công thì lọc bỏ khỏi danh sách hiển thị
        setPlans(plans.filter((plan) => plan.id !== id));
        alert("Đã xóa thành công!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        alert(error.response.data.message ||"Xóa thất bại");
      }
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div>
      <PageMeta
        title="React.js Pricing Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Pricing Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Pricing Page" />


          {/* <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Start putting content on grids or panels, you can also use different
            combinations of grids.Please check out the dashboard and other pages
          </p> */}

        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Bảng Giá</h1>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                <Plus size={20} /> Thêm gói mới
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Đang tải dữ liệu...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                    {/* Header Card */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        <div className="mt-1">
                            <span className="text-2xl font-bold text-blue-600">{plan.salePrice}</span>
                            <span className="text-sm text-gray-400 line-through ml-2">{plan.price}</span>
                        </div>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        ID: {plan.id}
                        </span>
                    </div>

                    {/* Description List */}
                    <div className="flex-1 mb-6">
                        <p className="text-sm font-semibold text-gray-500 mb-2">Quyền lợi:</p>
                        <ul className="space-y-2">
                        {/* MockAPI đôi khi trả về descript dạng chuỗi JSON nếu import lỗi, cần check */}
                        {Array.isArray(plan.descript) ? plan.descript.map((item, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-green-500">✓</span> {item}
                            </li>
                        )) : <li className="text-red-500 text-sm">Lỗi định dạng mô tả</li>}
                        </ul>
                    </div>

                    {/* Actions Button */}
                    <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
                        <button 
                        onClick={() => alert("Chức năng sửa làm sau nhé!")}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                        <Edit size={16} /> Sửa
                        </button>
                        <button 
                        onClick={() => handleDelete(plan.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                        <Trash2 size={16} /> Xóa
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            )}
        </div>

    </div>

  );
}
