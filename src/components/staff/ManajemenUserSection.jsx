import { useState, useEffect, useCallback } from 'react'
import { Users, Search, Edit2, Trash2, X, Filter, AlertTriangle, BookOpen, Eye, EyeOff } from 'lucide-react'
import AlertBanner from '../common/AlertBanner.jsx'
import api from '../../services/api.js'

function ManajemenUserSection() {
    // State untuk Data Table & Filter
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterRole, setFilterRole] = useState('') // Kosong = Semua
    const [filterKelas, setFilterKelas] = useState('')
    const [search, setSearch] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showEditPassword, setShowEditPassword] = useState(false)

    // State untuk Data Kelas (diperlukan saat Edit)
    const [kelasList, setKelasList] = useState([])

    // State untuk Modal Edit & Hapus
    const [editModalData, setEditModalData] = useState(null) // null = modal tertutup
    const [deleteModalData, setDeleteModalData] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fungsi Fetch Data Users
    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const params = {}
            if (filterRole) params.role = filterRole
            if (search) params.search = search

            if (filterRole === 'MAHASISWA' && filterKelas) {
                params.kelas_id = filterKelas
            }
            const { data } = await api.get('/api/users', { params })
            setUsers(data.data || [])
        } catch (err) {
            setError('Gagal mengambil data pengguna.')
        } finally {
            setLoading(false)
        }
    }, [filterRole, search, filterKelas])

    // Fungsi Fetch Data Kelas
    const fetchKelas = useCallback(async () => {
        try {
            const { data } = await api.get('/api/kelas')
            setKelasList(data.data || [])
        } catch (err) {
            console.error('Gagal mengambil data kelas', err)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
        fetchKelas()
    }, [fetchUsers, fetchKelas])

    // Handler Trigger Search (Submit via Enter/Tombol)
    const handleSearchSubmit = (e) => {
        e.preventDefault()
        fetchUsers()
    }

    // Handler Update User
    const handleUpdate = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')
        setSuccess('')

        // Validasi frontend untuk mahasiswa
        if (editModalData.role === 'MAHASISWA' && !editModalData.kelas_id) {
            setError('Data kelas wajib dipilih untuk Mahasiswa.')
            setIsSubmitting(false)
            return
        }

        try {
            const payload = {
                nomor_induk: editModalData.nomor_induk,
                nama: editModalData.nama,
                email: editModalData.email,
                role: editModalData.role,
                kelas_id: editModalData.role === 'MAHASISWA' ? Number(editModalData.kelas_id) : null,
            }

            // Hanya masukkan password ke payload jika user mengisinya
            if (editModalData.password && editModalData.password.trim() !== '') {
                payload.password = editModalData.password
            }

            await api.put(`/api/users/${editModalData.id}`, payload)

            setSuccess('Data pengguna berhasil diperbarui.')
            setEditModalData(null) // Tutup modal
            fetchUsers() // Refresh tabel
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memperbarui data pengguna.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handler Hapus User
    const handleDelete = async () => {
        setIsSubmitting(true)
        setError('')
        setSuccess('')
        try {
            await api.delete(`/api/users/${deleteModalData.id}`)
            setSuccess(`Pengguna ${deleteModalData.nama} berhasil dihapus.`)
            setDeleteModalData(null)
            fetchUsers()
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menghapus data pengguna.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="space-y-5">
            {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}
            {success && <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />}

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
                {/* Header & Filter Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-orange-50 text-[#e8521d]">
                            <Users size={20} />
                        </span>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Manajemen Pengguna</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Kelola data mahasiswa, dosen, dan staff.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Filter Dropdown Role*/}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Filter size={14} />
                            </div>
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="w-full sm:w-auto pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none appearance-none bg-white"
                            >
                                <option value="">Semua Peran</option>
                                <option value="MAHASISWA">Mahasiswa</option>
                                <option value="DOSEN">Dosen</option>
                                <option value="STAFF">Staff</option>
                            </select>
                        </div>

                        {/* filter dropdown kelas */}
                        {filterRole === 'MAHASISWA' && (
                            <div className="relative animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <BookOpen size={14} />
                                </div>
                                <select
                                    value={filterKelas}
                                    onChange={(e) => setFilterKelas(e.target.value)}
                                    className="w-full sm:w-auto pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none appearance-none bg-white"
                                >
                                    <option value="">Semua Kelas</option>
                                    {kelasList.map((k) => (
                                        <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Search size={14} />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari nama atau NIK..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none"
                            />
                        </form>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                                <th className="p-4">Nomor Induk</th>
                                <th className="p-4">Nama Lengkap</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Peran & Kelas</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs text-slate-800 divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">Memuat data...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">Tidak ada data pengguna yang ditemukan.</td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-mono font-medium">{u.nomor_induk}</td>
                                        <td className="p-4 font-semibold">{u.nama}</td>
                                        <td className="p-4 text-slate-500">{u.email}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${u.role === 'MAHASISWA' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                                u.role === 'DOSEN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                                    'bg-amber-50 text-amber-600 border border-amber-200'
                                                }`}>
                                                {u.role}
                                            </span>
                                            {u.role === 'MAHASISWA' && u.nama_kelas && (
                                                <div className="mt-1 text-[11px] text-slate-500 font-medium">
                                                    Kelas: {u.nama_kelas}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => setEditModalData(u)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => setDeleteModalData(u)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL EDIT --- */}
            {editModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800">Edit Data Pengguna</h3>
                            <button onClick={() => { setEditModalData(null), setShowEditPassword(false) }} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Induk</label>
                                <input type="text" required value={editModalData.nomor_induk} onChange={(e) => setEditModalData({ ...editModalData, nomor_induk: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                                <input type="text" required value={editModalData.nama} onChange={(e) => setEditModalData({ ...editModalData, nama: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                                <input type="email" required value={editModalData.email} onChange={(e) => setEditModalData({ ...editModalData, email: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Password Baru (Opsional)</label>
                                <div className="relative">
                                    <input
                                        type={showEditPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        value={editModalData.password || ''}
                                        onChange={(e) => setEditModalData({ ...editModalData, password: e.target.value })}
                                        placeholder="Kosongkan jika tidak ingin diubah"
                                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEditPassword(!showEditPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#e8521d] transition-colors focus:outline-none"
                                    >
                                        {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Peran</label>
                                <select value={editModalData.role} onChange={(e) => setEditModalData({ ...editModalData, role: e.target.value, kelas_id: e.target.value === 'MAHASISWA' ? editModalData.kelas_id : null })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none bg-white">
                                    <option value="MAHASISWA">Mahasiswa</option>
                                    <option value="DOSEN">Dosen</option>
                                    <option value="STAFF">Staff</option>
                                </select>
                            </div>

                            {editModalData.role === 'MAHASISWA' && (
                                <div className="animate-in fade-in">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Kelas</label>
                                    <select required value={editModalData.kelas_id || ''} onChange={(e) => setEditModalData({ ...editModalData, kelas_id: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-[#e8521d] focus:outline-none bg-white">
                                        <option value="" disabled>-- Pilih Kelas --</option>
                                        {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button type="button" onClick={() => {
                                    setEditModalData(null),
                                    setShowEditPassword(false)
                                }} disabled={isSubmitting} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#e8521d] hover:bg-[#d94716] transition-colors disabled:opacity-60">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL HAPUS --- */}
            {deleteModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5 text-center">
                        <div className="mx-auto w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">Hapus Pengguna?</h3>
                        <p className="text-xs text-slate-500 mb-6">Tindakan ini tidak dapat dibatalkan. Pengguna <b>{deleteModalData.nama}</b> akan dihapus secara permanen dari sistem.</p>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setDeleteModalData(null)} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Batal</button>
                            <button type="button" onClick={handleDelete} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-60">{isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default ManajemenUserSection