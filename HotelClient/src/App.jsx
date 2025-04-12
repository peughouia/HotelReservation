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
import Dasboard from './pages/admin/Dasboard';
import EditUser from './pages/users/EditUser';
import FavoriteRoom from './pages/users/FavoriteRoom';

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
                  <Route path="/moncompte/reservations" element={<UsersReservation key={Date.now()}/>}/>
                  <Route path="/moncompte/detail/:reserveValue" element={<DetailReservation/>}/>
                  <Route path="/moncompte/editReservation" element={<EditReservation/>}/>
                  <Route path="/admin/Dashboard" element={<Dasboard/>}/>
                  <Route path="/moncompte/editUser" element={<EditUser/>}/>
                  <Route path="/mesFavoris" element={<FavoriteRoom/>}/>
              </Route>
            </Route>
          </Routes>

        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

{/* <div className="p-4 max-w-md mx-auto bg-white lg:rounded-lg xl:rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4 mt-10">
        <div>
          <label className="block text-base text-gray-600">Email</label>
          <input
            type="email"
            name="email"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-base"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-base text-gray-600">Prénom</label>
            <input
              type="text"
              name="first_name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-base"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>
          <div className="w-1/2">
            <label className="block text-base text-gray-600">Nom</label>
            <input
              type="text"
              name="last_name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-base"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-base text-gray-600">Ville</label>
          <input
            type="text"
            name="ville"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-base"
            value={formData.ville}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-base text-gray-600">Téléphone</label>
          <input
            type="text"
            name="phone"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-base"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-base text-gray-600">Adresse postale</label>
          <input
            type="text"
            name="addressPostal"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-base"
            value={formData.addressPostal}
            onChange={handleChange}
          />
        </div>
        <div>
            <button className="btn bg-orange-400 w-full text-white text-lg px-4 py-2 rounded hover:bg-orange-600 transition duration-200" type="submit">
            Éditer le profil
            </button>
        </div>
      </form>
    </div> */}