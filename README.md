# 🎯 Filament Tracker Frontend

A **Vue.js** web application to track your 3D printing filament spools.  
Works together with the [Filament Tracker Backend](https://github.com/axelterrier/filament-tracker-backend).

---

## 📖 Description

This application helps you **manage** and **monitor** your filament inventory.  
You can track remaining stock, material types, and other details to make your 3D printing workflow easier.

---

## ✨ Features

### 📦 Core Features
- ➕ Add, ✏️ edit, and 🗑️ delete filament spools
- 📊 Monitor stock levels for each filament type
- 🖥️ User-friendly interface built with **Vue.js** + **Ionic**

### 🛠️ Features for **Bambu Lab** Users
- 🔄 Auto-sync your AMS filament data (LAN mode)
- 📡 Import filament data using a **Proxmark** RFID reader

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** ≥ 14
- **npm** or **yarn**

### 📥 Installation
```bash
git clone https://github.com/axelterrier/filament-tracker-frontend.git
cd filament-tracker-frontend
```

Install dependencies:
```bash
npm install
# or
yarn install
```

### ▶️ Development Server
```bash
ionic serve
```
The app will be available at:  
`http://localhost:8100` *(or the port specified in your configuration)*

---

## 🤝 Contributing

Contributions are welcome!  
1. Fork the repository  
2. Create a new branch (`git checkout -b feature/my-feature`)  
3. Commit your changes  
4. Push to your branch  
5. Open a Pull Request  

---

## 📜 License
This project does not currently specify a license.

---

🔗 **Backend repository**: [Filament Tracker Backend](https://github.com/axelterrier/filament-tracker-backend)  
🐞 **Report issues or request features**: via the *Issues* tab in the repository
