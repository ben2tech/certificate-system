import { useEffect, useState } from "react";
import { getCertificates } from "../services/adminApi";

export default function DataTable() {
  const [rows, setRows] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);

  async function load(p = page) {
    try {
      const res = await getCertificates(p, pageSize, keyword);
      setRows(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    load(page);
  }, [page]);

  function search() {
    setPage(1);
    load(1);
  }

  function toggle(id) {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="table-box">

      <div className="table-toolbar">
        <input
          placeholder="ค้นหา ชื่อ รหัสนักเรียน หรือกิจกรรม..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
        />
        <button onClick={search}>ค้นหา</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th width="50">
              <input
                type="checkbox"
                checked={selected.length === rows.length && rows.length > 0}
                onChange={e =>
                  e.target.checked
                    ? setSelected(rows.map(r => r.row))
                    : setSelected([])
                }
              />
            </th>
            <th>รหัส</th>
            <th>ชื่อ</th>
            <th>กิจกรรม</th>
            <th>เลขที่</th>
            <th>สถานะ</th>
            <th width="120">ไฟล์</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
                ไม่พบข้อมูล
              </td>
            </tr>
          ) : (
            rows.map(r => (
              <tr key={r.row}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(r.row)}
                    onChange={() => toggle(r.row)}
                  />
                </td>

                <td>{r.studentId}</td>
                <td>{r.name}</td>
                <td>{r.activity}</td>
                <td>{r.certNo}</td>

                <td>
                  <span
                    className={`status ${
                      r.status === "Completed"
                        ? "completed"
                        : "pending"
                    }`}
                  >
                    {r.status || "Pending"}
                  </span>
                </td>

                <td>
                  {r.pdfId ? (
                    <button
                      className="small-btn"
                      onClick={() =>
                        window.open(
                          `https://drive.google.com/file/d/${r.pdfId}/preview`,
                          "_blank"
                        )
                      }
                    >
                      ดู PDF
                    </button>
                  ) : (
                    <span style={{ color: "#aaa" }}>ยังไม่มี</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          ◀ ก่อนหน้า
        </button>

        <span>หน้า {page} / {pages}</span>

        <button
          disabled={page === pages}
          onClick={() => setPage(page + 1)}
        >
          ถัดไป ▶
        </button>
      </div>

      {selected.length > 0 && (
        <div className="bulk-bar">
          <span>เลือก {selected.length} รายการ</span>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => alert("จะทำ Bulk Generate ในขั้นถัดไป")}>
              สร้างที่เลือก
            </button>

            <button onClick={() => alert("จะทำ Bulk Delete ในขั้นถัดไป")}>
              ลบที่เลือก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}