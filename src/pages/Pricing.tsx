
const Pricing = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#FFDEE2] via-[#e5deff] to-[#d3e4fd] animate-fade-in">
      <div className="w-full max-w-3xl px-4">
        <h2 className="text-3xl font-extrabold text-center text-[#9b87f5] mb-6">Plans &amp; Pricing</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {/* Free plan */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col items-center hover-scale">
            <span className="uppercase tracking-wider text-sm text-gray-400 mb-3">Free</span>
            <div className="text-3xl font-bold mb-2">$0</div>
            <ul className="mb-5 text-gray-700">
              <li>• 2GB Storage</li>
              <li>• Public File Sharing</li>
              <li>• Unlimited Downloads</li>
            </ul>
            <button className="bg-[#9b87f5] text-white px-5 py-2 font-semibold rounded-lg shadow-md hover:bg-[#7E69AB] transition">
              Get Started
            </button>
          </div>
          {/* Pro plan */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col items-center hover-scale relative ring-2 ring-[#9b87f5]">
            <span className="uppercase tracking-wider text-sm text-[#9b87f5] font-semibold mb-3">
              Pro
            </span>
            <div className="text-3xl font-bold mb-2">$9<span className="text-lg font-normal">/mo</span></div>
            <ul className="mb-5 text-gray-700">
              <li>• 200GB Storage</li>
              <li>• Premium Support</li>
              <li>• Secure Download Links</li>
              <li>• Folder Upload Support</li>
            </ul>
            <button className="bg-[#33C3F0] text-white px-5 py-2 font-semibold rounded-lg shadow-md hover:bg-[#1493c7] transition">
              Try Pro
            </button>
            <div className="absolute top-0 right-0 rounded-bl-lg px-3 py-1 bg-[#9b87f5] text-white text-xs font-semibold">
              Most Popular
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
