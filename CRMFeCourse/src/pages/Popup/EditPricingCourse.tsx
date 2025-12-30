"use client"
import { useState, useEffect, useCallback, memo, useRef } from "react"
import axios from "axios"
import { X, Save, Loader2, Plus, Trash2, Check } from "lucide-react"
import { useAlert } from "../../context/AlertContext"

// Interface dữ liệu
interface PricingPlan {
    id: string;
    name: string;
    price: string;
    salePrice: string;
    descript: string[];
}

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: PricingPlan | null; // Dữ liệu gói cần sửa
    onSuccess: (updatedPlan: PricingPlan) => void; // Hàm báo cho cha update lại list
}

// Tách các thành phần UI tĩnh để tránh re-render
const ModalHeader = memo(({ title, onClose }: { title: string, onClose: () => void }) => (
    <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
        <h3 className="text-xl font-bold text-gray-800">Sửa Gói: {title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded-full transition">
            <X size={24} />
        </button>
    </div>
));

const ModalFooter = memo(({ onClose, onSave, isSubmitting }: { onClose: () => void, onSave: () => void, isSubmitting: boolean }) => (
    <div className="p-5 border-t border-gray-100 flex gap-3 bg-gray-50">
        <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium">
            Hủy
        </button>
        <button 
            onClick={onSave}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex justify-center items-center gap-2 disabled:opacity-70"
        >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Lưu thay đổi
        </button>
    </div>
));

const DescriptionList = memo(({ items, onRemove }: { items: string[], onRemove: (index: number) => void }) => (
    <ul className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
        {items.map((item, idx) => (
            <li key={idx} className="flex justify-between items-center bg-white px-3 py-2 rounded border border-gray-200 text-sm">
                <span className="flex items-center gap-2 text-gray-700">
                    <Check size={14} className="text-green-500"/>
                    {item}
                </span>
                <button onClick={() => onRemove(idx)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={14} />
                </button>
            </li>
        ))}
    </ul>
));

const EditPricingModal: React.FC<EditModalProps> = ({ isOpen, onClose, initialData, onSuccess }) => {
    const {showAlert} = useAlert();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State form
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        salePrice: "",
        currentDesc: "", // Ô nhập tạm cho quyền lợi
        descript: [] as string[]
    });

    const API_URL = "https://694cec27da5ddabf0037d71b.mockapi.io/pricing_plans";

    // Ref để giữ giá trị mới nhất, tránh re-render nút Lưu khi gõ phím
    const formDataRef = useRef(formData);
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    // Đổ dữ liệu cũ vào form khi mở popup
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                price: initialData.price,
                salePrice: initialData.salePrice,
                currentDesc: "",
                descript: initialData.descript || []
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData?.id, isOpen]);

    // Thêm 1 dòng quyền lợi vào danh sách tạm
    const handleAddDesc = useCallback(() => {
        setFormData(prev => {
            if (!prev.currentDesc.trim()) return prev;
            return {
                ...prev,
                descript: [...prev.descript, prev.currentDesc],
                currentDesc: ""
            };
        });
    }, []);

    // Xóa 1 dòng quyền lợi
    const handleRemoveDesc = useCallback((indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            descript: prev.descript.filter((_, index) => index !== indexToRemove)
        }));
    }, []);

    // Hàm LƯU (GỌI API PUT)
    const handleUpdate = useCallback(async () => {
        const currentData = formDataRef.current;
        if (!initialData) return;
        
        // Validate cơ bản
        if (!currentData.name || !currentData.price) {
            
            return;
        }

        setIsSubmitting(true);
        try {
            // Chuẩn bị dữ liệu
            const updatedPlan = {
                name: currentData.name,
                price: currentData.price,
                salePrice: currentData.salePrice,
                descript: currentData.descript
            };

            // Gọi API PUT
            const response = await axios.put(`${API_URL}/${initialData.id}`, updatedPlan);

            // Báo cho cha biết thành công
            onSuccess(response.data);
            onClose(); 
            showAlert("Cập nhật thành công!", "success", "Thành công");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
            showAlert("Lỗi cập nhật", "error", (error.response?.data || error.message));
        } finally {
            setIsSubmitting(false);
        }
    }, [initialData, onClose, onSuccess, showAlert]);

    if (!isOpen || !initialData) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <ModalHeader title={initialData.name} onClose={onClose} />

                {/* Body */}
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Tên Gói */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên gói học</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.name}
                            onChange={(e) => {const val = e.target.value; setFormData(prev => ({...prev, name: val}))}}
                        />
                    </div>

                    {/* Giá tiền */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.price}
                                onChange={(e) => {const val = e.target.value; setFormData(prev => ({...prev, price: val}))}}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá khuyến mãi</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.salePrice}
                                onChange={(e) => {const val = e.target.value; setFormData(prev => ({...prev, salePrice: val}))}}
                            />
                        </div>
                    </div>

                    {/* Danh sách quyền lợi (Edit) */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chỉnh sửa quyền lợi</label>
                        
                        {/* Ô nhập + Nút thêm */}
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="text" 
                                placeholder="Thêm quyền lợi mới..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                                value={formData.currentDesc}
                                onChange={(e) => {const val = e.target.value; setFormData(prev => ({...prev, currentDesc: val}))}}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddDesc()}
                            />
                            <button onClick={handleAddDesc} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">
                                <Plus size={18} />
                            </button>
                        </div>

                        {/* List items */}
                        <DescriptionList items={formData.descript} onRemove={handleRemoveDesc} />
                    </div>
                </div>

                {/* Footer */}
                <ModalFooter onClose={onClose} onSave={handleUpdate} isSubmitting={isSubmitting} />
            </div>
        </div>
    );
}

export default memo(EditPricingModal);