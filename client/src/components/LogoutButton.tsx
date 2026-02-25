interface LogoutButtonProps {
  email: string;
  onLogout: () => void;
}

export function LogoutButton({ email, onLogout }: LogoutButtonProps) {
  return (
    <button onClick={onLogout} className="btn-link">
      Logout ({email})
    </button>
  );
}
