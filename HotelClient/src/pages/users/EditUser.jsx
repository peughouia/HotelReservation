import {React, useState,useEffect} from 'react'
import { Link } from 'react-router-dom';
import back from '../../assets/back.png';
import axios from '../../context/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';


export default function EditUser() {
    const {user, isLoading} = useAuth()
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        email: "",
        first_name: "",
        last_name: "",
        ville: "",
        phone: "",
       addressPostal: "",
      });

      useEffect(() => {
        if (user) {
          setFormData({
            email: user.email || "",
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            ville: user.ville || "",
            phone: user.phone || "",
           addressPostal: user.addressPostal || "",
          });
        }
      }, [user]);

      const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      const handleSubmit = async(e) => {
        e.preventDefault();
        try {  
          const response = await axios.patch(`/users/`,formData);
          toast.success("Informations mises à jour avec succès !");
         } catch (error) {
          console.error("Erreur lors de la mise à jour des informations :", error);
          toast.error("Erreur lors de la mise à jour des informations.");
         }finally{
          setIsModalOpen(false);
        }
      };

      if (isLoading) {
        return (
          <div className='w-full h-screen flex justify-center items-center'>
            <l-reuleaux
              size="100"
              stroke="15"
              stroke-length="0.25"
              bg-opacity="0.3"
              speed="1.3"
              color="orange"
            />
          </div>
        );
      }

  return (
    <div className="h-full w-full">
        <Link to="/moncompte" className='flex items-center bg-white border-b-2 shadow-md'>
             <img src={back} className="w-16 h-16 rounded-full " alt="Logo" /> 
             <span className="text-lg font-semibold">Mon compte</span>
        </Link>
    <div className="p-4 max-w-md mx-auto bg-white lg:rounded-lg xl:rounded-lg">
      <div className="space-y-4 mt-10">
        <div>
          <label className="block text-base text-gray-600">Email</label>
          <input
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-300 text-base"
            value={formData.email}
            readOnly
          />
        </div>

        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-base text-gray-600">Prénom</label>
            <input
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-300 text-base"
              value={formData.first_name}
              readOnly
            />
          </div>
          <div className="w-1/2">
            <label className="block text-base text-gray-600">Nom</label>
            <input
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-300 text-base"
              value={formData.last_name}
              readOnly
            />
          </div>
        </div>

        <div>
          <label className="block text-base text-gray-600">Ville</label>
          <input
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-300 text-base"
            value={formData.ville}
            readOnly
          />
        </div>

        <div>
          <label className="block text-base text-gray-600">Téléphone</label>
          <input
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-300 text-base"
            value={formData.phone}
            readOnly
          />
        </div>

        <div>
          <label className="block text-base text-gray-600">Adresse postale</label>
          <input
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-300 text-base"
            value={formData.addressPostal}
            readOnly
          />
        </div>
        <div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="btn bg-orange-400 w-full text-white text-lg px-4 py-2 rounded transition duration-200">
                Éditer le profil
            </button>
        </div>
      </div>
    </div>

    {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Modifier les informations</h2>
            <form onSubmit={handleSubmit} className="space-y-2">
              {Object.keys(formData).filter(key => !['is_staff', 'id'].includes(key)).map((key) => (
                <div key={key}>
                <label className="block text-base text-gray-600">{key}</label>
                <input
                  type="text"
                  name={key}
                  value={formData[key] || ""}
                  onChange={handleChange}
                  placeholder={key}
                  className="w-full border px-3 py-2 rounded"
                />
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  )
}
