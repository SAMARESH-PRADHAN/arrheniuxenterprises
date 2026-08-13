const inquiries = [
  { id: 1, name: "Rahul Sharma", company: "Tech Corp", message: "Need 200 polos with logo", date: "2026-05-07" },
  { id: 2, name: "Priya Singh", company: "School Uniforms Ltd", message: "Quote for 500 uniforms", date: "2026-05-06" },
  { id: 3, name: "Aman Verma", company: "Event Co", message: "100 hoodies, urgent", date: "2026-05-05" },
];

const AdminInquiries = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-zinc-100">Inquiries</h1>
      <p className="text-zinc-500 mt-1">Customer messages from your website</p>
    </div>

    <div className="space-y-3">
      {inquiries.map((i) => (
        <div key={i.id} className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold text-zinc-100">{i.name}</p>
              <p className="text-sm text-zinc-500">{i.company}</p>
            </div>
            <span className="text-xs text-zinc-500">{i.date}</span>
          </div>
          <p className="text-sm text-zinc-300">{i.message}</p>
          <div className="mt-3 flex gap-2">
            <button className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-500">
              Reply on WhatsApp
            </button>
            <button className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md hover:bg-zinc-700">
              Mark Resolved
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminInquiries;
