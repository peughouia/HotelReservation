import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Bell, Bed, CalendarDays, Users, CreditCard } from "lucide-react";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';


const data = [
    { name: "Jan", Occupation: 70 },
    { name: "Feb", Occupation: 80 },
    { name: "Mar", Occupation: 65 },
    { name: "Apr", Occupation: 90 },
    { name: "May", Occupation: 75 },
  ];
  
  const events = [
    { title: 'Réservation - Chambre 101', date: '2025-04-06' },
    { title: 'Réservation - Chambre 203', date: '2025-04-07' },
    { title: 'Check-out - Chambre 301', date: '2025-04-08' },
  ];
  
  const recentReservations = [
    { client: "Jean Dupont", chambre: "101", date: "05/04/2025", statut: "Confirmée" },
    { client: "Marie Claire", chambre: "203", date: "05/04/2025", statut: "En attente" },
    { client: "Ali Konaté", chambre: "305", date: "04/04/2025", statut: "Confirmée" },
  ];

export default function Dasboard() {
  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
        <button className="relative p-2 rounded-full bg-white shadow-md">
          <Bell className="w-6 h-6 text-gray-700" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className='card bg-white shadow-md rounded-lg'>
          <div className="card-body flex items-center gap-4 p-4">
            <Bed className="text-blue-500 w-6 h-6" />
            <div>
              <p className="text-sm text-gray-500">Chambres occupées</p>
              <p className="text-xl font-bold">42</p>
            </div>
          </div>
        </div>
        <div className='card bg-white shadow-md rounded-lg'>
          <div className="card-body flex items-center gap-4 p-4">
            <CalendarDays className="text-green-500 w-6 h-6" />
            <div>
              <p className="text-sm text-gray-500">Réservations du jour</p>
              <p className="text-xl font-bold">15</p>
            </div>
          </div>
        </div>
        <div className='card bg-white shadow-md rounded-lg'>
          <div className="card-body flex items-center gap-4 p-4">
            <Users className="text-purple-500 w-6 h-6" />
            <div>
              <p className="text-sm text-gray-500">Nouveaux clients</p>
              <p className="text-xl font-bold">8</p>
            </div>
          </div>
        </div>
        <div className='card bg-white shadow-md rounded-lg'>
          <div className="card-body flex items-center gap-4 p-4">
            <CreditCard className="text-yellow-500 w-6 h-6" />
            <div>
              <p className="text-sm text-gray-500">Revenus (€/mois)</p>
              <p className="text-xl font-bold">5,420€</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique */}
      <div className='card bg-white shadow-md rounded-lg'>
        <div className="card-body p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Taux d'occupation mensuel</h2>
          <LineChart width={600} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Occupation" stroke="#3B82F6" activeDot={{ r: 8 }} />
          </LineChart>
        </div>
      </div>

      {/* Calendrier de réservation */}
      <div className='card bg-white shadow-md rounded-lg'>
        <div className="card-body p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Calendrier des réservations</h2>
          <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" events={events} height={500} />
        </div>
      </div>

      {/* Réservations récentes */}
      <div className='card bg-white shadow-md rounded-lg'>
        <div className="card-body p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Réservations récentes</h2>
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="py-2">Client</th>
                <th>Chambre</th>
                <th>Date</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentReservations.map((res, index) => (
                <tr key={index} className="border-t text-sm">
                  <td className="py-2">{res.client}</td>
                  <td>{res.chambre}</td>
                  <td>{res.date}</td>
                  <td className={`font-medium ${res.statut === "Confirmée" ? "text-green-600" : "text-yellow-600"}`}>{res.statut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
