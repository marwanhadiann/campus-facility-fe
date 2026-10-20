import { useEffect, useState, useCallback } from 'react'
import StaffSidebar from './StaffSidebar.jsx'
import StaffHeader from './StaffHeader.jsx'
import OverviewSection from './OverviewSection.jsx'
import RuangFasilitasSection from './RuangFasilitasSection.jsx'
import ApprovalJadwalSection from './ApprovalJadwalSection.jsx'
import PengaduanSection from './PengaduanSection.jsx'
import JadwalSection from './JadwalSection.jsx'
import AlertBanner from '../common/AlertBanner.jsx'
import api from '../../services/api.js'

function StaffDashboard({ user, onLogout, loggingOut }) {
  const [activeMenu, setActiveMenu] = useState('overview')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Centralized State Data
  const [ruangList, setRuangList] = useState([])
  const [pengajuanList, setPengajuanList] = useState([])
  const [riwayatList, setRiwayatList] = useState([])
  const [jadwalList, setJadwalList] = useState([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorBanner, setErrorBanner] = useState(null)

  // Direct modal trigger from Overview
  const [activeModalItem, setActiveModalItem] = useState(null)

  // Fetch all core operational data
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setErrorBanner(null)

    try {
      const [ruangRes, pengajuanRes, riwayatRes, jadwalRes] = await Promise.allSettled([
        api.get('/api/ruang'),
        api.get('/api/pengajuan-jadwal'),
        api.get('/api/pengaduan/riwayat'),
        api.get('/api/jadwal'),
      ])

      if (ruangRes.status === 'fulfilled') {
        setRuangList(ruangRes.value.data.data || [])
      }
      if (pengajuanRes.status === 'fulfilled') {
        setPengajuanList(pengajuanRes.value.data.data || [])
      }
      if (riwayatRes.status === 'fulfilled') {
        setRiwayatList(riwayatRes.value.data.data || [])
      }
      if (jadwalRes.status === 'fulfilled') {
        setJadwalList(jadwalRes.value.data.data || [])
      }
    } catch (err) {
      setErrorBanner('Beberapa data operasional tidak dapat dimuat. Silakan periksa koneksi atau segarkan data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Hitung badge count untuk menu
  const pendingApprovalCount = pengajuanList.filter((p) => p.status === 'PENDING').length
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
        onRefresh={() => loadDashboardData(true)}
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
                    pengajuanList={pengajuanList}
                    riwayatList={riwayatList}
                    jadwalList={jadwalList}
                    onNavigate={setActiveMenu}
                    onOpenApprovalModal={handleOpenApprovalModalFromOverview}
                  />
                )}

                {activeMenu === 'ruang' && (
                  <RuangFasilitasSection
                    ruangList={ruangList}
                    onRefresh={() => loadDashboardData(true)}
                  />
                )}

                {activeMenu === 'approval' && (
                  <ApprovalJadwalSection
                    pengajuanList={pengajuanList}
                    onRefresh={() => loadDashboardData(true)}
                    activeModalItem={activeModalItem}
                    onCloseModalItem={() => setActiveModalItem(null)}
                  />
                )}

                {activeMenu === 'pengaduan' && (
                  <PengaduanSection
                    riwayatList={riwayatList}
                    onRefresh={() => loadDashboardData(true)}
                  />
                )}

                {activeMenu === 'jadwal' && (
                  <JadwalSection
                    jadwalList={jadwalList}
                    ruangList={ruangList}
                    onRefresh={() => loadDashboardData(true)}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
