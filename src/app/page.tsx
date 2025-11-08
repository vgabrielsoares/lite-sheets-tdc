export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        Lite Sheets TDC
      </h1>
      <p style={{ fontSize: "1.25rem", color: "#666" }}>
        Sistema de Gerenciamento de Fichas de Personagem
      </p>
      <p style={{ fontSize: "1rem", color: "#888", marginTop: "0.5rem" }}>
        Tabuleiro do Caos RPG
      </p>
    </main>
  );
}
