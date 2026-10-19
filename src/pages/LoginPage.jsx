import BrandMark from '../components/BrandMark.jsx'
import LoginForm from '../components/LoginForm.jsx'

function LoginPage() {
  return (
    <main className="min-h-screen bg-white md:grid md:grid-cols-[minmax(380px,46%)_1fr]">
      {/* Left hero section */}
      <section
        className="relative hidden md:block overflow-hidden text-white bg-gradient-to-br from-[#f66b27] via-[#e8521d] to-[#8e161c]"
        aria-label="Tentang SATUConnect"
      >
        <div className="absolute w-[560px] h-[560px] -right-[270px] -top-[170px] rounded-full border border-white/15 pointer-events-none" />
        <div className="absolute w-[790px] h-[790px] -left-[540px] -bottom-[425px] rounded-full border border-white/15 pointer-events-none" />

        <div className="relative z-10 flex min-h-screen flex-col justify-between px-10 lg:px-16 xl:px-24 py-14">
          <BrandMark />

          <div className="my-auto max-w-[475px] -translate-y-[5%]">
            <p className="mb-4 text-[10px] font-extrabold tracking-[0.2em] text-white/90">
              CAMPUS FACILITY PLATFORM
            </p>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.08] tracking-tight">
              Ruang kampus,<br />
              <span className="font-normal">lebih teratur.</span>
            </h1>
            <p className="mt-7 max-w-[340px] text-sm leading-relaxed text-white/80">
              Kelola ruang, fasilitas, dan jadwal perkuliahan dalam satu tempat.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-white/70 tracking-wider">
            <span className="w-8 h-[1px] bg-white/70" />
            <span>SATUConnect · Campus Management System</span>
          </div>
        </div>
      </section>

      {/* Right login panel */}
      <section className="flex min-h-screen flex-col items-center justify-between p-6 sm:p-8 md:p-12 lg:p-14 bg-white">
        <div className="w-full max-w-[405px] md:hidden mb-12">
          <BrandMark compact />
        </div>

        <div className="w-full max-w-[405px] my-auto">
          <div className="mb-9">
            <p className="mb-3 text-[10px] font-extrabold tracking-[0.2em] text-[#e8521d]">
              WELCOME BACK
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252b38] mb-2.5">
              Masuk ke akun Anda
            </h2>
            <p className="text-xs sm:text-[13px] text-[#7a8291]">
              Gunakan akun kampus untuk melanjutkan.
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-[10px] text-[#a4aab4]">
            Akses tersedia untuk mahasiswa, dosen, dan staff.
          </p>
        </div>

        <p className="pt-8 md:pt-4 text-center text-[10px] text-[#b5bac2]">
          © 2025 SATU University · Campus Facility System
        </p>
      </section>
    </main>
  )
}

export default LoginPage
