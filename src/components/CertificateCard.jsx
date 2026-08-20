export default function CertificateCard({ item }) {
  return (
    <div className="cert-card">
      <div>
        <h4>{item.activity}</h4>
        <small>{item.certNo}</small>
      </div>

      <div className="cert-buttons">
        <button
          onClick={() => window.open(item.preview, "_blank")}
        >
          ดู
        </button>

        <button
          onClick={() => window.open(item.download, "_blank")}
        >
          ดาวน์โหลด
        </button>
      </div>
    </div>
  );
}