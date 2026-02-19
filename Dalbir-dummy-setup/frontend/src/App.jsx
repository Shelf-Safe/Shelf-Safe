import { useEffect, useMemo, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  // SHELFSAFE states
  const [status, setStatus] = useState("Idle");
  const [products, setProducts] = useState([]);
  const [lots, setLots] = useState([]);
  const [error, setError] = useState("");

  const totalProducts = products.length;
  const totalLots = lots.length;

  const totalQtyOnHand = useMemo(() => {
    return lots.reduce((sum, lot) => sum + (Number(lot.qtyOnHand) || 0), 0);
  }, [lots]);

  const fetchShelfSafeData = async () => {
    try {
      setError("");
      setStatus("Loading...");

      //SHELFSAFE DUMMY SETUP
      const healthRes = await fetch("/api/health");
      if (!healthRes.ok) throw new Error("Health check failed. Is backend running?");
      await healthRes.json();

      const [productsRes, lotsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/inventoryLots"),
      ]);

      if (!productsRes.ok) throw new Error("Failed to fetch products");
      if (!lotsRes.ok) throw new Error("Failed to fetch inventory lots");

      const [productsJson, lotsJson] = await Promise.all([
        productsRes.json(),
        lotsRes.json(),
      ]);

      setProducts(productsJson);
      setLots(lotsJson);
      setStatus("Connected ✅");
    } catch (e) {
      setStatus("Failed ❌");
      setError(e?.message || "Unknown error");
    }
  };


  useEffect(() => {
    fetchShelfSafeData();
  }, []);

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
        <h2 style={{ marginTop: 0 }}>ShelfSafe — Live MongoDB Demo</h2>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <span><b>Status:</b> {status}</span>
          <span><b>Products:</b> {totalProducts}</span>
          <span><b>Lots:</b> {totalLots}</span>
          <span><b>Total Qty On Hand:</b> {totalQtyOnHand}</span>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <button onClick={fetchShelfSafeData}>Refresh from DB</button>
          <button
            onClick={() => {
              setProducts([]);
              setLots([]);
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
                <li>Vite proxy set to <code>/api</code> → <code>http://localhost:5000</code></li>
                <li>Atlas IP access allowed (Network Access)</li>
              </ul>
            </div>
          </div>
        ) : null}

        <div style={{ display: "grid", gap: 16, marginTop: 12 }}>
          <div>
            <h3 style={{ marginBottom: 6 }}>Products</h3>
            {products.length === 0 ? (
              <p style={{ opacity: 0.8 }}>No products loaded yet.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {products.slice(0, 5).map((p) => (
                  <li key={p._id}>
                    <b>{p.name}</b> — {p.category} — UPC: {p.barcodeUpc}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 style={{ marginBottom: 6 }}>Inventory Lots</h3>
            {lots.length === 0 ? (
              <p style={{ opacity: 0.8 }}>No lots loaded yet.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {lots.slice(0, 5).map((l) => (
                  <li key={l._id}>
                    <b>{l.productName}</b> — Qty: {l.qtyOnHand} — Exp:{" "}
                    {l.expiryDate ? new Date(l.expiryDate).toLocaleDateString() : "N/A"} —{" "}
                    Status: {l.status}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
