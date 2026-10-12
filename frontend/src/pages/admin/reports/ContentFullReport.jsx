import React, { useState } from 'react';
import GlobalReportFilter from './GlobalReportFilter';

export default function ContentFullReport() {
  const [filter, setFilter] = useState({
    state: 'Maharashtra',
    city: 'All',
    fromDate: '',
    toDate: '',
  });

  const [selectedContent, setSelectedContent] = useState(null);
  const [activeTab, setActiveTab] = useState('All');

  // Dummy mock dataset for CMS Content Report
  const [contentList, setContentList] = useState([
    {
      id: 'CNT-901',
      title: 'छत्रपती शिवाजी महाराज: प्रतापगड युद्ध इतिहास',
      type: 'History',
      author: 'अमिश कदम',
      authorRole: 'इतिहास संशोधन विभाग',
      state: 'Maharashtra',
      city: 'Satara',
      created: '2026-09-28',
      published: '2026-09-29',
      status: 'Published',
      factChecked: true,
      views: 12450,
      likes: 890,
      summary: 'प्रतापगड युद्धाचे दुर्मिळ दस्तावेज व गनिमी काव्याचे सविस्तर विश्लेषण.',
    },
    {
      id: 'CNT-902',
      title: 'छत्रपती संभाजी महाराज बलिदान दिन विशेष लेख',
      type: 'Personality',
      author: 'सुरेश जाधव',
      authorRole: 'वरिष्ठ लेखक',
      state: 'Maharashtra',
      city: 'Pune',
      created: '2026-09-29',
      published: '-',
      status: 'Under Review',
      factChecked: false,
      views: 0,
      likes: 0,
      summary: 'धर्मवीर छत्रपती संभाजी महाराजांच्या अद्वितीय शौर्यावर प्रकाश टाकणारा विशेष लेख.',
    },
    {
      id: 'CNT-903',
      title: 'रायगड किल्ला संवर्धन व पर्यटन मार्गदर्शक 2026',
      type: 'Fort',
      author: 'राजेश निंबाळकर',
      authorRole: 'दुर्ग अभ्यासक',
      state: 'Maharashtra',
      city: 'Raigad',
      created: '2026-09-25',
      published: '2026-09-26',
      status: 'Published',
      factChecked: true,
      views: 8430,
      likes: 612,
      summary: 'रायगड किल्ल्यावरील नवीन रोपवे सेवा व जतन मोहिमेची माहिती.',
    },
    {
      id: 'CNT-904',
      title: 'तुळजापूर तुळजाभवानी मंदिर नवरात्रोत्सव 2026 माहितीपत्रक',
      type: 'Temple',
      author: 'प्रणाली देसाई',
      authorRole: 'सांस्कृतिक प्रतिनिधी',
      state: 'Maharashtra',
      city: 'Dharashiv',
      created: '2026-09-30',
      published: '-',
      status: 'Submitted',
      factChecked: false,
      views: 0,
      likes: 0,
      summary: 'नवरात्रोत्सवाच्या मुख्य पूजा, आरती व भाविकांसाठी मार्गदर्शक सूचना.',
    },
    {
      id: 'CNT-905',
      title: 'मराठा उद्योजक परिषद 2026 व्हिडिओ हायलाइट्स',
      type: 'Video',
      author: 'अक्षय जगताप',
      authorRole: 'डिजिटल मीडिया प्रमुख',
      state: 'Maharashtra',
      city: 'Mumbai',
      created: '2026-09-27',
      published: '2026-09-28',
      status: 'Published',
      factChecked: true,
      views: 18900,
      likes: 1420,
      summary: 'मुंबईत पार पडलेल्या उद्योजक परिषदेचे मुख्य भाषणे व B2B नेटवर्किंग सत्रांचे व्हिडिओ.',
    },
    {
      id: 'CNT-906',
      title: 'शिवकालीन नाणी व शस्त्रास्त्रे दुर्मिळ गॅलरी',
      type: 'Gallery',
      author: 'विक्रम शेलार',
      authorRole: 'संग्रहालय प्रमुख',
      state: 'Maharashtra',
      city: 'Kolhapur',
      created: '2026-09-29',
      published: '-',
      status: 'Draft',
      factChecked: false,
      views: 0,
      likes: 0,
      summary: '17 व्या शतकातील शिवराई, होन व शस्त्रास्त्रांचे दुर्मिळ छायाचित्रे.',
    }
  ]);

  const handleFilterApply = (filters) => {
    setFilter(filters);
  };

  const filteredContent = contentList.filter((item) => {
    if (filter.state !== 'All' && item.state !== filter.state) return false;
    if (filter.city !== 'All' && item.city !== filter.city) return false;
    if (activeTab !== 'All' && item.status !== activeTab) return false;
    return true;
  });

  const totalCount = contentList.length;
  const publishedCount = contentList.filter(c => c.status === 'Published').length;
  const underReviewCount = contentList.filter(c => c.status === 'Under Review' || c.status === 'Submitted').length;
  const draftCount = contentList.filter(c => c.status === 'Draft').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg text-lg">📚</span>
            <h1 className="text-2xl font-bold text-slate-800">CMS / Content Report</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            मराठा इतिहास, दुर्ग, सांस्कृतिक व पर्यटन साहित्य व्यवस्थापन व सत्यता तपासणी अहवाल
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => alert('नवीन लेख/माहिती जोडण्यासाठी फॉर्म उघडत आहे')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl text-sm transition shadow-sm"
          >
            + नवीन साहित्य जोडा
          </button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <GlobalReportFilter onApply={handleFilterApply} dataToExport={filteredContent} reportName="Content_CMS_Report" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase">एकूण साहित्य (Total)</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{totalCount}</p>
          <p className="text-xs text-slate-400 mt-1">सर्व प्रकारांचे साहित्‍य</p>
        </div>
        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
          <p className="text-xs text-emerald-700 font-semibold uppercase">प्रकाशित (Published)</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{publishedCount}</p>
          <p className="text-xs text-emerald-600 mt-1">पोर्टलवर सर्वांसाठी उपलब्ध</p>
        </div>
        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
          <p className="text-xs text-amber-700 font-semibold uppercase">समीक्षणाधीन (Under Review)</p>
          <p className="text-2xl font-bold text-amber-800 mt-1">{underReviewCount}</p>
          <p className="text-xs text-amber-600 mt-1">फॅक्ट चेक व अप्रूव्हल प्रलंबित</p>
        </div>
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500 font-semibold uppercase">मसुदा (Draft)</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{draftCount}</p>
          <p className="text-xs text-slate-400 mt-1">अपूर्ण / नवीन मसुदा</p>
        </div>
      </div>

      {/* Workflow Funnel Visualizer */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">लेखन व प्रकाशनाची 6-टप्प्यांची प्रक्रिया (Content Workflow Pipeline)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-3 bg-slate-100 rounded-xl font-medium text-slate-700">1. Draft (मसुदा)</div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl font-medium">2. Submitted (सादर)</div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl font-medium">3. Under Review</div>
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl font-medium">4. Fact Check (सत्यता)</div>
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl font-medium">5. Approved (मंजूर)</div>
          <div className="p-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-sm">6. Published (प्रकाशित)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {['All', 'Published', 'Under Review', 'Submitted', 'Draft'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
              activeTab === tab
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="p-4">Content Title & ID</th>
                <th className="p-4">Type</th>
                <th className="p-4">Author</th>
                <th className="p-4">Location</th>
                <th className="p-4">Created / Published</th>
                <th className="p-4">Fact Check</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContent.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4">
                    <p className="font-semibold text-slate-800 line-clamp-1">{item.title}</p>
                    <span className="text-xs text-slate-400">{item.id}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-medium text-xs rounded-md">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-700">{item.author}</p>
                    <p className="text-xs text-slate-400">{item.authorRole}</p>
                  </td>
                  <td className="p-4 text-slate-600 text-xs">
                    {item.city}, {item.state}
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    <p>क्रिएट: {item.created}</p>
                    <p className="text-emerald-600">पब्लिश: {item.published}</p>
                  </td>
                  <td className="p-4">
                    {item.factChecked ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        ✓ सत्यता पडताळली
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        ⏳ पडताळणी प्रलंबित
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'Published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Under Review' || item.status === 'Submitted'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedContent(item)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-medium text-xs transition"
                    >
                      समीक्षा करा (View)
                    </button>
                  </td>
                </tr>
              ))}
              {filteredContent.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    निवडलेल्या फिल्टरनुसार कोणतेही साहित्य आढळले नाही.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Detail Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase bg-amber-50 px-2.5 py-1 rounded-md">
                  {selectedContent.type} • {selectedContent.id}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">{selectedContent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedContent(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <p className="text-xs text-slate-500 font-semibold">लेखकाची माहिती</p>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-700">{selectedContent.author}</span>
                  <span className="text-slate-500">{selectedContent.authorRole}</span>
                </div>
                <p className="text-xs text-slate-400">स्थान: {selectedContent.city}, {selectedContent.state}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1">साहित्याचा सारांश (Summary)</p>
                <p className="text-sm text-slate-700 leading-relaxed bg-amber-50/40 p-4 rounded-xl border border-amber-100">
                  {selectedContent.summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400">निर्मिती तारीख:</span>
                  <p className="font-medium text-slate-700">{selectedContent.created}</p>
                </div>
                <div>
                  <span className="text-slate-400">प्रकाशन तारीख:</span>
                  <p className="font-medium text-slate-700">{selectedContent.published}</p>
                </div>
                <div>
                  <span className="text-slate-400">वाचकसंख्या (Views):</span>
                  <p className="font-medium text-slate-700">{selectedContent.views}</p>
                </div>
                <div>
                  <span className="text-slate-400">पसंती (Likes):</span>
                  <p className="font-medium text-slate-700">{selectedContent.likes}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between gap-3">
              <div className="flex gap-2">
                {selectedContent.status !== 'Published' && (
                  <button
                    onClick={() => {
                      setContentList(prev => prev.map(c => c.id === selectedContent.id ? { ...c, status: 'Published', published: '2026-09-30', factChecked: true } : c));
                      setSelectedContent(null);
                      alert('साहित्य यशस्वीरित्या प्रकाशित केले!');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl transition"
                  >
                    ✓ पब्लिश करा (Publish)
                  </button>
                )}
                {selectedContent.status !== 'Rejected' && (
                  <button
                    onClick={() => {
                      setContentList(prev => prev.map(c => c.id === selectedContent.id ? { ...c, status: 'Rejected' } : c));
                      setSelectedContent(null);
                      alert('साहित्य फेटाळले.');
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium text-xs rounded-xl transition"
                  >
                    ✕ फेटाळा (Reject)
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedContent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition"
              >
                बंद करा (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
