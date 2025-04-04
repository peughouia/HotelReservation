import { createContext, useContext } from "react";
import.meta.hot?.decline();
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import axios from "./api";  // Import Axios configuré
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from "react";


const AuthContext = createContext(null);


const fetchUser = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  const { data } = await axios.get("/user/");
  return data;
};

const fetchreservation = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  const response = await axios.get(`/reservations/history/`)
  return response.data 
};

const fetchReservation = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  const { data } = await axios.get("/userResevation/");
  return data;
}

const fetchcategory = async () => {
  const token = localStorage.getItem("accessToken");
  const { data } = await axios.get("/listcategory/");
  return data;
};


const fetchrooms = async () => {
  const token = localStorage.getItem("accessToken");
  const { data } = await axios.get("/add_room/");
  return data;
};



export const AuthProvider = ({ children }) => {
  const [redirectAfterLogin, setRedirectAfterLogin] = useState("/");


  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: false,
  });


  const { data: UserReservations } = useQuery({
    queryKey: ["UserReservations"],
    queryFn: fetchreservation,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: false,
  });

  

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchcategory,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: false,
  });


  const { data: rooms } = useQuery({
    queryKey: ["rooms"],
    queryFn: fetchrooms,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: false,
  });

  const {data: reservations} = useQuery({
    queryKey: ["reservations"],
    queryFn: fetchReservation,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: false,
  })


  
  // ✅ Connexion : Stocker le token et le refresh_token

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      try{
        const  response  = await axios.post("/login/", credentials);
        localStorage.setItem("accessToken", response.data.tokens.access);
        localStorage.setItem("refreshToken", response.data.tokens.refresh);
        navigate(redirectAfterLogin, { replace: true });
        return response.data;
        
      } catch(error) {
            if(error.response && error.response.data){
              const errors = Object.values(error.response.data).flat();
              throw new Error(errors.length ? errors[0] : "Erreur inconnue");
        } else if (error.request) {
            throw new Error("Aucune réponse du serveur");
        } else {
            throw new Error("Erreur inattendue : " + error.message);
        }
      }
      
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
      toast.success('Vous êtes connecté !!')
    },

    onError: (err) => {
      toast.error(err.message)
  }
  });

  
  // ✅ Déconnexion : Supprimer les tokens
  const logout = () => {
    
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.clear();
    navigate('/')
    queryClient.setQueryData(["user"], null);
  };

  return (
    <AuthContext.Provider value={{user, isLoading, loginMutation, logout, categories,
     rooms, reservations, setRedirectAfterLogin, UserReservations}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

