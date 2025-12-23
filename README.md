# MODELLA 👗
## Smart Digital Wardrobe — Full-Stack Fashion App

**MODELLA** is a full-stack smart wardrobe application that allows users to manage their digital clothing collection, upload garment images, analyze dominant colors, and intelligently filter and build outfits.

Beyond personal wardrobe management, MODELLA enables **sharing looks with the app’s community**, creating a social fashion experience that encourages inspiration, style discovery, and interaction between users.

The project combines image processing, color analysis, advanced state management, and a modern, user-focused interface to simulate a real-world fashion product.

---

## ✨ Key Features

- Personal digital wardrobe management  
- Upload clothing items with images  
- Dominant color detection from images  
- Smart filtering and outfit creation  
- Share outfits with the user community  
- Explore and get inspired by looks from other users  
- Responsive and modern user interface  
- Advanced client-side state management  

---

## 🛠️ Tech Stack

### Frontend
- **Next.js (App Router)**
- **React**
- **TypeScript**
- **CSS Modules**
- **Zustand** – state management

### Data & Utilities
- Image processing  
- Color analysis from images  
- HTML Canvas usage  

---

## 📂 Project Structure

> This structure shows only application-related files.  
> System folders such as `node_modules` are excluded.

```
MODELLA/
│
├── app/                 # Next.js App Router
│   ├── Components/      # Shared UI components
│   ├── pages/           # Application pages
│   └── styles/          # Global styles
│
├── public/              # Static assets (images, icons)
│   ├── img/
│   ├── home/
│   └── slider/
│
├── services/            # Business logic and API communication
│   ├── client/          # Client-side services
│   └── server/          # Server-side services / APIs
│
├── store/               # Global state management (Zustand)
│
├── types/               # TypeScript types and definitions
│
├── package.json
└── README.md
```

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

The application will start in local development mode.

---

## 📝 Notes

- Built using **Next.js App Router**
- Clear separation between UI, logic, and state
- Combines personal wardrobe management with social fashion features
- Strong focus on user experience and image-based functionality

---

## 👩‍💻 Project Creator

**Shira Goldstein**  
Full-Stack Development – Educational Project
