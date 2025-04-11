import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


// {isModalOpen && (
//   <div className="p-4 max-w-md mx-auto bg-white lg:rounded-lg xl:rounded-lg">
//     <form onSubmit={handleSubmit} className="space-y-4 mt-10">
//       <div>
//         <label className="block text-base text-gray-600">Email</label>
//         <input
//           type="email"
//           name="email"
//           className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-base"
//           value={formData.email}
//           onChange={handleChange}
//         />
//       </div>

//       <div className="flex gap-2">
//         <div className="w-1/2">
//           <label className="block text-base text-gray-600">Prénom</label>
//           <input
//             type="text"
//             name="first_name"
//             className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-base"
//             value={formData.first_name}
//             onChange={handleChange}
//           />
//         </div>
//         <div className="w-1/2">
//           <label className="block text-base text-gray-600">Nom</label>
//           <input
//             type="text"
//             name="last_name"
//             className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-base"
//             value={formData.last_name}
//             onChange={handleChange}
//           />
//         </div>
//       </div>

//       <div>
//         <label className="block text-base text-gray-600">Ville</label>
//         <input
//           type="text"
//           name="ville"
//           className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-base"
//           value={formData.ville}
//           onChange={handleChange}
//         />
//       </div>

//       <div>
//         <label className="block text-base text-gray-600">Téléphone</label>
//         <input
//           type="text"
//           name="phone"
//           className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-base"
//           value={formData.phone}
//           onChange={handleChange}
//         />
//       </div>

//       <div>
//         <label className="block text-base text-gray-600">Adresse postale</label>
//         <input
//           type="text"
//           name="addressPostal"
//           className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 text-base"
//           value={formData.addressPostal}
//           onChange={handleChange}
//         />
//       </div>
//       <div>
//           <button className="btn bg-orange-400 w-full text-white text-lg px-4 py-2 rounded hover:bg-orange-600 transition duration-200" type="submit">
//           Éditer le profil
//           </button>
//       </div>
//     </form>
//   </div>
//   )}
