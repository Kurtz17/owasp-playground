// Sumber data tunggal untuk 10 modul OWASP Top 10 (2021); dibaca oleh sidebar,
// landing, dan routing. Field bertipe Localized punya versi { id, en }.

import type { Localized } from "./i18n";

export type Difficulty = "Pemula" | "Menengah" | "Lanjutan";
export type ModuleStatus = "tersedia" | "segera-hadir";

export interface TheorySection {
  heading: Localized;
  body: Localized;
}

export interface OwaspModule {
  // Kode OWASP, mis. "A01"
  code: string;
  // Slug URL, dipakai di /module/[slug]
  slug: string;
  // Istilah baku, sama di kedua bahasa (tidak di-Localize)
  name: string;
  // Nama singkat untuk sidebar
  shortName: string;
  // Deskripsi satu kalimat untuk kartu landing
  description: Localized;
  difficulty: Difficulty;
  // Estimasi waktu belajar
  estimatedTime: Localized;
  status: ModuleStatus;
  theory: TheorySection[];
}

export const MODULES: OwaspModule[] = [
  {
    code: "A01",
    slug: "broken-access-control",
    name: "Broken Access Control",
    shortName: "Broken Access Control",
    description: {
      id: "Aturan hak akses tidak ditegakkan dengan benar, sehingga pengguna bisa melakukan hal yang seharusnya di luar wewenangnya.",
      en: "Access rules aren't properly enforced, letting users do things that should be outside their permissions.",
    },
    difficulty: "Pemula",
    estimatedTime: { id: "20 menit", en: "20 min" },
    status: "tersedia",
    theory: [
      {
        heading: {
          id: "Apa itu Broken Access Control?",
          en: "What is Broken Access Control?",
        },
        body: {
          id: "Kontrol akses menentukan siapa boleh melakukan apa. Saat aturan ini longgar atau bahkan tidak ada, penyerang bisa membuka akun orang lain, mengintip data sensitif, mengubah data, atau menjalankan fungsi admin tanpa hak. OWASP menaruhnya di peringkat satu karena kelemahan inilah yang paling sering ditemukan di aplikasi nyata.",
          en: "Access control decides who is allowed to do what. When those rules are loose or missing entirely, an attacker can open other people's accounts, read sensitive data, modify records, or run admin-only functions without permission. OWASP ranks it number one because it is the flaw found most often in real applications.",
        },
      },
      {
        heading: {
          id: "IDOR: bentuk yang paling sering muncul",
          en: "IDOR: the most common form",
        },
        body: {
          id: "IDOR (Insecure Direct Object Reference) muncul ketika aplikasi memakai id dari input pengguna untuk mengambil data langsung dari database, tanpa memastikan data itu memang miliknya. Bayangkan kamu membuka /akun?id=123 lalu menggantinya jadi /akun?id=124. Server yang rentan akan tetap mengembalikan data itu karena tidak pernah bertanya, 'apakah id ini milik yang sedang login?' Coba sendiri di tab Demo Vulnerable.",
          en: "IDOR (Insecure Direct Object Reference) happens when an app uses an id from user input to pull data straight from the database without checking that the data actually belongs to that user. Imagine opening /account?id=123 and changing it to /account?id=124. A vulnerable server still returns the data because it never asks, 'does this id belong to the logged-in user?' Try it yourself in the Vulnerable Demo tab.",
        },
      },
      {
        heading: { id: "Dampak", en: "Impact" },
        body: {
          id: "Data pengguna bocor, akun diambil alih, hak akses naik jadi admin, sampai seluruh data aplikasi bisa dimanipulasi. Karena akarnya ada di logika otorisasi, satu endpoint yang lalai saja sudah cukup untuk membocorkan data semua pengguna.",
          en: "Leaked user data, account takeover, privilege escalation to admin, and even tampering with the entire application's data. Because the root cause sits in authorization logic, a single careless endpoint is enough to expose every user's data.",
        },
      },
      {
        heading: { id: "Cara mencegah", en: "How to prevent it" },
        body: {
          id: "Lakukan pengecekan otorisasi di sisi server pada setiap permintaan, bukan sekadar menyembunyikan tombol di tampilan. Tolak secara default, lalu izinkan hanya kalau pengguna memang berhak atas objek yang diminta. Jangan andalkan id yang mudah ditebak sebagai satu-satunya penjaga. Tab Demo Fixed menunjukkan satu baris pengecekan kepemilikan yang menutup celah ini.",
          en: "Enforce authorization checks on the server for every request, not just by hiding a button in the UI. Deny by default, then allow only when the user is genuinely entitled to the requested object. Never rely on a guessable id as the only gatekeeper. The Fixed Demo tab shows the single ownership check that closes this gap.",
        },
      },
      {
        heading: { id: "Contoh dunia nyata", en: "Real-world example" },
        body: {
          id: "Banyak kebocoran data besar berawal dari IDOR: mengganti nomor invoice, id pesanan, atau id profil di URL untuk membuka milik orang lain. Kelasnya sederhana, tapi dampaknya bisa sangat luas ketika endpoint yang terpengaruh melayani jutaan pengguna.",
          en: "Many large data breaches start from IDOR: swapping an invoice number, order id, or profile id in the URL to open someone else's. The bug class is simple, but the impact can be enormous when the affected endpoint serves millions of users.",
        },
      },
    ],
  },
  {
    code: "A02",
    slug: "cryptographic-failures",
    name: "Cryptographic Failures",
    shortName: "Cryptographic Failures",
    description: {
      id: "Data sensitif gagal dilindungi karena kriptografi yang lemah, salah pakai, atau tidak dipakai sama sekali.",
      en: "Sensitive data isn't protected because cryptography is weak, misused, or missing altogether.",
    },
    difficulty: "Menengah",
    estimatedTime: { id: "25 menit", en: "25 min" },
    status: "tersedia",
    theory: [
      {
        heading: {
          id: "Apa itu Cryptographic Failures?",
          en: "What are Cryptographic Failures?",
        },
        body: {
          id: "Kategori ini soal gagal melindungi data sensitif dengan kriptografi yang benar. Termasuk di dalamnya data yang dibiarkan tanpa enkripsi, penggunaan algoritma usang seperti MD5 atau SHA1, kunci yang lemah, dan pengiriman data lewat jalur yang tidak aman. Salah satu kesalahan paling umum, dan paling mudah dilihat akibatnya, adalah cara menyimpan kata sandi. Coba sendiri di tab demo.",
          en: "This category is about failing to protect sensitive data with proper cryptography. It includes data left unencrypted, outdated algorithms like MD5 or SHA1, weak keys, and data sent over insecure channels. One of the most common mistakes, with the most visible consequences, is how passwords are stored. Try it yourself in the demo tabs.",
        },
      },
      {
        heading: {
          id: "Kenapa MD5 & hash cepat berbahaya",
          en: "Why MD5 & fast hashes are dangerous",
        },
        body: {
          id: "MD5 dan SHA1 dirancang untuk cepat, dan tanpa salt, input yang sama selalu menghasilkan hash yang sama. Penyerang bisa menyiapkan rainbow table (tabel raksasa hash-ke-kata-sandi) sekali, lalu membongkar jutaan kata sandi bocor hanya dengan pencarian, tanpa menebak. Kata sandi umum seperti '123456' terbongkar dalam sepersekian detik.",
          en: "MD5 and SHA1 are built to be fast, and without a salt, the same input always produces the same hash. An attacker can build a rainbow table (a huge hash-to-password table) once, then crack millions of leaked passwords with a lookup and no guessing. Common passwords like '123456' fall in a fraction of a second.",
        },
      },
      {
        heading: {
          id: "Solusi: hash bersalt & lambat",
          en: "The fix: salted, slow hashes",
        },
        body: {
          id: "Untuk kata sandi, gunakan fungsi yang dirancang khusus seperti bcrypt, scrypt, atau Argon2. Semuanya menambahkan salt acak (sehingga hash tiap orang unik walau kata sandinya sama) dan sengaja lambat (sehingga menebak jadi sangat mahal). Rainbow table pun tidak berguna. Untuk data selain kata sandi, enkripsi saat disimpan dan saat dikirim (TLS).",
          en: "For passwords, use purpose-built functions like bcrypt, scrypt, or Argon2. Each adds a random salt (so every hash is unique even for identical passwords) and is deliberately slow (so guessing becomes very expensive). Rainbow tables become useless. For non-password data, encrypt it at rest and in transit (TLS).",
        },
      },
      {
        heading: { id: "Dampak", en: "Impact" },
        body: {
          id: "Ketika database bocor (dan kebocoran itu soal kapan, bukan apakah), penyimpanan yang lemah mengubah satu insiden menjadi jutaan akun yang langsung terbuka. Karena banyak orang memakai ulang kata sandi, dampaknya menyebar ke layanan lain lewat credential stuffing.",
          en: "When a database leaks (and a leak is a matter of when, not if), weak storage turns a single incident into millions of instantly exposed accounts. Because many people reuse passwords, the impact spreads to other services through credential stuffing.",
        },
      },
    ],
  },
  {
    code: "A03",
    slug: "injection",
    name: "Injection",
    shortName: "Injection",
    description: {
      id: "Data tak tepercaya diselipkan ke interpreter (SQL, perintah OS, dan lain-lain) sehingga mengubah maksud eksekusi.",
      en: "Untrusted data is slipped into an interpreter (SQL, OS commands, and so on), changing what the code was meant to do.",
    },
    difficulty: "Menengah",
    estimatedTime: { id: "30 menit", en: "30 min" },
    status: "tersedia",
    theory: [
      {
        heading: { id: "Apa itu Injection?", en: "What is Injection?" },
        body: {
          id: "Injeksi terjadi saat input pengguna ikut dieksekusi sebagai bagian dari sebuah perintah atau kueri, bukan hanya diperlakukan sebagai data. Interpreter (mesin SQL, browser, shell) tidak bisa membedakan mana bagian yang ditulis programmer dan mana yang diselipkan penyerang, lalu menjalankan keduanya. Dua bentuk paling terkenal adalah SQL Injection dan Cross-Site Scripting (XSS); keduanya bisa kamu coba di tab demo.",
          en: "Injection happens when user input is executed as part of a command or query instead of being treated purely as data. The interpreter (a SQL engine, a browser, a shell) can't tell which part the programmer wrote and which part the attacker slipped in, so it runs both. The two best-known forms are SQL Injection and Cross-Site Scripting (XSS); you can try both in the demo tabs.",
        },
      },
      {
        heading: {
          id: "SQL Injection: membobol logika kueri",
          en: "SQL Injection: breaking the query logic",
        },
        body: {
          id: "Ketika kueri dirakit dengan menyambung string, payload seperti ' OR '1'='1 bisa 'keluar' dari tanda kutip dan mengubah klausa WHERE menjadi selalu benar. Akibatnya login bisa tembus tanpa kata sandi, atau seluruh isi tabel bisa terbaca. Solusinya adalah parameter terikat (prepared statement) yang memperlakukan input murni sebagai data.",
          en: "When a query is built by concatenating strings, a payload like ' OR '1'='1 can break out of the quotes and turn the WHERE clause always-true. That lets an attacker log in without a password, or read an entire table. The fix is bound parameters (a prepared statement) that treat input purely as data.",
        },
      },
      {
        heading: {
          id: "XSS: menyuntik skrip ke halaman",
          en: "XSS: injecting scripts into the page",
        },
        body: {
          id: "XSS terjadi ketika input pengguna ditampilkan kembali sebagai HTML mentah. Penyerang bisa menyelipkan <script> atau atribut seperti onerror yang lalu dijalankan di browser korban, misalnya untuk mencuri cookie sesi. Kuncinya adalah selalu meng-escape output (mis. memakai textContent, bukan innerHTML) sesuai konteksnya.",
          en: "XSS happens when user input is echoed back as raw HTML. An attacker can slip in a <script> tag or an attribute like onerror that then runs in the victim's browser, for example to steal session cookies. The key is to always escape output for its context (for example using textContent instead of innerHTML).",
        },
      },
      {
        heading: { id: "Dampak & pencegahan", en: "Impact & prevention" },
        body: {
          id: "Injeksi bisa berujung pada pencurian data, pengambilalihan akun, hingga eksekusi perintah di server. Prinsip pencegahannya sama untuk semua jenis: jangan pernah mencampur data dengan kode. Pisahkan lewat parameterisasi, escaping yang sesuai konteks, dan validasi input pada allowlist.",
          en: "Injection can lead to data theft, account takeover, and even command execution on the server. The prevention principle is the same across types: never mix data with code. Separate them through parameterization, context-aware escaping, and allowlist input validation.",
        },
      },
    ],
  },
  {
    code: "A04",
    slug: "insecure-design",
    name: "Insecure Design",
    shortName: "Insecure Design",
    description: {
      id: "Kelemahan mendasar pada rancangan sistem, bukan sekadar bug di implementasinya.",
      en: "A fundamental weakness in how the system is designed, not just a bug in the implementation.",
    },
    difficulty: "Lanjutan",
    estimatedTime: { id: "25 menit", en: "25 min" },
    status: "tersedia",
    theory: [
      {
        heading: { id: "Apa itu Insecure Design?", en: "What is Insecure Design?" },
        body: {
          id: "Ini kategori yang paling berbeda dari yang lain. Insecure design bukan bug pada kode, melainkan cacat pada rancangannya: sebuah kontrol keamanan yang memang tidak pernah ada sejak awal. Kodenya bisa jadi sempurna dan bebas bug, tapi tetap tidak aman karena alurnya tidak pernah memperhitungkan cara orang menyalahgunakannya. Kamu tidak bisa menambal desain yang salah dengan sekadar memperbaiki satu baris. Coba contoh logika bisnisnya di tab demo.",
          en: "This is the category most different from the rest. Insecure design isn't a bug in the code but a flaw in the plan: a security control that was simply never there to begin with. The code can be perfect and bug-free, yet still insecure because the flow never accounted for how people would abuse it. You can't patch a flawed design by fixing a single line. Try the business-logic example in the demo tabs.",
        },
      },
      {
        heading: {
          id: "Penyalahgunaan logika bisnis",
          en: "Business logic abuse",
        },
        body: {
          id: "Banyak insecure design berupa penyalahgunaan aturan bisnis: voucher yang bisa ditumpuk tanpa batas, jumlah barang negatif yang menghasilkan 'refund', transfer yang bisa dijalankan dua kali lewat race condition, atau reset kata sandi lewat pertanyaan yang jawabannya mudah ditebak. Fungsi-fungsi ini 'bekerja sesuai kode', tapi bisa dibelokkan karena batasan yang wajar tidak pernah dirancang.",
          en: "Many insecure designs are business-logic abuses: vouchers that stack without limit, negative quantities that produce a 'refund', transfers that run twice via a race condition, or password resets through easily guessable questions. These functions 'work as coded', but can be bent because reasonable limits were never designed in.",
        },
      },
      {
        heading: {
          id: "Solusi: rancang keamanan sejak awal",
          en: "The fix: design security in from the start",
        },
        body: {
          id: "Pertahanannya bukan tambalan, melainkan proses. Lakukan threat modeling: tanyakan 'bagaimana fitur ini bisa disalahgunakan?' sejak tahap desain. Tetapkan aturan bisnis yang jelas dan tegakkan di sisi server, gunakan pola desain yang aman, dan tulis skenario penyalahgunaan (abuse case), bukan hanya use case. Keamanan yang direncanakan sejak awal jauh lebih murah daripada ditambal belakangan.",
          en: "The defense is a process, not a patch. Do threat modeling: ask 'how could this feature be abused?' at the design stage. Define clear business rules and enforce them server-side, use secure design patterns, and write abuse cases, not just use cases. Security planned from the start is far cheaper than one bolted on later.",
        },
      },
      {
        heading: { id: "Dampak", en: "Impact" },
        body: {
          id: "Karena akarnya ada di rancangan, dampaknya sering menyentuh langsung inti bisnis: kerugian finansial, kecurangan, penyalahgunaan fitur secara massal, dan celah yang tidak bisa ditutup tanpa merancang ulang. Justru karena tidak terlihat sebagai 'bug', insecure design sering lolos dari review kode maupun scanner otomatis.",
          en: "Because the root cause is in the design, the impact often hits the business directly: financial loss, fraud, mass feature abuse, and gaps that can't be closed without redesigning. Precisely because it doesn't look like a 'bug', insecure design often slips past code review and automated scanners.",
        },
      },
    ],
  },
  {
    code: "A05",
    slug: "security-misconfiguration",
    name: "Security Misconfiguration",
    shortName: "Security Misconfiguration",
    description: {
      id: "Konfigurasi keamanan yang keliru, setelan bawaan yang tak diubah, atau fitur berisiko yang menyala tanpa perlu.",
      en: "Wrong security settings, defaults left unchanged, or risky features enabled without a reason.",
    },
    difficulty: "Pemula",
    estimatedTime: { id: "20 menit", en: "20 min" },
    status: "tersedia",
    theory: [
      {
        heading: {
          id: "Apa itu Security Misconfiguration?",
          en: "What is Security Misconfiguration?",
        },
        body: {
          id: "Kategori ini bukan tentang bug di kode, melainkan tentang setelan yang keliru. Termasuk di dalamnya akun bawaan yang tak diubah, pesan error yang terlalu detail, berkas sensitif yang terekspos, port yang terbuka tanpa perlu, header keamanan yang hilang, dan izin cloud yang terlalu longgar. Tiga bentuk paling sering muncul bisa kamu coba di tab demo.",
          en: "This category is not about a bug in the code but about wrong settings. It includes unchanged default accounts, overly detailed error messages, exposed sensitive files, needlessly open ports, missing security headers, and overly permissive cloud permissions. Three of the most common forms are available to try in the demo tabs.",
        },
      },
      {
        heading: {
          id: "Kredensial default: kunci yang tertinggal",
          en: "Default credentials: a key left behind",
        },
        body: {
          id: "Banyak perangkat dan aplikasi datang dengan akun bawaan seperti admin/admin. Kredensial ini tercantum di manual publik, jadi penyerang tidak perlu menebak. Selalu ganti atau hapus akun bawaan sebelum sistem dipakai, dan wajibkan penggantian kata sandi pertama kali.",
          en: "Many devices and apps ship with default accounts like admin/admin. These credentials are listed in public manuals, so an attacker doesn't need to guess. Always change or remove default accounts before a system goes live, and require a first-time password change.",
        },
      },
      {
        heading: {
          id: "Error verbose & berkas terekspos",
          en: "Verbose errors & exposed files",
        },
        body: {
          id: "Pesan error yang menampilkan stack trace lengkap membocorkan struktur database, kueri, dan versi software, semua peta berharga bagi penyerang. Begitu pula berkas seperti .env atau .git yang tak sengaja tersaji di folder publik bisa menyerahkan kunci rahasia. Tampilkan hanya pesan umum ke pengguna, dan pastikan berkas sensitif tak pernah bisa diakses.",
          en: "Error messages that show a full stack trace leak the database structure, queries, and software version, all a valuable map for an attacker. Likewise, files like .env or .git accidentally served in a public folder can hand over secret keys. Show users only a generic message, and make sure sensitive files can never be accessed.",
        },
      },
      {
        heading: { id: "Cara mencegah", en: "How to prevent it" },
        body: {
          id: "Bangun proses pemasangan yang aman secara default (hardening), samakan konfigurasi antar lingkungan lewat otomatisasi, matikan fitur yang tidak dipakai, dan tinjau ulang setelan secara berkala. Kesederhanaan membantu: makin sedikit yang aktif, makin sedikit yang bisa salah dikonfigurasi.",
          en: "Build a secure-by-default install process (hardening), keep configuration consistent across environments through automation, turn off unused features, and review settings regularly. Simplicity helps: the less that's enabled, the less there is to misconfigure.",
        },
      },
    ],
  },
  {
    code: "A06",
    slug: "vulnerable-outdated-components",
    name: "Vulnerable and Outdated Components",
    shortName: "Vulnerable Components",
    description: {
      id: "Memakai pustaka atau komponen yang punya kerentanan yang sudah diketahui atau sudah tak lagi didukung.",
      en: "Using libraries or components with known vulnerabilities or that are no longer maintained.",
    },
    difficulty: "Pemula",
    estimatedTime: { id: "15 menit", en: "15 min" },
    status: "tersedia",
    theory: [
      {
        heading: {
          id: "Apa itu Vulnerable & Outdated Components?",
          en: "What are Vulnerable & Outdated Components?",
        },
        body: {
          id: "Aplikasi modern bertumpu pada banyak dependency: pustaka, framework, dan modul yang ditulis orang lain. Kalau salah satunya punya kerentanan yang sudah diketahui (punya nomor CVE) dan belum ditambal, seluruh aplikasi ikut memikul risikonya. Kamu tidak menulis bug-nya, tapi tetap memakainya. Coba scanner-nya di tab demo.",
          en: "Modern apps rest on many dependencies: libraries, frameworks, and modules written by other people. If one of them has a known vulnerability (with a CVE number) that isn't patched, the whole application inherits its risk. You didn't write the bug, but you still ship it. Try the scanner in the demo tabs.",
        },
      },
      {
        heading: {
          id: "Kenapa ini mudah terlewat",
          en: "Why this slips through",
        },
        body: {
          id: "Sebuah proyek kecil pun bisa menarik ratusan dependency tidak langsung (dependency dari dependency). Versi yang aman hari ini bisa jadi rentan besok saat CVE baru diumumkan. Tanpa pemindaian rutin, kerentanan yang sudah publik bisa menganggur di proyekmu berbulan-bulan tanpa disadari.",
          en: "Even a small project can pull in hundreds of indirect dependencies (dependencies of dependencies). A version that's safe today can become vulnerable tomorrow when a new CVE is announced. Without regular scanning, a publicly known vulnerability can sit in your project for months unnoticed.",
        },
      },
      {
        heading: { id: "Cara mencegah", en: "How to prevent it" },
        body: {
          id: "Jadikan pemindaian dependency bagian dari alur kerja: pakai npm audit, Dependabot, atau Snyk untuk memantau CVE secara otomatis. Perbarui dependency secara berkala, hapus paket yang tidak dipakai, dan hindari pustaka yang sudah tidak dirawat. Kunci versi (lockfile) agar build konsisten dan mudah diaudit.",
          en: "Make dependency scanning part of your workflow: use npm audit, Dependabot, or Snyk to watch for CVEs automatically. Update dependencies regularly, remove unused packages, and avoid libraries that are no longer maintained. Pin versions (a lockfile) so builds are consistent and auditable.",
        },
      },
      {
        heading: { id: "Dampak", en: "Impact" },
        body: {
          id: "Karena kerentanannya sudah publik lengkap dengan cara eksploitasinya, komponen usang adalah sasaran empuk. Banyak serangan berskala besar berawal dari satu dependency yang telat ditambal, mulai dari pencurian data hingga eksekusi kode jarak jauh.",
          en: "Because the vulnerability is public along with how to exploit it, outdated components are easy targets. Many large-scale attacks start from a single dependency patched too late, ranging from data theft to remote code execution.",
        },
      },
    ],
  },
  {
    code: "A07",
    slug: "identification-authentication-failures",
    name: "Identification and Authentication Failures",
    shortName: "Auth Failures",
    description: {
      id: "Kelemahan saat memverifikasi identitas pengguna: kata sandi lemah, sesi bocor, atau brute-force tanpa batas.",
      en: "Weaknesses in verifying user identity: weak passwords, leaked sessions, or unlimited brute-force attempts.",
    },
    difficulty: "Menengah",
    estimatedTime: { id: "25 menit", en: "25 min" },
    status: "tersedia",
    theory: [
      {
        heading: {
          id: "Apa itu Authentication Failures?",
          en: "What are Authentication Failures?",
        },
        body: {
          id: "Kategori ini mencakup semua kelemahan dalam memastikan 'kamu memang benar-benar kamu'. Termasuk di dalamnya kebijakan kata sandi yang lemah, tidak adanya perlindungan terhadap percobaan berulang (brute-force), manajemen sesi yang buruk, dan absennya autentikasi multi-faktor (MFA). Dua celah paling praktis, brute-force dan kata sandi lemah, bisa kamu coba di tab demo.",
          en: "This category covers every weakness in confirming that 'you are really you'. It includes weak password policies, no protection against repeated guessing (brute-force), poor session management, and missing multi-factor authentication (MFA). The two most practical gaps, brute-force and weak passwords, are available to try in the demo tabs.",
        },
      },
      {
        heading: {
          id: "Brute-force: menebak sampai tembus",
          en: "Brute-force: guessing until it breaks",
        },
        body: {
          id: "Kalau server tidak membatasi percobaan login, penyerang bisa mencoba ribuan kata sandi umum secara otomatis sampai salah satunya cocok. Pertahanannya berlapis: penguncian sementara (lockout) setelah beberapa kegagalan, jeda yang meningkat, CAPTCHA, dan yang paling ampuh, MFA. Coba bandingkan versi tanpa batas dan versi dengan penguncian di tab demo.",
          en: "If the server doesn't limit login attempts, an attacker can automatically try thousands of common passwords until one matches. The defenses are layered: temporary lockout after several failures, increasing delays, CAPTCHA, and most powerfully, MFA. Compare the unlimited version against the lockout version in the demo tabs.",
        },
      },
      {
        heading: {
          id: "Kata sandi lemah: pintu yang mudah dibuka",
          en: "Weak passwords: an easy door to open",
        },
        body: {
          id: "Kata sandi seperti '123456' atau 'password' ada di baris teratas setiap daftar tebakan penyerang. Aplikasi yang membiarkan kata sandi lemah sama saja memperbesar peluang brute-force. Dorong kata sandi yang panjang dan unik, periksa terhadap daftar kata sandi yang sudah bocor, dan sarankan password manager.",
          en: "Passwords like '123456' or 'password' sit at the top of every attacker's guess list. An app that allows weak passwords simply widens the door for brute-force. Encourage long, unique passwords, check them against known breached-password lists, and recommend a password manager.",
        },
      },
      {
        heading: { id: "Dampak & pencegahan", en: "Impact & prevention" },
        body: {
          id: "Kegagalan autentikasi berujung pada pengambilalihan akun secara massal (credential stuffing) hingga pembobolan akun admin. Kombinasikan MFA, kebijakan kata sandi yang sehat, pembatasan laju (rate limiting), dan manajemen sesi yang benar agar identitas pengguna sungguh-sungguh terlindungi.",
          en: "Authentication failures lead to mass account takeover (credential stuffing) and even admin account compromise. Combine MFA, a healthy password policy, rate limiting, and proper session management so user identity is genuinely protected.",
        },
      },
    ],
  },
  {
    code: "A08",
    slug: "software-data-integrity-failures",
    name: "Software and Data Integrity Failures",
    shortName: "Integrity Failures",
    description: {
      id: "Gagal memverifikasi integritas software, update, atau data, misalnya pada pipeline CI/CD dan deserialisasi yang tak aman.",
      en: "Failing to verify the integrity of software, updates, or data, for example in CI/CD pipelines and unsafe deserialization.",
    },
    difficulty: "Lanjutan",
    estimatedTime: { id: "30 menit", en: "30 min" },
    status: "tersedia",
    theory: [
      {
        heading: {
          id: "Apa itu Software & Data Integrity Failures?",
          en: "What are Software & Data Integrity Failures?",
        },
        body: {
          id: "Kategori ini terjadi ketika aplikasi menerima kode atau data penting tanpa memastikan keasliannya. Contohnya memasang update software yang tidak ditandatangani, menarik dependency dari sumber yang tidak tepercaya, atau melakukan deserialisasi objek dari pengguna. Intinya: sesuatu yang seharusnya utuh dan tepercaya ternyata bisa diam-diam diubah penyerang. Coba skenario update di tab demo.",
          en: "This category happens when an app accepts important code or data without confirming its authenticity. Examples include installing unsigned software updates, pulling dependencies from an untrusted source, or deserializing objects from users. The gist: something that should be intact and trusted can be quietly altered by an attacker. Try the update scenario in the demo tabs.",
        },
      },
      {
        heading: {
          id: "Update tanpa verifikasi tanda tangan",
          en: "Updates without signature verification",
        },
        body: {
          id: "Banyak aplikasi memperbarui diri secara otomatis. Kalau paket update dipasang tanpa memverifikasi tanda tangan digital penerbitnya, penyerang yang bisa menyusup di tengah jalan (mirror palsu, DNS dibajak, pipeline CI/CD yang dibobol) dapat menyisipkan kode jahat yang lalu terpasang dengan hak penuh. Solusinya: tandatangani paket dan verifikasi tanda tangan itu terhadap kunci publik tepercaya sebelum memasang.",
          en: "Many apps update themselves automatically. If an update package is installed without verifying the publisher's digital signature, an attacker who can get in the middle (a fake mirror, hijacked DNS, a compromised CI/CD pipeline) can inject malicious code that then installs with full privileges. The fix: sign packages and verify that signature against a trusted public key before installing.",
        },
      },
      {
        heading: {
          id: "Deserialisasi yang tak aman",
          en: "Insecure deserialization",
        },
        body: {
          id: "Deserialisasi mengubah data (mis. dari cookie atau permintaan) kembali menjadi objek. Jika data itu tak tepercaya dan formatnya mengizinkan, penyerang bisa menyusun objek yang memicu eksekusi kode saat dibaca. Perlakukan semua data serialisasi dari luar sebagai tidak tepercaya: pakai format data sederhana, validasi ketat, dan hindari mendeserialisasi tipe objek sembarangan.",
          en: "Deserialization turns data (e.g. from a cookie or request) back into an object. If that data is untrusted and the format allows it, an attacker can craft an object that triggers code execution when read. Treat all serialized data from outside as untrusted: use simple data formats, validate strictly, and avoid deserializing arbitrary object types.",
        },
      },
      {
        heading: { id: "Dampak & pencegahan", en: "Impact & prevention" },
        body: {
          id: "Kegagalan integritas bisa berujung pada eksekusi kode jarak jauh dan pembajakan seluruh sistem, sering kali menyebar lewat rantai pasok (supply chain) ke banyak korban sekaligus. Prinsipnya: jangan pernah mempercayai kode atau data hanya karena 'sepertinya' datang dari sumber yang benar. Verifikasi tanda tangan, kunci integritas dependency (lockfile + checksum), dan amankan pipeline build.",
          en: "Integrity failures can lead to remote code execution and full system takeover, often spreading through the supply chain to many victims at once. The principle: never trust code or data just because it 'seems' to come from the right source. Verify signatures, pin dependency integrity (lockfile + checksums), and secure the build pipeline.",
        },
      },
    ],
  },
  {
    code: "A09",
    slug: "security-logging-monitoring-failures",
    name: "Security Logging and Monitoring Failures",
    shortName: "Logging Failures",
    description: {
      id: "Minimnya pencatatan dan pemantauan membuat serangan lolos dari deteksi dan respons insiden jadi terlambat.",
      en: "Insufficient logging and monitoring lets attacks slip past detection and delays incident response.",
    },
    difficulty: "Menengah",
    estimatedTime: { id: "20 menit", en: "20 min" },
    status: "tersedia",
    theory: [
      {
        heading: {
          id: "Apa itu Logging & Monitoring Failures?",
          en: "What are Logging & Monitoring Failures?",
        },
        body: {
          id: "Kategori ini bukan soal celah yang membuka serangan, melainkan soal ketidakmampuan melihat serangan itu terjadi. Ketika kejadian penting (login gagal, akses ditolak, perubahan hak akses) tidak dicatat, atau dicatat tapi tidak ada yang memantau dan memberi peringatan, penyerang bisa beraksi leluasa tanpa ketahuan. Bandingkan versi tanpa pemantauan dan versi dengan alert di tab demo.",
          en: "This category isn't about a hole that opens an attack, but about the inability to see the attack happen. When important events (failed logins, denied access, permission changes) aren't recorded, or are recorded but nobody monitors and alerts on them, an attacker can operate freely and undetected. Compare the version without monitoring against the one with alerts in the demo tabs.",
        },
      },
      {
        heading: {
          id: "Kenapa 'senyap' itu berbahaya",
          en: "Why 'silence' is dangerous",
        },
        body: {
          id: "Deteksi yang terlambat memperbesar kerusakan. Data industri menunjukkan banyak pelanggaran baru ketahuan berbulan-bulan setelah terjadi, sering kali justru dari pihak luar, bukan dari sistem korban sendiri. Setiap hari tanpa deteksi adalah waktu tambahan bagi penyerang untuk menggali lebih dalam, mencuri lebih banyak, dan menutupi jejaknya.",
          en: "Late detection amplifies the damage. Industry data shows many breaches are discovered months after they happen, often by outsiders rather than the victim's own systems. Every undetected day is extra time for the attacker to dig deeper, steal more, and cover their tracks.",
        },
      },
      {
        heading: { id: "Cara mencegah", en: "How to prevent it" },
        body: {
          id: "Catat kejadian keamanan yang penting dengan konteks yang cukup (siapa, dari mana, kapan), tapi tanpa menyimpan data sensitif seperti kata sandi. Ubah log menjadi tindakan lewat aturan alerting: ambang batas login gagal, akses tak biasa, atau eskalasi hak akses harus memicu notifikasi. Pastikan log terlindungi dari perubahan dan punya rencana respons insiden yang teruji.",
          en: "Log important security events with enough context (who, from where, when), but without storing sensitive data like passwords. Turn logs into action with alerting rules: thresholds for failed logins, unusual access, or privilege escalation should trigger notifications. Keep logs tamper-resistant and have a tested incident-response plan.",
        },
      },
      {
        heading: { id: "Dampak", en: "Impact" },
        body: {
          id: "Kegagalan logging jarang menjadi berita utama sendirian, tapi ia memperparah hampir semua serangan lain: tanpa deteksi, brute-force, injeksi, atau pencurian data bisa berlangsung tanpa hambatan. Pemantauan yang baik adalah selisih antara insiden yang ditangani dalam menit dan bencana yang baru disadari setelah berbulan-bulan.",
          en: "Logging failures rarely make headlines on their own, but they worsen almost every other attack: without detection, brute-force, injection, or data theft can proceed unhindered. Good monitoring is the difference between an incident handled in minutes and a disaster noticed only months later.",
        },
      },
    ],
  },
  {
    code: "A10",
    slug: "ssrf",
    name: "Server-Side Request Forgery (SSRF)",
    shortName: "SSRF",
    description: {
      id: "Server dipaksa mengirim permintaan ke tujuan pilihan penyerang, menembus batas jaringan internal.",
      en: "The server is tricked into sending requests to a destination the attacker chooses, crossing internal network boundaries.",
    },
    difficulty: "Lanjutan",
    estimatedTime: { id: "30 menit", en: "30 min" },
    status: "tersedia",
    theory: [
      {
        heading: { id: "Apa itu SSRF?", en: "What is SSRF?" },
        body: {
          id: "SSRF terjadi ketika penyerang bisa memaksa server mengirim permintaan ke tujuan pilihannya. Banyak fitur yang sah menerima URL dari pengguna, misalnya 'ambil pratinjau tautan', impor gambar dari URL, atau webhook. Kalau tujuannya tidak divalidasi, penyerang mengubah server tepercaya menjadi 'proxy' untuk menjangkau tempat yang seharusnya tertutup. Coba sendiri di tab demo.",
          en: "SSRF happens when an attacker can force the server to send requests to a destination of their choosing. Many legitimate features accept a URL from users, for example 'fetch link preview', import-image-from-URL, or webhooks. If the destination isn't validated, the attacker turns a trusted server into a 'proxy' to reach places that should be closed off. Try it in the demo tabs.",
        },
      },
      {
        heading: {
          id: "Sasaran favorit: metadata cloud",
          en: "The favorite target: cloud metadata",
        },
        body: {
          id: "Di lingkungan cloud (AWS, GCP, Azure) ada alamat khusus 169.254.169.254 yang mengembalikan metadata instance, termasuk kredensial IAM sementara. Kalau server rentan SSRF dipaksa mengambil URL itu, penyerang bisa mencuri kredensial dan menyamar sebagai server tersebut di dalam cloud. Ini pola di balik sejumlah kebocoran besar.",
          en: "In cloud environments (AWS, GCP, Azure) there's a special address, 169.254.169.254, that returns instance metadata, including temporary IAM credentials. If an SSRF-vulnerable server is forced to fetch that URL, the attacker can steal the credentials and impersonate the server inside the cloud. This is the pattern behind several major breaches.",
        },
      },
      {
        heading: { id: "Cara mencegah", en: "How to prevent it" },
        body: {
          id: "Jangan pernah mem-fetch URL pengguna secara mentah. Tolak alamat internal (metadata, loopback 127.0.0.1, dan rentang privat seperti 10.x, 192.168.x, 172.16-31.x), lalu terapkan allowlist host yang memang tepercaya. Perhatikan juga trik pengelabuan seperti redirect dan pemetaan DNS ke IP internal; validasi harus dilakukan pada IP hasil resolusi, bukan sekadar string URL.",
          en: "Never fetch a user's URL raw. Reject internal addresses (metadata, loopback 127.0.0.1, and private ranges like 10.x, 192.168.x, 172.16-31.x), then apply an allowlist of genuinely trusted hosts. Watch out for evasion tricks like redirects and DNS mapping to internal IPs; validation must be done on the resolved IP, not just the URL string.",
        },
      },
      {
        heading: { id: "Dampak", en: "Impact" },
        body: {
          id: "SSRF bisa membuka akses ke layanan internal, panel admin, basis data, dan kredensial cloud, sering kali menjadi batu loncatan untuk menembus lebih dalam ke jaringan. Karena permintaannya datang dari server yang tepercaya, firewall biasa sering tidak menghentikannya.",
          en: "SSRF can unlock access to internal services, admin panels, databases, and cloud credentials, often becoming a stepping stone to pivot deeper into the network. Because the request comes from a trusted server, ordinary firewalls frequently fail to stop it.",
        },
      },
    ],
  },
];

export function getModuleBySlug(slug: string): OwaspModule | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function getAvailableModules(): OwaspModule[] {
  return MODULES.filter((m) => m.status === "tersedia");
}

// Meta tingkat kesulitan. `dotClass` dipakai sebagai warna titik kecil
// di depan label (bukan badge berkotak).
export const DIFFICULTY_META: Record<
  Difficulty,
  { label: Localized; dotClass: string }
> = {
  Pemula: { label: { id: "Pemula", en: "Beginner" }, dotClass: "bg-mint" },
  Menengah: {
    label: { id: "Menengah", en: "Intermediate" },
    dotClass: "bg-gold",
  },
  Lanjutan: { label: { id: "Lanjutan", en: "Advanced" }, dotClass: "bg-ember" },
};
