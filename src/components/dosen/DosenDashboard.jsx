import { useEffect, useState } from "react";
import AlertBanner from "../common/AlertBanner.jsx";
import api from "../../services/api.js";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import OverviewSection from "./OverviewSection.jsx";
import JadwalSection from "./JadwalSection.jsx";
import KatalogRuangSection from "./KatalogRuangSection.jsx";
import PengaduanSection from "./PengaduanSection.jsx";
import PengajuanJadwalSection from "./PengajuanJadwalSection.jsx";
import NotificationPopup from "../common/NotificationPopup.jsx";

const initialForm = {
  jadwal_id: "",
  tanggal_baru: "",
  jam_mulai_baru: "",
  jam_selesai_baru: "",
  ruang_baru_id: "",
  alasan: "",
};
const initialReport = {
  fasilitas_ruang_id: "",
  judul: "",
  deskripsi: "",
  prioritas: "MEDIUM",
  foto: null,
};

function DosenDashboard({ user, onLogout, loggingOut }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [jadwalList, setJadwalList] = useState([]);
  const [ruangList, setRuangList] = useState([]);
  const [pengajuanList, setPengajuanList] = useState([]);
  const [pengaduanList, setPengaduanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(initialForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedRuang, setSelectedRuang] = useState(null);
  const [fasilitasList, setFasilitasList] = useState([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [report, setReport] = useState(initialReport);
  const [reportError, setReportError] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [jadwal, ruang, pengajuan, pengaduan] = await Promise.allSettled([
      api.get("/api/jadwal"),
      api.get("/api/ruang"),
      api.get("/api/pengajuan-jadwal", { params: { limit: 20 } }),
      api.get("/api/pengaduan/me"),
    ]);
    if (jadwal.status === "fulfilled")
      setJadwalList(jadwal.value.data.data || []);
    if (ruang.status === "fulfilled") setRuangList(ruang.value.data.data || []);
    if (pengajuan.status === "fulfilled")
      setPengajuanList(pengajuan.value.data.data || []);
    if (pengaduan.status === "fulfilled")
      setPengaduanList(pengaduan.value.data.data || []);
    if (
      [jadwal, ruang, pengajuan, pengaduan].some(
        (result) => result.status === "rejected",
      )
    )
      setError("Sebagian data tidak dapat dimuat.");
    setLoading(false);
  };
  useEffect(() => {
    const timer = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const submittedJadwalIds = new Set(
    pengajuanList.map((item) => Number(item.jadwal_id)),
  );
  const openForm = (jadwal = null) => {
    setForm({
      ...initialForm,
      jadwal_id: jadwal ? String(jadwal.jadwal_id) : "",
    });
    setFormError("");
    setIsFormOpen(true);
    setActiveMenu("pengajuan");
  };
  const submitPengajuan = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/api/pengajuan-jadwal", {
        ...form,
        jadwal_id: Number(form.jadwal_id),
        ruang_baru_id: Number(form.ruang_baru_id),
      });
      setIsFormOpen(false);
      setSuccess("Pengajuan perubahan jadwal berhasil dikirim.");
      loadData();
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
          "Pengajuan perubahan jadwal gagal dikirim.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const openRuang = async (ruang) => {
    setSelectedRuang(ruang);
    setFasilitasList([]);
    try {
      const { data } = await api.get(`/api/fasilitas/ruang/${ruang.id}`);
      setFasilitasList(data.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Fasilitas ruangan tidak dapat dimuat.",
      );
    }
  };
  const openReport = (fasilitasId = "") => {
    setReport({ ...initialReport, fasilitas_ruang_id: String(fasilitasId) });
    setReportError("");
    setSelectedRuang(null);
    setIsReportOpen(true);
  };
  const submitReport = async (event) => {
    event.preventDefault();
    if (!report.foto)
      return setReportError("Foto bukti kerusakan wajib diunggah.");
    setReportSubmitting(true);
    setReportError("");
    try {
      const formData = new FormData();
      formData.append("foto", report.foto);
      const upload = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await api.post("/api/pengaduan", {
        fasilitas_ruang_id: Number(report.fasilitas_ruang_id),
        judul: report.judul.trim(),
        deskripsi: report.deskripsi.trim(),
        prioritas: report.prioritas,
        foto_url: upload.data.data.url,
      });
      setIsReportOpen(false);
      setSuccess("Pengaduan fasilitas berhasil dikirim.");
      loadData();
    } catch (requestError) {
      setReportError(
        requestError.response?.data?.message ||
          "Pengaduan fasilitas gagal dikirim.",
      );
    } finally {
      setReportSubmitting(false);
    }
  };

  const fetchNotifications = async (autoShowPopupIfUnread = false) => {
    setNotifLoading(true);
    try {
      const { data: result } = await api.get("/api/notifikasi");
      if (result.success && result.data) {
        setNotifications(result.data);
        const unread =
          result.meta?.unread_count ??
          result.data.filter((n) => !n.is_read).length;
        setUnreadCount(unread);

        if (autoShowPopupIfUnread && unread > 0) {
          setShowNotifModal(true);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
  }, []);

  const handleOpenNotifications = () => {
    setShowNotifModal(true);
    fetchNotifications(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/api/notifikasi/read-all");
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Gagal menandai notifikasi dibaca:", error);
    }
  };

  const currentPage =
    {
      dashboard: (
        <OverviewSection
          jadwalList={jadwalList}
          pengaduanList={pengaduanList}
          onNavigate={setActiveMenu}
        />
      ),
      jadwal: (
        <JadwalSection
          jadwalList={jadwalList}
          loading={loading}
          submittedJadwalIds={submittedJadwalIds}
          onOpenForm={openForm}
        />
      ),
      ruang: (
        <KatalogRuangSection
          ruangList={ruangList}
          fasilitasList={fasilitasList}
          selectedRuang={selectedRuang}
          onOpenRuang={openRuang}
          onCloseRuang={() => setSelectedRuang(null)}
          isReportOpen={isReportOpen}
          onOpenReport={() => openReport()}
          onCloseReport={() => setIsReportOpen(false)}
          report={report}
          onReportChange={setReport}
          onSubmit={submitReport}
          submitting={reportSubmitting}
          reportError={reportError}
        />
      ),
      pengaduan: <PengaduanSection pengaduanList={pengaduanList} />,
      pengajuan: (
        <PengajuanJadwalSection
          pengajuanList={pengajuanList}
          jadwalList={jadwalList}
          ruangList={ruangList}
          form={form}
          formError={formError}
          submitting={submitting}
          isOpen={isFormOpen}
          onOpen={openForm}
          onClose={() => setIsFormOpen(false)}
          onChange={setForm}
          onSubmit={submitPengajuan}
          submittedJadwalIds={submittedJadwalIds}
        />
      ),
    }[activeMenu] || null;

  return (
    <main className="min-h-screen bg-[#f4f5f7] text-slate-800">
      <NotificationPopup
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        notifications={notifications}
        loading={notifLoading}
        onMarkAllAsRead={handleMarkAllRead}
      />
      <Sidebar
        user={user}
        activeMenu={activeMenu}
        onLogout={onLogout}
        loggingOut={loggingOut}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onSelectMenu={setActiveMenu}
      />
      <div className="lg:pl-64">
        <Header
          user={user}
          onOpenMobile={() => setMobileSidebarOpen(true)}
          unreadCount={unreadCount}
          onOpenNotifications={handleOpenNotifications}
        />
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
          {error && (
            <AlertBanner
              type="error"
              message={error}
              onClose={() => setError("")}
            />
          )}
          {success && (
            <AlertBanner
              type="success"
              message={success}
              onClose={() => setSuccess("")}
            />
          )}
          {currentPage}
        </div>
      </div>
    </main>
  );
}

export default DosenDashboard;
