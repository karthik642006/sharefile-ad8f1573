
const About = () => (
  <section className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#E5DEFF] via-[#f1f0fb] to-[#FDE1D3] animate-fade-in">
    <div className="bg-white/80 p-10 rounded-2xl shadow-xl flex flex-col items-center max-w-xl mx-auto">
      <h2 className="text-3xl font-extrabold text-[#9b87f5] mb-2">About sharefile.lovable.app</h2>
      <p className="text-gray-700 text-lg mb-6 text-center">
        <span className="font-semibold">sharefile.lovable.app</span> is a modern, secure SaaS for sharing files, folders, and documents with anyone—instantly!
      </p>
      <ul className="mb-6">
        <li><span className="font-semibold">🔒 Secure Uploads</span> using industry-leading cloud storage (coming soon!)</li>
        <li><span className="font-semibold">🌍 Public Downloads</span> let you share links to anyone, no login required</li>
        <li><span className="font-semibold">🎯 Focused on Simplicity</span> — just upload, share, download.</li>
      </ul>
      <h3 className="text-xl font-bold text-[#33C3F0] mb-2">Our Mission</h3>
      <p className="text-gray-600 mb-4 text-center">
        To empower creators and professionals to share work easily, securely, and beautifully—with no hassle and no limits.
      </p>
      <div className="text-sm text-gray-400">
        Built with ❤️ by the sharefile.lovable.app Team. Contact: <a href="mailto:hello@sharefile.lovable.app" className="underline text-[#9b87f5]">hello@sharefile.lovable.app</a>
      </div>
    </div>
  </section>
);
export default About;
