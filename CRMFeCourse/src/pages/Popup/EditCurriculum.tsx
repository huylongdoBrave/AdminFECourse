"use client"
import { useState, useEffect, useCallback, memo} from "react"
import axios from "axios"
import {  PlayCircle, Trash2, Plus, X, Save, Loader2   } from "lucide-react"


interface CurriculumPlan {
    id: string;
    title: string;
    duration: string;
    description: string;
    lessions: string[];
}

interface EditCurriculumProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: CurriculumPlan | null; 
    onSuccess: (updatedChapter: CurriculumPlan) => void; // Hàm báo cho cha biết đã sửa xong
}
const EditCurriculumModal: React.FC<EditCurriculumProps> = ({isOpen, onClose, initialData, onSuccess}) =>{
// export default  function EditCurriculumModal({ isOpen, onClose, initialData, onSuccess }: EditCurriculumProps) {
        
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
            title: "",
            duration: "",
            currentLesson: "", 
            lessions: [] as string[] 
    });

    const API_URL = "https://694cec27da5ddabf0037d71b.mockapi.io/curriculum_plans";

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                duration: initialData.duration,
                currentLesson: "",
                lessions: initialData.lessions || []
            });
        }
    }, [initialData, isOpen]);


  //thêm 1 bài học nhỏ vào danh sách tạm
    const handleAddLesson = useCallback(() => {
        if (!formData.currentLesson.trim()) return;
        setFormData({
            ...formData,
            lessions: [...formData.lessions, formData.currentLesson],
            currentLesson: ""
        });
    },[]);

  // xóa 1 bài học nhỏ khỏi danh sách tạm
    const handleRemoveLesson = useCallback( (indexToRemove: number) => {
        setFormData({
            ...formData,
            lessions: formData.lessions.filter((_, index) => index !== indexToRemove)
        });
    }, []);

    const handleUpdate = useCallback(async () => {
        if (!initialData) return;
        if (!formData.title || !formData.duration) {
            alert("Vui lòng nhập đủ thông tin!");
            return;
        }
        setIsSubmitting(true);
        try {
            const updatedChapter = {
                title: formData.title,
                duration: formData.duration,
                lessions: formData.lessions,
                // description: initialData.description 
            };

            const response = await axios.put(`${API_URL}/${initialData.id}`, updatedChapter);

            // Gọi hàm onSuccess để báo cho cha cập nhật state
            onSuccess(response.data);
            onClose();
            alert("Cập nhật thành công!");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
            alert("Lỗi cập nhật: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    },[initialData, formData, onclose]);

    if (!isOpen || !initialData) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                <h3 className="text-xl font-bold text-gray-800">Chỉnh sửa Chương: {initialData.id}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded-full transition">
                    <X size={24} />
                </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Input Tên */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên chương học</label>
                    <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                </div>

                {/* Input Thời lượng */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng</label>
                    <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    />
                </div>

                {/* Edit Bài học */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chỉnh sửa bài học</label>
                    <div className="flex gap-2 mb-3">
                        <input 
                            type="text" 
                            placeholder="Thêm bài học mới..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                            value={formData.currentLesson}
                            onChange={(e) => setFormData({...formData, currentLesson: e.target.value})}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddLesson()}
                        />
                        <button onClick={handleAddLesson} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">
                            <Plus size={18} />
                        </button>
                    </div>

                    <ul className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                        {formData.lessions.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-white px-3 py-2 rounded border border-gray-200 text-sm">
                                <span className="flex items-center gap-2 text-gray-700">
                                    <PlayCircle size={14} className="text-gray-400"/>
                                    {item}
                                </span>
                                <button onClick={() => handleRemoveLesson(idx)} className="text-red-400 hover:text-red-600 p-1">
                                    <Trash2 size={14} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 flex gap-3 bg-gray-50">
                <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium">
                    Hủy
                </button>
                <button 
                    onClick={handleUpdate}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex justify-center items-center gap-2 disabled:opacity-70"
                >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Lưu thay đổi
                </button>
            </div>
        </div>
    </div>
  );
}
export default memo(EditCurriculumModal);

//
