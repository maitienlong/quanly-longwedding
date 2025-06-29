export function Card({ className = "", children }) {
    return <div className={`rounded-xl bg-white shadow ${className}`}>{children}</div>;
  }
  
  export function CardContent({ className = "", children }) {
    return <div className={`p-6 ${className}`}>{children}</div>;
  }
  