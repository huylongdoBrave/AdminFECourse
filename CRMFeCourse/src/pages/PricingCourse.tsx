// src/pages/PricingCourse.tsx
import PageMeta from "../components/common/PageMeta";
import { useEffect, useState, useCallback, memo } from 'react';
import axios from 'axios';
import { Trash2, Plus, Edit, X, Save, Loader2, Check } from 'lucide-react';
// Import Component Modal Sửa (Nhớ kiểm tra đường dẫn)
import EditPricingModal from "./Popup/EditPricingCourse"; 

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "", price: "", salePrice: "", currentDesc: "", descript: [] as string[]
    });

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


    // --- HÀM XỬ LÝ FORM THÊM MỚI ---
    const handleAddDescToInterceptor = useCallback(() => {
        if (!formData.currentDesc.trim()) return;
        setFormData(prev => ({
            ...prev,
            descript: [...prev.descript, prev.currentDesc],
            currentDesc: "" 
        }));
    }, [formData.currentDesc]); // Phụ thuộc vào giá trị input hiện tại

    const handleRemoveTempDesc = useCallback((indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            descript: prev.descript.filter((_, index) => index !== indexToRemove)
        }));
    }, []);

    const handleSave = useCallback(async () => {
        if (!formData.name || !formData.price || !formData.salePrice) {
            alert("Vui lòng nhập đủ thông tin!");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await axios.post(API_URL, {
                name: formData.name, 
                price: formData.price, 
                salePrice: formData.salePrice, 
                descript: formData.descript
            });
            setPlans(prev => [...prev, res.data]);
            setFormData({ name: "", price: "", salePrice: "", currentDesc: "", descript: [] });
            setIsAddModalOpen(false); 
            alert("Thêm thành công!");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            alert("Lỗi thêm: " + e.message); 
        } finally { 
            setIsSubmitting(false); 
        }
    }, [formData]);


    // --- HÀM XỬ LÝ SỬA ---
    const handleEditClick = useCallback((plan: PricingPlan) => {
        setEditingPlan(plan);
        setIsEditModalOpen(true);
    }, []);

    // Callback khi sửa xong (từ Modal con gọi lên)
    const handleUpdateSuccess = useCallback((updatedPlan: PricingPlan) => {
        setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
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
                        <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
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
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-xl font-bold text-gray-800">Thêm Gói Cước Mới</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded-full">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên gói</label>
                                    <input type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Gói VIP" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc</label>
                                        <input type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="5.000.000đ" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá KM</label>
                                        <input type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: e.target.value})} placeholder="2.990.000đ" />
                                    </div>
                                </div>
                                
                                {/* Quyền lợi */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quyền lợi</label>
                                    <div className="flex gap-2 mb-3">
                                        <input type="text" className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
                                            value={formData.currentDesc} 
                                            onChange={e => setFormData({...formData, currentDesc: e.target.value})}
                                            onKeyDown={e => e.key === 'Enter' && handleAddDescToInterceptor()}
                                            placeholder="Nhập quyền lợi..." />
                                        <button onClick={handleAddDescToInterceptor} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <ul className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                                        {formData.descript.map((item, idx) => (
                                            <li key={idx} className="flex justify-between items-center bg-white px-3 py-2 rounded border text-sm">
                                                <span className="flex items-center gap-2"><Check size={14} className="text-green-500" /> {item}</span>
                                                <button onClick={() => handleRemoveTempDesc(idx)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-5 border-t border-gray-100 flex gap-3 bg-gray-50">
                                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100">Hủy</button>
                                <button onClick={handleSave} disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2 disabled:opacity-70">
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 2. POPUP SỬA (Gọi Component Con) --- */}
                <EditPricingModal 
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    initialData={editingPlan}
                    onSuccess={handleUpdateSuccess}
                />

            </div>
        </div>
    );
}