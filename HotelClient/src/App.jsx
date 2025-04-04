import React from 'react'
import './output.css'
import { BrowserRouter,Routes,Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from './context/AuthContext';
import Container from './component/Container';
import Acceuil from './pages/users/Acceuil';
import Connexion from './pages/Authentification/Connexion';
import Room_detail from './pages/users/Room_detail';
import Inscription from './pages/Authentification/register';
import Reservation from './pages/users/Reservation';
import PrivateRoute from './context/PrivateRoute';
import Compte from './pages/users/Compte';
import UsersReservation from './pages/users/UsersReservation';
import DetailReservation from './pages/users/DetailReservation';
import EditReservation from './pages/users/EditReservation';

const queryClient = new QueryClient();
function App() {
  return (

    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Container/>}>
              <Route path="/Connexion" element={<Connexion/>}/>
              <Route path="/Inscription" element={<Inscription/>}/>
              <Route index element={<Acceuil/>}/>
              <Route path="/detail/:roomValue" element={<Room_detail/>}/>

              <Route element={<PrivateRoute/>} >
                  <Route path="/reservation/room/:roomValue" element={<Reservation/>}/>
                  <Route path="/moncompte" element={<Compte/>}/>
                  <Route path="/moncompte/reservations" element={<UsersReservation/>}/>
                  <Route path="/moncompte/detail/:reserveValue" element={<DetailReservation/>}/>
                  <Route path="/moncompte/editReservation" element={<EditReservation/>}/>
              </Route>
            </Route>
          </Routes>

        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

// #ff9f63, #f9853e
