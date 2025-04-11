import {React, useState} from 'react'
import { Link } from "react-router-dom";
import { FaUserEdit, FaClipboardList, FaMoneyBillWave, FaStar, FaCog, FaSignOutAlt } from "react-icons/fa";
import back from '../../assets/back.png'
import avatar from '../../assets/users.png'
import { useAuth } from '../../context/AuthContext';



export default function Compte() {

    const { logout, user, isLoading } = useAuth();

    if (isLoading) {
        return (<div className='w-full h-screen flex justify-center items-center'>
          <l-reuleaux
          size="100"
          stroke="15"
          stroke-length="0.25"
          bg-opacity="0.3"
          speed="1.3" 
          color="orange" 
        >
        </l-reuleaux>
        </div>);
       }

      const menuItems = [
        { icon: <FaClipboardList />, title: "Mes Réservations", path: "/moncompte/reservations" },
        { icon: <FaMoneyBillWave />, title: "Paiements & Transactions", path: "/moncompte" },
        { icon: <FaStar />, title: "Mes Avis", path: "/moncompte" },
        { icon: <FaCog />, title: "Paramètres", path: "/moncompte" },
      ];
    
      return (
        <div className="h-full w-full">
            <Link to="/" className='flex items-center border-b-2 shadow-md'>
             <img src={back} className="w-16 h-16 rounded-full " alt="Logo" /> 
             <span className="text-lg font-semibold">Accueil</span>
            </Link>
            <div className="min-h-screen bg-gray-100 p-4">
          {/* Profil */}
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md justify-around">
            <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-full border" />
            <div>
              <h2 className="text-xl font-semibold">{user.first_name} {user.last_name}</h2>
              <p className="text-gray-600 text-sm">{user.email}</p>
              <p className="text-gray-600 text-sm">{user.phone}</p>
            </div>
            <Link to="/moncompte/editUser" className="ml-auto text-orange-500 text-lg">
              <FaUserEdit size={34} />
            </Link>
          </div>
    
          {/* Menu */}
          <div className="mt-6 space-y-4">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => window.location.href = item.path}
                className="flex items-center p-4 bg-white rounded-lg shadow-md w-full hover:bg-gray-200 transition"
              >
                <div className="text-orange-500 text-xl mr-4">{item.icon}</div>
                <span className="text-lg font-medium">{item.title}</span>
              </button>
            ))}
          </div>
    
          {/* Déconnexion */}
          <button className="mt-6 w-full flex items-center justify-center p-4 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
            onClick={logout}>
            <FaSignOutAlt className="mr-2" /> Déconnexion
          </button>
          </div>
        </div>
      );
};
