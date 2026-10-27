import { useEffect, useMemo, useState } from "react";
import AlertBanner from "../common/AlertBanner.jsx";
import api from "../../services/api.js";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import OverviewSection from "./OverviewSection.jsx";
import JadwalSection from "./JadwalSection.jsx";
import KatalogRuangSection from "./KatalogRuangSection.jsx";
import PengaduanSection from "./PengaduanSection.jsx";
import NotificationPopup from "../common/NotificationPopup.jsx";

const initialReport = {
  fasilitas_ruang_id: "",
  judul: "",
  deskripsi: "",
  prioritas: "MEDIUM",
  foto: null,
};

function MahasiswaDashboard({ user, onLogout, loggingOut }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [jadwalList, setJadwalList] = useState([]);
  const [ruangList, setRuangList] = useState([]);
  const [pengaduanList, setPengaduanList] = useState([]);
  const [selectedRuang, setSelectedRuang] = useState(null);
  const [fasilitasList, setFasilitasList] = useState([]);
  const [hari, setHari] = useState("SEMUA");
  const [kelas, setKelas] = useState("SEMUA");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [report, setReport] = useState(initialReport);
  const [reportError, setReportError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState([]);
  const [showNotifModal, setShowNotifModal] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      api.get("/api/jadwal"),
      api.get("/api/ruang"),
      api.get("/api/pengaduan/me"),
    ]).then(([jadwal, ruang, pengaduan]) => {
      if (!active) return;
      if (jadwal.status === "fulfilled")
        setJadwalList(jadwal.value.data.data || []);
      if (ruang.status === "fulfilled")
        setRuangList(ruang.value.data.data || []);
      if (pengaduan.status === "fulfilled")
        setPengaduanList(pengaduan.value.data.data || []);
      if (
        [jadwal, ruang, pengaduan].some(
          (result) => result.status === "rejected",
        )
      )
        setError("Sebagian data tidak dapat dimuat.");
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const kelasOptions = useMemo(
    () => [...new Set(jadwalList.map((item) => item.kelas))],
    [jadwalList],
  );
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
    setSubmitting(true);
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
      const { data } = await api.get("/api/pengaduan/me");
      setPengaduanList(data.data || []);
      setIsReportOpen(false);
      setSuccess("Pengaduan berhasil dikirim.");
    } catch (requestError) {
      setReportError(
        requestError.response?.data?.message || "Pengaduan gagal dikirim.",
      );
    } finally {
      setSubmitting(false);
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
          kelasOptions={kelasOptions}
          hari={hari}
          kelas={kelas}
          onHariChange={setHari}
          onKelasChange={setKelas}
          loading={loading}
        />
      ),
      ruang: (
        <KatalogRuangSection
          ruangList={ruangList}
          fasilitasList={fasilitasList}
          pengaduanList={pengaduanList}
          selectedRuang={selectedRuang}
          onOpenRuang={openRuang}
          onCloseRuang={() => setSelectedRuang(null)}
          isReportOpen={isReportOpen}
          onOpenReport={() => openReport()}
          onCloseReport={() => setIsReportOpen(false)}
          report={report}
          onReportChange={setReport}
          onSubmit={submitReport}
          submitting={submitting}
          reportError={reportError}
        />
      ),
      pengaduan: <PengaduanSection pengaduanList={pengaduanList} />,
    }[activeMenu] || null;

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const response = await fetch("/api/notifikasi?is_read=false", {
          method: "GET",
          credentials: "include", // Otomatis mengirim cookie HttpOnly
        });

        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          setUnreadNotifs(result.data);
          setShowNotifModal(true);
        } else {
          setShowNotifModal(false);
        }
      } catch (error) {
        console.error("Gagal mengambil notifikasi:", error);
      }
    };

    fetchUnreadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifikasi/read-all", {
        method: "PATCH",
        credentials: "include",
      });
      setShowNotifModal(false);
      setUnreadNotifs([]);
    } catch (error) {
      console.error("Gagal menandai notifikasi:", error);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f5f7] text-slate-800">
      <NotificationPopup
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        notifications={unreadNotifs}
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
          unreadCount={unreadNotifs.length}
          onOpenNotifications={() => setShowNotifModal(true)}
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

export default MahasiswaDashboard;
