// src/pages/PricingCourse.tsx
import PageMeta from "../components/common/PageMeta";
import { useEffect, useState, useCallback, memo } from 'react';
import axios from 'axios';
import { Trash2, Plus, Edit, Loader2 } from 'lucide-react';
// Import Component Modal Sửa (Nhớ kiểm tra đường dẫn)
import EditPricingModal from "./Popup/EditPricingCourse"; 
import AddPricingModal from "./Popup/AddPricingCourse";

interface PricingPlan {
  id: string; 
  name: string;
  price: string;
  salePrice: string;
  descript: string[];
}

// 1. Component hiển thị từng Card (Memoized để tối ưu)
interface PlanCardProps {
  plan: PricingPlan;
  onDelete: (id: string) => void;
  onEdit: (plan: PricingPlan) => void; // Sửa type để nhận object plan
}

const PlanCard = memo(({ plan, onDelete, onEdit }: PlanCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
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
        <ul className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
          {Array.isArray(plan.descript) ? plan.descript.map((item, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-green-500 shrink-0 mt-0.5">✓</span> {item}
            </li>
          )) : <li className="text-red-500 text-sm">Lỗi định dạng mô tả</li>}
        </ul>
      </div>

      {/* Actions Button */}
      <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
        <button 
            onClick={() => onEdit(plan)} 
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          <Edit size={16} /> Sửa
        </button>
        <button 
            onClick={() => onDelete(plan.id)} 
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
        >
          <Trash2 size={16} /> Xóa
        </button>
      </div>
    </div>
  );
});
PlanCard.displayName = "PlanCard";


// 2. Component Chính
export default function PricingCourse() {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(false);

    // State cho Modal Thêm Mới
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // State cho Modal Sửa
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);

    const API_URL = "https://694cec27da5ddabf0037d71b.mockapi.io/pricing_plans";

    // --- HÀM LOAD DATA ---
    const fetchPlans = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL);
            setPlans(response.data);
        } catch (error) {
            console.error("Lỗi lấy data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);


    // --- HÀM XÓA ---
    const handleDelete = useCallback(async (id: string) => {
        if (window.confirm("Bạn có chắc muốn xóa gói này không?")) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                setPlans(currentPlans => currentPlans.filter((plan) => plan.id !== id));
                alert("Đã xóa thành công!");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                alert(error.response?.data?.message || "Xóa thất bại");
            }
        }
    }, []);


    // --- HÀM XỬ LÝ SỬA ---
    const handleEditClick = useCallback((plan: PricingPlan) => {
        setEditingPlan(plan);
        setIsEditModalOpen(true);
    }, []);

    // Callback khi sửa xong (từ Modal con gọi lên)
    const handleUpdateSuccess = useCallback((updatedPlan: PricingPlan) => {
        setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    }, []);

    // Callback khi thêm mới thành công
    const handleAddSuccess = useCallback((newPlan: PricingPlan) => {
        setPlans(prev => [...prev, newPlan]);
    }, []);

    // Các hàm đóng popup dùng useCallback
    const handleCloseAdd = useCallback(() => {
        setIsAddModalOpen(false);
    }, []);

    const handleCloseEdit = useCallback(() => {
        setIsEditModalOpen(false);
    }, []);
    

    return (
        <div>
            <PageMeta title="Pricing Dashboard" description="Manage pricing plans" />

            <div className="p-6 bg-gray-50 min-h-screen relative">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Bảng Giá</h1>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                        <Plus size={20} /> Thêm gói mới
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
                        <span className="ml-2 text-gray-600">Đang tải gói khóa học...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <PlanCard 
                                key={plan.id} 
                                plan={plan} 
                                onDelete={handleDelete} 
                                onEdit={handleEditClick} 
                            />
                        ))}
                    </div>
                )}

                {/* --- 1. POPUP THÊM MỚI --- */}
                <AddPricingModal 
                    isOpen={isAddModalOpen}
                    onClose={handleCloseAdd}
                    onSuccess={handleAddSuccess}
                />

                {/* --- 2. POPUP SỬA (Gọi Component Con) --- */}
                <EditPricingModal 
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEdit}
                    initialData={editingPlan}
                    onSuccess={handleUpdateSuccess}
                />

            </div>
        </div>
    );
}