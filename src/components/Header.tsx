import { Link } from '@tanstack/react-router';
import { useBalance } from 'wagmi';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  backText?: string;
}

function Header({ 
  title = "🏛️ Realmind", 
  subtitle = "Interactive Learning Platform",
  showBackButton = false,
  backTo = "/landing",
  backText = "← Back to Landing"
}: HeaderProps) {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
  });
  return (
    <div style={{
      position: "relative",
      textAlign: "center",
      marginBottom: "2rem"
    }}>
      {/* Back Button */}
      {showBackButton && (
        <div style={{
          position: "absolute",
          top: "0",
          left: "0",
          zIndex: 10
        }}>
          <Link
            to={backTo}
            style={{
              color: "hsl(var(--primary))",
              textDecoration: "none",
              fontSize: "1rem",
              opacity: 0.8,
              transition: "opacity 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
          >
            {backText}
          </Link>
        </div>
      )}

      {/* Balance Display */}
      {/* Removed native balance chip here to avoid duplication with global header */}

      {/* Title */}
      <h1 style={{
        fontSize: "2.25rem",
        fontWeight: 800,
        marginBottom: "0.5rem",
        color: "#111827"
      }}>
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p style={{
          fontSize: "1rem",
          marginBottom: "1rem",
          opacity: 1,
          maxWidth: "600px",
          margin: "0 auto 1rem",
          color: "#6b7280"
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default Header; 