'use client';

import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

export default function AttendancePage() {
  const { serviceId } = useParams();

  const attendance = useQuery(
    api.attendance.getAttendanceByService,
    serviceId ? { serviceId: serviceId as any } : 'skip'
  );

  const service = useQuery(
    api.services.getService,
    serviceId ? { id: serviceId as any } : 'skip'
  );

  const handleExportExcel = () => {
    if (!attendance || attendance.length === 0) {
      toast.error('No attendance to export');
      return;
    }

    const formatted = attendance.map((a) => ({
      Name: a.name,
      Category: a.category,
      Email: a.email,
      Phone: a.phone,
      FirstTimer: a.firstTimer,
      PrayerRequest: a.prayerRequest,
      Time: new Date(a._creationTime).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    const buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, `${service?.title || 'attendance'}-attendance.xlsx`);
  };

  if (!attendance) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Attendance for {service?.title}
          </h1>

          <button
            onClick={handleExportExcel}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Export to Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Category</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">First Timer</th>
                <th className="border p-2">Prayer Request</th>
                <th className="border p-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a._id}>
                  <td className="border p-2">{a.name}</td>
                  <td className="border p-2">{a.category}</td>
                  <td className="border p-2">{a.email}</td>
                  <td className="border p-2">{a.phone}</td>
                  <td className="border p-2">{a.firstTimer}</td>
                  <td className="border p-2">{a.prayerRequest}</td>
                  <td className="border p-2">
                    {new Date(a._creationTime).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {attendance.length === 0 && (
            <p className="text-gray-500 mt-4">No attendance recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
