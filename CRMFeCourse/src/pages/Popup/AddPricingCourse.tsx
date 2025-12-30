
import { useState, useCallback, memo, useRef, useEffect } from "react"
import axios from "axios"
import { Plus, X, Save, Loader2, Check } from "lucide-react"

interface AddPricingProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (newPlan: any) => void;
}

const ModalHeader = memo(({ onClose }: { onClose: () => void }) => (
    <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
        <h3 className="text-xl font-bold text-gray-800">Thêm Gói Cước Mới</h3>
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
            Lưu
        </button>
    </div>
));

const DescriptionList = memo(({ descript, onRemove }: { descript: string[], onRemove: (index: number) => void }) => (
    <ul className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
        {descript.map((item, idx) => (
            <li key={idx} className="flex justify-between items-center bg-white px-3 py-2 rounded border border-gray-200 text-sm">
                <span className="flex items-center gap-2"><Check size={14} className="text-green-500" /> {item}</span>
                <button onClick={() => onRemove(idx)} className="text-red-400 hover:text-red-600 p-1"><X size={14}/></button>
            </li>
        ))}
    </ul>
));

const AddPricingModal: React.FC<AddPricingProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "", price: "", salePrice: "", currentDesc: "", descript: [] as string[]
    });

    // Ref để giữ giá trị mới nhất, tránh re-render nút Lưu khi gõ phím
    const formDataRef = useRef(formData);
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    // Reset form khi mở modal
    useEffect(() => {
        if (isOpen) {
            setFormData({ name: "", price: "", salePrice: "", currentDesc: "", descript: [] });
        }
    }, [isOpen]);

    const API_URL = "https://694cec27da5ddabf0037d71b.mockapi.io/pricing_plans";

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

    const handleRemoveDesc = useCallback((indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            descript: prev.descript.filter((_, index) => index !== indexToRemove)
        }));
    }, []);

    const handleSave = useCallback(async () => {
        const currentData = formDataRef.current;
        if (!currentData.name || !currentData.price || !currentData.salePrice) {
            alert("Vui lòng nhập đủ thông tin!");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await axios.post(API_URL, {
                name: currentData.name, 
                price: currentData.price, 
                salePrice: currentData.salePrice, 
                descript: currentData.descript
            });
            onSuccess(res.data);
            onClose();
            alert("Thêm thành công!");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            alert("Lỗi thêm: " + e.message); 
        } finally { 
            setIsSubmitting(false); 
        }
    }, [onClose, onSuccess]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <ModalHeader onClose={onClose} />

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên gói</label>
                        <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.name} onChange={e => {const val = e.target.value; setFormData(prev => ({...prev, name: val}))}} placeholder="VD: Gói VIP" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc</label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.price} onChange={e => {const val = e.target.value; setFormData(prev => ({...prev, price: val}))}} placeholder="5.000.000đ" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá KM</label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.salePrice} onChange={e => {const val = e.target.value; setFormData(prev => ({...prev, salePrice: val}))}} placeholder="2.990.000đ" />
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quyền lợi</label>
                        <div className="flex gap-2 mb-3">
                            <input type="text" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                                value={formData.currentDesc} 
                                onChange={e => {const val = e.target.value; setFormData(prev => ({...prev, currentDesc: val}))}}
                                onKeyDown={e => e.key === 'Enter' && handleAddDesc()}
                                placeholder="Nhập quyền lợi..." />
                            <button onClick={handleAddDesc} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
                                <Plus size={18} />
                            </button>
                        </div>
                        <DescriptionList descript={formData.descript} onRemove={handleRemoveDesc} />
                    </div>
                </div>

                <ModalFooter onClose={onClose} onSave={handleSave} isSubmitting={isSubmitting} />
            </div>
        </div>
    );
};

export default memo(AddPricingModal);
