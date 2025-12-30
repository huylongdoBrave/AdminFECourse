// src/pages/Popup/AddCurriculum.tsx
import { useState, useCallback, memo, useRef, useEffect } from "react"
import axios from "axios"
import { PlayCircle, Trash2, Plus, X, Save, Loader2 } from "lucide-react"

interface AddCurriculumProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (newChapter: any) => void;
}

// Các component con tĩnh (Header, Footer, List) để tối ưu render
const ModalHeader = memo(({ onClose }: { onClose: () => void }) => (
    <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
        <h3 className="text-xl font-bold text-gray-800">Thêm Chương Mới</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded-full transition">
            <X size={24} />
        </button>
    </div>
));

const ModalFooter = memo(({ onClose, onSave, isSubmitting }: { onClose: () => void, onSave: () => void, isSubmitting: boolean }) => (
    <div className="p-5 border-t border-gray-100 flex gap-3 bg-gray-50">
        <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium">
            Hủy bỏ
        </button>
        <button 
            onClick={onSave}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex justify-center items-center gap-2 disabled:opacity-70"
        >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Lưu lại
        </button>
    </div>
));

const LessonList = memo(({ lessons, onRemove }: { lessons: string[], onRemove: (index: number) => void }) => (
    <ul className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
        {lessons.length > 0 ? (
            lessons.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center bg-white px-3 py-2 rounded border border-gray-200 text-sm">
                    <span className="flex items-center gap-2 text-gray-700">
                        <PlayCircle size={14} className="text-gray-400"/>
                        {item}
                    </span>
                    <button onClick={() => onRemove(idx)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={14} />
                    </button>
                </li>
            ))
        ) : (
            <li className="text-xs text-gray-400 text-center italic py-2">Chưa có bài học nào được thêm</li>
        )}
    </ul>
));

const AddCurriculumModal: React.FC<AddCurriculumProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        duration: "",
        currentLesson: "",
        lessions: [] as string[]
    });

    // Ref để giữ giá trị mới nhất mà không gây re-render cho hàm handleSave
    const formDataRef = useRef(formData);
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    // Reset form khi mở modal
    useEffect(() => {
        if (isOpen) {
            setFormData({ title: "", duration: "", currentLesson: "", lessions: [] });
        }
    }, [isOpen]);

    const API_URL = "https://694cec27da5ddabf0037d71b.mockapi.io/curriculum_plans";

    const handleAddLesson = useCallback(() => {
        setFormData(prev => {
            if (!prev.currentLesson.trim()) return prev;
            return {
                ...prev,
                lessions: [...prev.lessions, prev.currentLesson],
                currentLesson: ""
            };
        });
    }, []);

    const handleRemoveLesson = useCallback((indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            lessions: prev.lessions.filter((_, index) => index !== indexToRemove)
        }));
    }, []);

    const handleSave = useCallback(async () => {
        const currentData = formDataRef.current;
        if (!currentData.title || !currentData.duration) {
            alert("Vui lòng nhập Tên chương và Thời lượng!");
            return;
        }

        setIsSubmitting(true);
        try {
            const newChapter = {
                title: currentData.title,
                duration: currentData.duration,
                description: "",
                lessions: currentData.lessions
            };

            const response = await axios.post(API_URL, newChapter);
            onSuccess(response.data);
            onClose();
            alert("Thêm chương mới thành công!");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Lỗi thêm mới:", error);
            alert("Lỗi khi lưu: " + error.message);
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên chương học</label>
                        <input 
                            type="text" 
                            placeholder="Ví dụ: Chương 1 - Nhập môn ReactJS"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            value={formData.title}
                            onChange={(e) => {const val = e.target.value; setFormData(prev => ({...prev, title: val}))}}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (giờ)</label>
                        <input 
                            type="text" 
                            placeholder="Ví dụ: 10 giờ"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            value={formData.duration}
                            onChange={(e) => {const val = e.target.value; setFormData(prev => ({...prev, duration: val}))}}
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Danh sách bài học</label>
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="text" 
                                placeholder="Nhập tên bài học..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                                value={formData.currentLesson}
                                onChange={(e) => {const val = e.target.value; setFormData(prev => ({...prev, currentLesson: val}))}}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddLesson()}
                            />
                            <button onClick={handleAddLesson} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">
                                <Plus size={18} />
                            </button>
                        </div>
                        <LessonList lessons={formData.lessions} onRemove={handleRemoveLesson} />
                    </div>
                </div>

                <ModalFooter onClose={onClose} onSave={handleSave} isSubmitting={isSubmitting} />
            </div>
        </div>
    );
};

export default memo(AddCurriculumModal);
