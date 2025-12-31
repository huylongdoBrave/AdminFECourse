import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { useState, useEffect, useCallback, memo } from "react";
import axios from "axios";
import { PlayCircle, Clock, Trash2, Plus, Edit, BookOpen } from "lucide-react";
import EditCurriculumModal from "./Popup/EditCurriculum";
import AddCurriculumModalBase from "./Popup/AddCurriculum";

// 1. Import Pagination từ Ant Design
import { Pagination } from 'antd'; 

interface CurriculumPlan {
    id: string;
    title: string;
    duration: string;
    description: string;
    lessions: string[];
}

// Memoize AddCurriculumModal để tránh re-render khi props không thay đổi
const AddCurriculumModal = memo(AddCurriculumModalBase);
AddCurriculumModal.displayName = "AddCurriculumModal";

// Memoized ChapterCard component (Giữ nguyên không đổi)
const ChapterCard = memo(({ chapter, onDelete, onEdit }: { 
    chapter: CurriculumPlan, 
    onDelete: (id: string) => void, 
    onEdit: (chapter: CurriculumPlan) => void 
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
            {/* ... (Nội dung card giữ nguyên) ... */}
            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase">
                            Chapter {chapter.id}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{chapter.title}</h3>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{chapter.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <BookOpen size={14} />
                            <span>{Array.isArray(chapter.lessions) ? chapter.lessions.length : 0} bài học</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Danh sách bài học:</p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 max-h-[200px] overflow-y-auto custom-scrollbar">
                    <ul className="space-y-2">
                    {Array.isArray(chapter.lessions) && chapter.lessions.length > 0 ? (
                        chapter.lessions.map((lesson, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <PlayCircle size={16} className="text-green-500 shrink-0 mt-0.5" /> 
                            <span>{lesson}</span>
                            </li>
                        ))
                    ) : (
                        <li className="text-sm text-gray-400 italic">Chưa có bài học nào</li>
                    )}
                    </ul>
                </div>
            </div>

            <div className="flex gap-3 mt-auto pt-2">
                <button onClick={() => onEdit(chapter)} className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium">
                    <Edit size={16} /> Sửa
                </button>
                <button onClick={() => onDelete(chapter.id)} className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition font-medium">
                    <Trash2 size={16} /> Xóa
                </button>
            </div>
        </div>
    );
});
ChapterCard.displayName = "ChapterCard";


export default function Curriculum() {

    const [chapters, setChapters] = useState<CurriculumPlan[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // --- 2. Thêm State cho Pagination ---
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6); // Số lượng item trên 1 trang

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingChapter, setEditingChapter] = useState<CurriculumPlan | null>(null);

    const API_URL = "https://694cec27da5ddabf0037d71b.mockapi.io/curriculum_plans";

    const fetchChapters = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(API_URL);
            setChapters(response.data);
        } catch (error) {
            console.error("Lỗi lấy data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // --- 3. Tính toán dữ liệu cho trang hiện tại ---
    const indexOfLastChapter = currentPage * pageSize;
    const indexOfFirstChapter = indexOfLastChapter - pageSize;
    // Cắt mảng chapters để lấy ra những phần tử thuộc trang hiện tại
    const currentChapters = chapters.slice(indexOfFirstChapter, indexOfLastChapter);

    // --- 4. Hàm xử lý khi đổi trang ---
    const handlePageChange = (page: number, pageSize: number) => {
        setCurrentPage(page);
        setPageSize(pageSize);
        // Cuộn lên đầu danh sách khi chuyển trang (Optional)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = useCallback(async (id: string) => {
        if (window.confirm("Bạn có chắc muốn xóa Chương này không? Toàn bộ bài học trong đó sẽ mất.")) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                setChapters(prev => prev.filter((chapter) => chapter.id !== id));
                // Nếu xóa hết item ở trang cuối, lùi về trang trước đó
                if (currentChapters.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                }
                alert("Đã xóa thành công!");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                alert("Xóa thất bại: " + error.message);
            }
        }
    }, [currentPage, currentChapters.length]); // Thêm dependencies

    const handleOpenEdit = useCallback((chapter: CurriculumPlan) => {
        setEditingChapter(chapter); 
        setIsEditModalOpen(true);   
    }, []);

    const handleUpdateSuccess = useCallback((updatedChapter: CurriculumPlan) => {
        setChapters(prev => prev.map(ch => 
            ch.id === updatedChapter.id ? updatedChapter : ch
        ));
    }, []);

    const handleAddSuccess = useCallback((newChapter: CurriculumPlan) => {
        setChapters(prev => [...prev, newChapter]);
        // Tự động nhảy đến trang cuối cùng để thấy item mới (Optional)
        // setCurrentPage(Math.ceil((chapters.length + 1) / pageSize));
    }, []);

    const handleCloseAdd = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handleCloseEdit = useCallback(() => {
        setIsEditModalOpen(false);
    }, []);

    useEffect(() => {
        fetchChapters();
    }, [fetchChapters]);

    return (
        <div>
            <PageMeta
                title="React.js Curriculum Dashboard"
                description="Curriculum Dashboard page"
            />
            <PageBreadcrumb pageTitle="Quản Lý Chương Trình Học" />
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        {/* <h1 className="text-2xl font-bold text-gray-800">Quản Lý Chương Trình Học</h1> */}

                        <p className="text-gray-500 text-sm mt-1">Danh sách các chương và bài học chi tiết</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
                    >
                        <Plus size={20} /> Thêm chương mới
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-gray-600">Đang tải chương trình...</span>
                    </div>
                ) : (
                    <>
                        {/* Hiển thị danh sách chapter CỦA TRANG HIỆN TẠI (currentChapters) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 mb-8">
                            {currentChapters.map((chapter) => (
                                <ChapterCard 
                                    key={chapter.id} 
                                    chapter={chapter} 
                                    onDelete={handleDelete} 
                                    onEdit={handleOpenEdit} 
                                />
                            ))}
                        </div>

                        {/* 5. Component Phân trang Ant Design */}
                        {chapters.length > 0 && (
                            <div className="flex justify-center mt-8 pb-8">
                                <Pagination
                                    current={currentPage}
                                    pageSize={pageSize}
                                    total={chapters.length} // Tổng số item lấy từ API
                                    onChange={handlePageChange}
                                    showSizeChanger // Cho phép chọn số item/trang
                                    showQuickJumper // Cho phép nhảy nhanh đến trang
                                    showTotal={(total) => `Tổng cộng ${total} chương`}
                                    align="center" // Căn giữa (Antd v5.14+)
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <AddCurriculumModal 
                isOpen={isModalOpen}
                onClose={handleCloseAdd}
                onSuccess={handleAddSuccess}
            />

            <EditCurriculumModal 
                isOpen={isEditModalOpen}
                onClose={handleCloseEdit}
                initialData={editingChapter}
                onSuccess={handleUpdateSuccess}
            />
        </div>
    );
}