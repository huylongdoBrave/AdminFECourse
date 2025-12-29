// import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import axios from "axios"
import {  PlayCircle, Clock, Trash2, Plus, Edit, BookOpen, X, Save, Loader2   } from "lucide-react"
import EditCurriculumModal from "./Popup/EditCurriculum";

interface CurriculumPlan {
    id: string;
    title: string;
    duration: string;
    description: string;
    lessions: string[];
}

export default function Curriculum() {

  const [chapters, setChapters] = useState<CurriculumPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Popup thêm
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Popup sửa
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<CurriculumPlan | null>(null);

  const [formData, setFormData] = useState({
        title: "",
        duration: "",
        currentLesson: "", 
        lessions: [] as string[] 
  });

  const API_URL = "https://694cec27da5ddabf0037d71b.mockapi.io/curriculum_plans";

  const fetchChapters = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setChapters(response.data);
    } catch (error) {
      console.error("Lỗi lấy data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa Chương này không? Toàn bộ bài học trong đó sẽ mất.")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        // Xóa thành công -> cập nhật lại state để giao diện tự đổi
        setChapters(chapters.filter((chapter) => chapter.id !== id));
        alert("Đã xóa thành công!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        alert("Xóa thất bại: " + error.message);
      }
    }
  };

  //thêm 1 bài học nhỏ vào danh sách tạm
  const handleAddLessonToInterceptor = () => {
        if (!formData.currentLesson.trim()) return;
        setFormData({
            ...formData,
            lessions: [...formData.lessions, formData.currentLesson],
            currentLesson: "" // Reset ô nhập bài học
        });
  };

  // Hàm xóa 1 bài học nhỏ khỏi danh sách tạm
  const handleRemoveTempLesson = (indexToRemove: number) => {
      setFormData({
          ...formData,
          lessions: formData.lessions.filter((_, index) => index !== indexToRemove)
      });
  };

  const handleSaveChapter = async () => {
      if (!formData.title || !formData.duration) {
          alert("Vui lòng nhập Tên chương và Thời lượng!");
          return;
      }

      setIsSubmitting(true);
      try {
          const newChapter = {
              title: formData.title,
              duration: formData.duration,
              description: "", // MockAPI tự xử lý hoặc bạn thêm input nếu cần
              lessions: formData.lessions
          };

          const response = await axios.post(API_URL, newChapter);
          
          // Cập nhật giao diện ngay lập tức
          setChapters([...chapters, response.data]);
          
          // Reset form và đóng modal
          setFormData({ title: "", duration: "", currentLesson: "", lessions: [] });
          setIsModalOpen(false);
          alert("Thêm chương mới thành công!");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
          console.error("Lỗi thêm mới:", error);
          alert("Lỗi khi lưu: " + error.message);
      } finally {
          setIsSubmitting(false);
      }
  };

  // Mở Popup Sửa
  const handleOpenEdit = (chapter: CurriculumPlan) => {
        setEditingChapter(chapter); // Lưu data đang được bấm vào state
        setIsEditModalOpen(true);   // Mở popup
  };

  const handleUpdateSuccess = (updatedChapter: CurriculumPlan) => {
        // Tìm data cũ trong danh sách và thay mới
        const newChapters = chapters.map(ch => 
            ch.id === updatedChapter.id ? updatedChapter : ch
        );
        setChapters(newChapters);
  };


  useEffect(() => {
    fetchChapters();
  }, []);

  return (
    <div>
      <PageMeta
        title="React.js Curriculum Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Curriculum Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      {/* <PageBreadcrumb pageTitle="Curriculum Page" /> */}

      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header Page */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản Lý Chương Trình Học</h1>
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
              <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                
                {/* Header Card: Tên chương + Thời lượng */}
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

                {/* Body Card: Danh sách bài học */}
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

                {/* Footer Card: Nút bấm */}
                <div className="flex gap-3 mt-auto pt-2">
                  <button 
                    onClick={() => handleOpenEdit(chapter) }
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                  >
                    <Edit size={16} /> Sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(chapter.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition font-medium"
                  >
                    <Trash2 size={16} /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POPUP */}
      {isModalOpen && createPortal(
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center p-5 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800">Thêm Chương Mới</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        
                        {/* Input Tên Chương */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên chương học</label>
                            <input 
                                type="text" 
                                placeholder="Ví dụ: Chương 1 - Nhập môn ReactJS"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                        </div>

                        {/* Input Thời lượng */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (giờ)</label>
                            <input 
                                type="text" 
                                placeholder="Ví dụ: 10 giờ"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                value={formData.duration}
                                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                            />
                        </div>

                        {/* Khu vực thêm bài học con */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Danh sách bài học</label>
                            
                            <div className="flex gap-2 mb-3">
                                <input 
                                    type="text" 
                                    placeholder="Nhập tên bài học..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
                                    value={formData.currentLesson}
                                    onChange={(e) => setFormData({...formData, currentLesson: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddLessonToInterceptor()}
                                />
                                <button 
                                    onClick={handleAddLessonToInterceptor}
                                    className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            {/* List bài học đã thêm */}
                            <ul className="space-y-2 max-h-[150px] overflow-y-auto">
                                {formData.lessions.length > 0 ? (
                                    formData.lessions.map((item, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-white px-3 py-2 rounded border border-gray-200 text-sm">
                                            <span className="flex items-center gap-2">
                                                <PlayCircle size={14} className="text-gray-400"/>
                                                {item}
                                            </span>
                                            <button onClick={() => handleRemoveTempLesson(idx)} className="text-red-400 hover:text-red-600">
                                                <X size={14} />
                                            </button>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-xs text-gray-400 text-center italic py-2">Chưa có bài học nào được thêm</li>
                                )}
                            </ul>
                        </div>

                    </div>

                    {/* Modal Footer */}
                    <div className="p-5 border-t border-gray-100 flex gap-3 bg-gray-50">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            onClick={handleSaveChapter}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Lưu lại
                        </button>
                    </div>
                </div>
            </div>,
            document.body
      )}

    {/* POPUP Sửa */}
      <EditCurriculumModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={editingChapter}
          onSuccess={handleUpdateSuccess}
      />

    </div>
  );
}
