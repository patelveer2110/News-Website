import { useEffect, useState } from 'react';
import axios from 'axios';
import { backendURL } from '../App';
import { adminAuth } from '../hooks/adminAuth';

const ReportPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('posts'); // 'posts' or 'comments'
  const [expandedReport, setExpandedReport] = useState(null);

  const { token } = adminAuth();

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Decide API endpoint based on viewType
      const url = viewType === 'posts' ? '/api/post/reported' : '/api/comment/reported';
      const res = await axios.get(`${backendURL}${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Adapt API response to unified format for UI rendering
      const adaptedReports = res.data.map((item) => ({
        _id: item._id,
        type: viewType, // added type to help differentiate
        postId: viewType === 'posts' ? item._id : item.postId?._id || '',
        postTitle: viewType === 'posts' ? item.title || 'Untitled Post' : item.postId?.title || 'Untitled Post',
        username: viewType === 'posts' ? item.createdBy?.username || 'Unknown' : item.userId?.username || 'Unknown',
        content: viewType === 'posts' ? item.content || '' : item.comment || '',
        reportCount: item.reportedBy?.length || 0,
        reports: (item.reportedBy || []).map(({ user, reason }) => ({
          reporterName: user?.username || 'Unknown',
          reason,
        })),
      }));

      // Sort reports by descending report count
      adaptedReports.sort((a, b) => b.reportCount - a.reportCount);

      setReports(adaptedReports);
    } catch (error) {
      console.error('Error fetching reports', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    setExpandedReport(null);
  }, [viewType]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const url = viewType === 'posts' ? `/api/post/delete/${id}` : `/api/comment/delete/${id}`;
      await axios.delete(`${backendURL}${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Deleted successfully!');
      fetchReports();
    } catch (error) {
      console.error('Delete failed', error);
      alert('Failed to delete');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-base rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-base-content">Admin Report Management</h1>

      {/* View toggle */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setViewType('posts')}
          className={`btn btn-sm ${viewType === 'posts' ? 'btn-primary' : 'btn-outline'}`}
        >
          Reported Posts
        </button>
        <button
          onClick={() => setViewType('comments')}
          className={`btn btn-sm ${viewType === 'comments' ? 'btn-primary' : 'btn-outline'}`}
        >
          Reported Comments
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-base-content/60 italic">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-10 text-base-content/60 italic">No reports found</div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="border border-base-content/30 rounded-lg shadow p-4 bg-base-200"
            >
              <div
                className="flex justify-between cursor-pointer"
                onClick={() =>
                  setExpandedReport(expandedReport === report._id ? null : report._id)
                }
              >
                <div>
                  <a
                    href={`/post/${report.postId}?highlight=${report._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-primary hover:underline block"
                  >
                    {report.postTitle}
                  </a>

                  <p
                    className="text-sm text-base-content/70 truncate max-w-md"
                    dangerouslySetInnerHTML={{
                      __html:
                        report.content.length > 100
                          ? report.content.slice(0, 100) + '...'
                          : report.content,
                    }}
                  />
                </div>
                <div className="text-right">
                  <p className="text-sm text-accent">Reports: {report.reportCount}</p>
                  <p className="text-xs italic cursor-pointer text-info underline">
                    {expandedReport === report._id ? 'Hide Details' : 'View Details'}
                  </p>
                </div>
              </div>

              {expandedReport === report._id && (
                <div className="mt-4 border-t border-base-content/30 pt-4 space-y-3">
                  <h3 className="font-semibold text-base-content">Reported Users & Reasons</h3>
                  <ul className="list-disc list-inside max-h-48 overflow-y-auto text-sm">
                    {report.reports.length === 0 ? (
                      <li className="text-base-content/60 italic">No reports found</li>
                    ) : (
                      report.reports.map(({ reporterName, reason }, idx) => (
                        <li key={idx}>
                          <span className="font-medium text-base-content/80">{reporterName}</span>: {reason}
                        </li>
                      ))
                    )}
                  </ul>
                  <button
                    onClick={() => handleDelete(report._id)}
                    className="btn btn-error btn-sm mt-4"
                  >
                    Delete {viewType === 'posts' ? 'Post' : 'Comment'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportPage;
