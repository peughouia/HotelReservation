import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function PrivateRoute({}) {
    const { user, setRedirectAfterLogin} = useAuth();
    const location = useLocation();
    const token = localStorage.getItem('accessToken')
    
    if (!token) {
        // Stocker la page demandée avant connexion
        setRedirectAfterLogin(location.pathname);
        return <Navigate to="/Connexion" replace />;
      }
    
      return <Outlet />;
    //return user ? <Outlet /> : <Navigate to="/Connexion" state={{ from: location }} replace />;
}

