import React from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";

export class ModalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ModalErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="modal-overlay" onClick={this.handleReset} style={{ zIndex: 1300 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "500px",
              padding: "28px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.12)",
                color: "#EF4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "8px", color: "var(--text-primary)" }}>
              Error al cargar la ventana
            </h3>

            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "20px" }}>
              Se produjo una incidencia inesperada al abrir este editor. El error ha sido registrado en la consola del navegador.
            </p>

            {this.state.error?.message && (
              <pre
                style={{
                  background: "var(--bg-surface)",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  color: "#EF4444",
                  textAlign: "left",
                  overflowX: "auto",
                  marginBottom: "20px",
                  border: "1px solid var(--border-color)",
                }}
              >
                {this.state.error.message}
              </pre>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={this.handleReset}
                style={{ padding: "8px 20px" }}
              >
                <X size={16} />
                <span>Cerrar Ventana</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
