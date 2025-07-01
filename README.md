# HotelReservation - Application web de gestion de réservations d’hébergement

**HotelReservation** est une application web complète développée en **Full Stack** :
- **Backend :** Django (Python) – création d’APIs REST et gestion de la logique métier
- **Frontend :** React.js – interface utilisateur fluide et responsive, designé avec **Tailwind CSS**

## Fonctionnalités principales

- 🏨 **Gestion des hébergements**
  - Ajout, modification et suppression de chambres par les gérants
  - Visualisation et recherche des offres d’hébergement

- 📅 **Système de réservation**
  - Réservation en ligne pour les clients avec calendrier de disponibilité
  - Gestion, modification et annulation des réservations

- 👤 **Gestion des utilisateurs**
  - Inscription et connexion sécurisée (clients & gérants)
  - securité et auth JWT 
  - Différents rôles : client, gérant d’hôtel (permissions différenciées)

- 📊 **Dashboard dynamique**
  - Historique et état des réservations pour les clients

- 💬 **Notifications et confirmations ( a venir )**
  - Emails et alertes de confirmation de réservation, annulation, etc.

- 🎨 **Interface moderne & responsive**
  - Expérience utilisateur optimale sur tous devices grâce à **React.js** & **Tailwind CSS**

## Stack technique

- **Backend :**
  - Django 4+ (Python)
  - Django REST Framework (APIs RESTful)
  - Authentification JWT 
  - Base de données : SQLite
- **Frontend :**
  - React.js (avec Vite)
  - Tailwind CSS pour des styles rapides, modernes et responsives
  - Axios ou Fetch pour consommer l'API
  - React Router pour la navigation

## Aperçu

![Aperçu HotelBooking](screenshot.png)

## Installation & Lancement

### Backend (Django)

```bash
git clone https://github.com/ton-utilisateur/hotelbooking.git
cd hotelbooking/backend
python -m venv venv
source venv/bin/activate  # sous Windows : venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (React.js)
```bash
cd ../frontend
npm install
npm start
```



- **structure :**
- hotelbooking/
  - backend/     → Projet Django (API, models, admin, etc.)
  - frontend/    → Projet React.js (UI, services, pages)

