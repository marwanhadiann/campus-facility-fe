import { useEffect, useState, useCallback } from 'react'
import StaffSidebar from './StaffSidebar.jsx'
import StaffHeader from './StaffHeader.jsx'
import OverviewSection from './OverviewSection.jsx'
import RuangFasilitasSection from './RuangFasilitasSection.jsx'
import ApprovalJadwalSection from './ApprovalJadwalSection.jsx'
import PengaduanSection from './PengaduanSection.jsx'
import JadwalSection from './JadwalSection.jsx'
import KelasSection from './KelasSection.jsx'
import RegistrasiSection from './RegistrasiSection.jsx'
import AlertBanner from '../common/AlertBanner.jsx'
import api from '../../services/api.js'

function StaffDashboard({ user, onLogout, loggingOut }) {
  const [activeMenu, setActiveMenu] = useState('overview')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Centralized State Data (pengajuan dikelola mandiri oleh ApprovalJadwalSection)
  const [ruangList, setRuangList] = useState([])
  const [riwayatList, setRiwayatList] = useState([])
  const [jadwalList, setJadwalList] = useState([])

  // Jumlah PENDING untuk sidebar badge — diupdate lewat callback onCountChange
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorBanner, setErrorBanner] = useState(null)

  // Direct modal trigger from Overview
  const [activeModalItem, setActiveModalItem] = useState(null)

  // Fetch data operasional inti (tanpa pengajuan — dihandle ApprovalJadwalSection)
  const loadDashboardData = useCallback(async () => {
    try {
      const [ruangRes, riwayatRes, jadwalRes, pengajuanRes] = await Promise.allSettled([
        api.get('/api/ruang'),
        api.get('/api/pengaduan/riwayat'),
        api.get('/api/jadwal'),
        api.get('/api/pengajuan-jadwal', { params: { status: 'PENDING', limit: 1 } })
      ])

      if (ruangRes.status === 'fulfilled') {
        setRuangList(ruangRes.value.data.data || [])
      }
      if (riwayatRes.status === 'fulfilled') {
        setRiwayatList(riwayatRes.value.data.data || [])
      }
      if (jadwalRes.status === 'fulfilled') {
        setJadwalList(jadwalRes.value.data.data || [])
      }

      if (pengajuanRes.status === 'fulfilled') {
        const meta = pengajuanRes.value.data.meta
        const data = pengajuanRes.value.data.data || []
        const pendingCount = meta && meta.total_items !== undefined ? meta.total_items : data.length
        setPendingApprovalCount(pendingCount)
      }
    } catch {
      setErrorBanner('Beberapa data operasional tidak dapat dimuat. Silakan periksa koneksi atau segarkan data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(loadDashboardData, 0)
    return () => window.clearTimeout(timer)
  }, [loadDashboardData])

  const refreshDashboardData = () => {
    setRefreshing(true)
    setErrorBanner(null)
    loadDashboardData()
  }

  // counts untuk sidebar badge
  const counts = {
    pendingApprovalCount,
  }


  // Handler buka modal evaluasi dari overview
  const handleOpenApprovalModalFromOverview = (item) => {
    setActiveModalItem(item)
    setActiveMenu('approval')
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col font-sans text-slate-800">
      {/* 1. Top Header Full-Width (Menampung Logo Kampus Mandiri, Tidak Nyambung dengan Sidebar) */}
      <StaffHeader
        activeMenu={activeMenu}
        onOpenMobile={() => setMobileSidebarOpen(true)}
        onRefresh={refreshDashboardData}
        refreshing={refreshing}
        user={user}
      />

      {/* 2. Container Layout di Bawah Header */}
      <div className="flex-1 flex min-w-0">
        {/* Sidebar Kiri (Bersih tanpa logo dan tanpa logo profil) */}
        <StaffSidebar
          activeMenu={activeMenu}
          onSelectMenu={(menuId) => {
            setActiveMenu(menuId)
            setActiveModalItem(null)
          }}
          user={user}
          onLogout={onLogout}
          loggingOut={loggingOut}
          counts={counts}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area di Samping Sidebar */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 lg:pl-72 transition-all duration-300">
          {/* Sub-Header Banner Error */}
          {errorBanner && (
            <div className="p-4 sm:px-8">
              <AlertBanner
                type="error"
                message={errorBanner}
                onClose={() => setErrorBanner(null)}
              />
            </div>
          )}

          {/* Content Section Container */}
          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
            {loading ? (
              <div className="space-y-4 animate-pulse py-10">
                <div className="h-28 bg-white rounded-2xl border border-slate-200/80" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="h-32 bg-white rounded-2xl border border-slate-200/80" />
                  <div className="h-32 bg-white rounded-2xl border border-slate-200/80" />
                  <div className="h-32 bg-white rounded-2xl border border-slate-200/80" />
                  <div className="h-32 bg-white rounded-2xl border border-slate-200/80" />
                </div>
                <div className="h-80 bg-white rounded-2xl border border-slate-200/80" />
              </div>
            ) : (
              <>
                {activeMenu === 'overview' && (
                  <OverviewSection
                    ruangList={ruangList}
                    pendingApprovalCount={pendingApprovalCount}
                    riwayatList={riwayatList}
                    jadwalList={jadwalList}
                    onNavigate={setActiveMenu}
                    onOpenApprovalModal={handleOpenApprovalModalFromOverview}
                  />
                )}

                {activeMenu === 'ruang' && (
                  <RuangFasilitasSection
                    ruangList={ruangList}
                    onRefresh={refreshDashboardData}
                  />
                )}

                {activeMenu === 'approval' && (
                  <ApprovalJadwalSection
                    onCountChange={setPendingApprovalCount}
                    activeModalItem={activeModalItem}
                    onCloseModalItem={() => setActiveModalItem(null)}
                  />
                )}

                {activeMenu === 'pengaduan' && (
                  <PengaduanSection
                    riwayatList={riwayatList}
                    onRefresh={refreshDashboardData}
                  />
                )}

                {activeMenu === 'jadwal' && (
                  <JadwalSection
                    jadwalList={jadwalList}
                    ruangList={ruangList}
                    onRefresh={refreshDashboardData}
                  />
                )}

                {activeMenu === 'kelas' && <KelasSection />}

                {activeMenu === 'registrasi' && <RegistrasiSection />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
