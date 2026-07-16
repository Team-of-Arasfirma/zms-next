"use client";

const sampleQuotes = [
  {
    id: 1,
    companyName: "Demo Company",
    inquiryName: "Jothi",
    callNumber: "9655966676",
    gstNumber: "GST123456",
    mountType: "Roof Mount",
    mw: "2.5",
    status: "New",
    date: "24-06-2026",
  },
];

const QuoteRequests = () => {
  return (
    <div>
      <h2 className="font-['Bebas_Neue'] text-[40px] text-[#111]">
        Quote Requests
      </h2>

      <div className="mt-6 bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-[#1d2b3a] text-white">
            <tr>
              <th className="px-4 py-4 text-sm">S.No</th>
              <th className="px-4 py-4 text-sm">Company</th>
              <th className="px-4 py-4 text-sm">Inquiry Name</th>
              <th className="px-4 py-4 text-sm">Phone</th>
              <th className="px-4 py-4 text-sm">GST</th>
              <th className="px-4 py-4 text-sm">Type</th>
              <th className="px-4 py-4 text-sm">MW</th>
              <th className="px-4 py-4 text-sm">Date</th>
              <th className="px-4 py-4 text-sm">Status</th>
            </tr>
          </thead>

          <tbody>
            {sampleQuotes.map((quote, index) => (
              <tr key={quote.id} className="border-b">
                <td className="px-4 py-4 text-sm">{index + 1}</td>
                <td className="px-4 py-4 text-sm">{quote.companyName}</td>
                <td className="px-4 py-4 text-sm">{quote.inquiryName}</td>
                <td className="px-4 py-4 text-sm">{quote.callNumber}</td>
                <td className="px-4 py-4 text-sm">{quote.gstNumber}</td>
                <td className="px-4 py-4 text-sm">{quote.mountType}</td>
                <td className="px-4 py-4 text-sm">{quote.mw}</td>
                <td className="px-4 py-4 text-sm">{quote.date}</td>
                <td className="px-4 py-4 text-sm">
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
                    {quote.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuoteRequests;