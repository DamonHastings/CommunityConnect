import { Link, useNavigate } from "react-router-dom";
import ancchorBrand from "../../assets/ancchor-brand-tilt.svg";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";
import { NotificationBell } from "./NotificationBell";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface">
      <div className="flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center">
          <img src={ancchorBrand} alt="Ancchor" className="h-12 w-auto" />
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <Link to="/profile" className="text-sm font-medium text-secondary hover:text-heading">
                {user.full_name}
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
