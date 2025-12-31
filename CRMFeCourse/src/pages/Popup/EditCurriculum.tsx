"use client"
import { useState, useEffect, useCallback, memo, useRef } from "react"
import axios from "axios"
import { useAlert } from "../../context/AlertContext"
import { PlayCircle, Trash2, Plus, X, Save, Loader2, GripVertical } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
    onSuccess: (updatedChapter: CurriculumPlan) => void;
}

// --- 2. Component Item có thể kéo thả (SortableLessonItem) ---
const SortableLessonItem = ({ id, children, onRemove }: { id: string, children: React.ReactNode, onRemove: () => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : 'auto', // Đẩy item đang kéo lên trên cùng
        opacity: isDragging ? 0.6 : 1,     // Làm mờ item gốc khi đang kéo
    };

    return (
        <li 
            ref={setNodeRef} 
            style={style} 
            className={`flex justify-between items-center bg-white px-3 py-2 rounded border text-sm select-none ${isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}
        >
            <div className="flex items-center gap-2 text-gray-700 flex-1 overflow-hidden">
                {/* Nút nắm để kéo (Drag Handle) */}
                <div 
                    {...attributes} 
                    {...listeners} 
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1 touch-none"
                >
                    <GripVertical size={16} />
                </div>
                
                <span className="flex items-center gap-2 truncate">
                    <PlayCircle size={14} className="text-blue-500 shrink-0"/>
                    <span className="truncate">{children}</span>
                </span>
            </div>
            <button onClick={onRemove} className="text-red-400 hover:text-red-600 p-1 shrink-0 ml-2 cursor-pointer">
                <Trash2 size={14} />
            </button>
        </li>
    );
};

// --- 3. Cập nhật LessonList để chứa logic Kéo thả ---
interface LessonListProps {
    lessons: string[];
    onRemove: (index: number) => void;
    onReorder: (newLessons: string[]) => void; //prop báo về cha
}

const LessonList = memo(({ lessons, onRemove, onReorder }: LessonListProps) => {
    // Cấu hình cảm biến (Sensor) để nhận diện thao tác
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Xử lý khi thả chuột ra
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = parseInt(active.id as string);
            const newIndex = parseInt(over.id as string);
            // Dùng arrayMove của dnd-kit để đổi vị trí
            const newItems = arrayMove(lessons, oldIndex, newIndex);
            onReorder(newItems);
        }
    };

    return (
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
        >
            <ul className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar p-1">
                {/* SortableContext quản lý danh sách ID */}
                <SortableContext 
                    items={lessons.map((_, index) => index.toString())} 
                    strategy={verticalListSortingStrategy}
                >
                    {lessons.length > 0 ? (
                        lessons.map((item, idx) => (
                            <SortableLessonItem 
                                key={`${idx}-${item}`} // Key kết hợp index và text để React render tốt hơn
                                id={idx.toString()}    // Dùng index làm ID cho dnd-kit
                                onRemove={() => onRemove(idx)}
                            >
                                {item}
                            </SortableLessonItem>
                        ))
                    ) : (
                         <div className="text-gray-400 text-sm text-center py-2 italic">Chưa có bài học nào</div>
                    )}
                </SortableContext>
            </ul>
        </DndContext>
    );
});

const ModalHeader = memo(({ title, onClose }: { title: string, onClose: () => void }) => (
    <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
        <h3 className="text-xl font-bold text-gray-800">Chỉnh sửa Chương: {title}</h3>
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

// --- 4. Component chính ---
const EditCurriculumModal: React.FC<EditCurriculumProps> = ({isOpen, onClose, initialData, onSuccess}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {showAlert} = useAlert();
    const [formData, setFormData] = useState({
            title: "",
            duration: "",
            currentLesson: "", 
            lessions: [] as string[] 
    });

    const formDataRef = useRef(formData);
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

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

    const handleRemoveLesson = useCallback( (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            lessions: prev.lessions.filter((_, index) => index !== indexToRemove)
        }));
    }, []);

    // --- Hàm xử lý sắp xếp lại ---
    const handleReorderLesson = useCallback((newLessons: string[]) => {
        setFormData(prev => ({
            ...prev,
            lessions: newLessons
        }));
    }, []);

    const handleUpdate = useCallback(async () => {
        const currentData = formDataRef.current;
        if (!initialData) return;
        if (!currentData.title || !currentData.duration) {
            showAlert("Vui lòng nhập đủ thông tin!", "error", "Lỗi");
            return;
        }
        setIsSubmitting(true);
        try {
            const updatedChapter = {
                title: currentData.title,
                duration: currentData.duration,
                lessions: currentData.lessions, // Danh sách đã được sắp xếp
            };

            const response = await axios.put(`${API_URL}/${initialData.id}`, updatedChapter);

            onSuccess(response.data);
            onClose();
            showAlert("Cập nhật thành công!", "success", "Thành công");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
            showAlert(error.message, "error", "Lỗi");
        } finally {
            setIsSubmitting(false);
        }
    }, [initialData, onClose, onSuccess, showAlert]);

    if (!isOpen || !initialData) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <ModalHeader title={initialData.title} onClose={onClose} />

                {/* Body */}
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Input Tên */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên chương học</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.title}
                            onChange={(e) => {const val = e.target.value; setFormData(prev => ({...prev, title: val}))}}
                        />
                    </div>

                    {/* Input Thời lượng */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.duration}
                            onChange={(e) => {const val = e.target.value; setFormData(prev => ({...prev, duration: val}))}}
                        />
                    </div>

                    {/* Edit Bài học  */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chỉnh sửa bài học <span className="text-xs font-normal text-gray-500">(Kéo <GripVertical size={12} className="inline"/> để xếp)</span>
                        </label>
                        
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="text" 
                                placeholder="Thêm bài học mới..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                                value={formData.currentLesson}
                                onChange={(e) => {const val = e.target.value; setFormData(prev => ({...prev, currentLesson: val}))}}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddLesson()}
                            />
                            <button onClick={handleAddLesson} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">
                                <Plus size={18} />
                            </button>
                        </div>

                        {/* Truyền thêm prop onReorder vào LessonList */}
                        <LessonList 
                            lessons={formData.lessions} 
                            onRemove={handleRemoveLesson} 
                            onReorder={handleReorderLesson}
                        />
                    </div>
                </div>

                {/* Footer */}
                <ModalFooter onClose={onClose} onSave={handleUpdate} isSubmitting={isSubmitting} />
            </div>
        </div>
    );
}
export default memo(EditCurriculumModal);