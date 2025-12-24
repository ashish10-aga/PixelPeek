import React from "react";
import { motion } from "framer-motion";

/**
 * Error Boundary: Catch and display errors gracefully
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          color: "#fff",
          flexDirection: "column",
          gap: "20px",
          padding: "20px",
          overflow: "auto",
        }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: "center",
            }}
          >
            <h1 style={{
              fontSize: "2rem",
              marginBottom: "10px",
              color: "#FF3333",
            }}>
              ⚠️ Something went wrong
            </h1>
            
            <p style={{
              fontSize: "1rem",
              color: "#FFA500",
              marginBottom: "20px",
            }}>
              We encountered an unexpected error. Please try restarting the game.
            </p>

            {this.state.errorCount > 3 && (
              <p style={{
                fontSize: "0.9rem",
                color: "#FF6666",
                marginBottom: "20px",
              }}>
                Multiple errors detected. Please refresh the page.
              </p>
            )}

            {process.env.NODE_ENV === "development" && (
              <details style={{
                backgroundColor: "#1a1a1a",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "20px",
                textAlign: "left",
                maxWidth: "600px",
                maxHeight: "300px",
                overflowY: "auto",
                fontFamily: "monospace",
                fontSize: "0.85rem",
              }}>
                <summary style={{ cursor: "pointer", marginBottom: "10px" }}>
                  Error Details
                </summary>
                <pre style={{ margin: 0 }}>
                  {this.state.error?.toString()}
                  {"\n\n"}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#FFD700",
                  color: "#000",
                  border: "3px solid #FFD700",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  fontFamily: '"Press Start 2P", monospace',
                  cursor: "pointer",
                  borderRadius: "4px",
                  boxShadow: "0 0 10px rgba(255, 215, 0, 0.5)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = "0 0 20px rgba(255, 215, 0, 0.8)";
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = "0 0 10px rgba(255, 215, 0, 0.5)";
                  e.target.style.transform = "scale(1)";
                }}
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.href = "/"}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#3333FF",
                  color: "#fff",
                  border: "3px solid #3333FF",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  fontFamily: '"Press Start 2P", monospace',
                  cursor: "pointer",
                  borderRadius: "4px",
                  boxShadow: "0 0 10px rgba(51, 51, 255, 0.5)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = "0 0 20px rgba(51, 51, 255, 0.8)";
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = "0 0 10px rgba(51, 51, 255, 0.5)";
                  e.target.style.transform = "scale(1)";
                }}
              >
                Restart Game
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Log errors to external service (implement as needed)
 */
function logErrorToService(error, errorInfo) {
  // Example: Send to Sentry, LogRocket, etc.
  console.log("Would send to error logging service:", { error, errorInfo });
}

export default ErrorBoundary;
