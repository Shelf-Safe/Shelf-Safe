
import { useEffect, useMemo, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [status, setStatus] = useState("Idle");
  const [products, setProducts] = useState([]);
  const [lots, setLots] = useState([]); 
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");

  const fetchShelfSafeData = async () => {
    try {
      setError("");
      setStatus("Loading...");

      const healthRes = await fetch("/api/health");
      if (!healthRes.ok) throw new Error("Health check failed. Is backend running?");
      await healthRes.json();


      const [productsRes, lotsRes, attachmentsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/inventoryLots"),
        fetch("/api/attachments?entityType=inventoryLots"),
      ]);

      if (!productsRes.ok) throw new Error("Failed to fetch products");
      if (!lotsRes.ok) throw new Error("Failed to fetch inventory lots");
      if (!attachmentsRes.ok) throw new Error("Failed to fetch attachments");

      const [productsJson, lotsJson, attachmentsJson] = await Promise.all([
        productsRes.json(),
        lotsRes.json(),
        attachmentsRes.json(),
      ]);

      setProducts(productsJson);
      setLots(lotsJson);
      setAttachments(attachmentsJson);

      setStatus("Connected ✅");
    } catch (e) {
      setStatus("Failed ❌");
      setError(e?.message || "Unknown error");
    }
  };

  useEffect(() => {
    fetchShelfSafeData();
  }, []);


  const productImageById = useMemo(() => {
   
    const lotImageMap = new Map();
    for (const a of attachments) {
      if (!a?.url) continue;

      const lotId = String(a.entityId?.$oid ?? a.entityId);
      if (!lotId || lotId === "undefined") continue;

      if (!lotImageMap.has(lotId)) lotImageMap.set(lotId, a.url);
    }

    const productMap = new Map();

    for (const lot of lots) {
      const lotId = String(lot._id?.$oid ?? lot._id);
      const productId = String(lot.productId?.$oid ?? lot.productId);

      if (!lotId || !productId) continue;

      const imgUrl = lotImageMap.get(lotId);
      if (!imgUrl) continue;

      if (!productMap.has(productId)) productMap.set(productId, imgUrl);
    }

    return productMap;
  }, [attachments, lots]);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Vite + React</h1>

      <div className="card" style={{ marginTop: 24, textAlign: "left" }}>
        <h2 style={{ marginTop: 0 }}>ShelfSafe — Products (Dummy)</h2>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <span><b>Status:</b> {status}</span>
          <span><b>Products:</b> {products.length}</span>
          <span><b>Attachments:</b> {attachments.length}</span>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <button onClick={fetchShelfSafeData}>Refresh from DB</button>
          <button
            onClick={() => {
              setProducts([]);
              setLots([]);
              setAttachments([]);
              setStatus("Cleared (UI only)");
              setError("");
            }}
          >
            Clear UI
          </button>
        </div>

        {error ? (
          <div style={{ padding: 12, border: "1px solid #ff6b6b", borderRadius: 8 }}>
            <b>Error:</b> {error}
            <div style={{ marginTop: 8, fontSize: 14, opacity: 0.9 }}>
              Quick checks:
              <ul style={{ margin: "8px 0 0 18px" }}>
                <li>Backend running? (port 5000)</li>
                <li>Vite proxy set: <code>/api</code> → <code>http://localhost:5000</code></li>
                <li>Atlas IP access allowed (Network Access)</li>
              </ul>
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 12 }}>
          <h3 style={{ marginBottom: 10 }}>Products</h3>

          {products.length === 0 ? (
            <p style={{ opacity: 0.8 }}>No products loaded yet.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
              {products.map((p) => {
                const productId = String(p._id?.$oid ?? p._id);
                const imgUrl = productImageById.get(productId);

                return (
                  <li
                    key={productId}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={p.name}
                        style={{
                          width: 54,
                          height: 54,
                          objectFit: "cover",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.18)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 10,
                          border: "1px dashed rgba(255,255,255,0.35)",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 11,
                          opacity: 0.7,
                        }}
                      >
                        No Image
                      </div>
                    )}

                    <div style={{ lineHeight: 1.2 }}>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>{p.name}</div>
                      <div style={{ opacity: 0.85, marginTop: 4 }}>
                        {p.category} — UPC: {p.barcodeUpc}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
