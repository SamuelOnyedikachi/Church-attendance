'use client';

import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import LogoLoader from '../../../components/LogoLoader';

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
      Address: a.address,
      Occupation: a.occupation,
      DepartmentInChurch: a.department,
      MaritalStatus: a.status,
      FirstTimer: a.firstTimer,
      SecondTimer: a.secondTimer,
      DOB: a.dob,
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
    return <LogoLoader label="Loading Attendance" containerClassName="min-h-[320px]" />;
  }

  return (
    <section className="space-y-6">
      <header className="page-header">
        <div>
          <h1 className="page-title">
            Attendance for {service?.title || 'Service'}
          </h1>
          <p className="page-description">
            Review detailed check-in records and export them for reporting.
          </p>
        </div>
        <button onClick={handleExportExcel} className="btn-primary">
          Export to Excel
        </button>
      </header>

      <div className="table-card">
        <div className="table-scroll">
          <table className="table-base">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Occupation</th>
                <th className="px-4 py-3">Department in Church</th>
                <th className="px-4 py-3">MArital Status</th>
                <th className="px-4 py-3">First Timer</th>
                <th className="px-4 py-3">Second Timer</th>
                <th className="px-4 py-3">Date of Birth</th>
                <th className="px-4 py-3">Prayer Request</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a._id} className="table-row">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {a.name}
                  </td>
                  <td className="px-4 py-3 capitalize">{a.category || '-'}</td>
                  <td className="px-4 py-3">{a.email || '-'}</td>
                  <td className="px-4 py-3">{a.phone || '-'}</td>
                  <td className="px-4 py-3">{a.address || '-'}</td>
                  <td className="px-4 py-3">{a.occupation || '-'}</td>
                  <td className="px-4 py-3">{a.department || '-'}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`pill ${a.status === 'Married' ? 'pill-warning' : 'pill-neutral'}`}
                    >
                      {a.status || '-'}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`pill ${a.firstTimer === 'Yes' ? 'pill-warning' : 'pill-neutral'}`}
                    >
                      {a.firstTimer || '-'}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`pill ${a.secondTimer === 'Yes' ? 'pill-warning' : 'pill-neutral'}`}
                    >
                      {a.secondTimer || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{a.dob || '-'}</td>

                  <td className="px-4 py-3">{a.prayerRequest || '-'}</td>
                  <td className="px-4 py-3">
                    {new Date(a._creationTime).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {attendance.length === 0 && (
          <p className="p-4 text-gray-500">No attendance recorded yet.</p>
        )}
      </div>
    </section>
  );
}
