import { ConnectButton } from '@rainbow-me/rainbowkit'

interface HeaderProps {
  title: string
  icon?: string
}

export default function Header({ title, icon }: HeaderProps) {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      background: "#ffffff",
      borderBottom: "1px solid #e5e7eb",
      padding: "1rem 1rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <h1 style={{ color: "#111827", fontSize: "1.2rem", fontWeight: "bold", margin: 0 }}>
          {icon && `${icon} `}{title}
        </h1>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <ConnectButton />
      </div>
    </div>
  )
}