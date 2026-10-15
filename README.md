# CampusCanteen – Full Stack Digital College Canteen Ordering System

> **A Complete, Practical Full Stack Semester Project for B.Tech Students**  
> *Developed using React (Vite), Node.js, Express.js, REST APIs, JSON Database, and Vanilla CSS.*

---

## 1. Project Name
**CampusCanteen – Full Stack Digital College Canteen Ordering System**

---

## 2. Introduction
**CampusCanteen** is a modern, responsive web application designed for college campuses. It allows students to browse the canteen menu, filter dishes by category, search for their favorite food, manage a persistent shopping tray, and place simulated instant food orders. The backend calculates order totals securely from a server-side JSON menu database, issues a unique canteen token number, and records the order in backend memory.

---

## 3. Problem Statement
In most colleges and universities, students face severe rush hours at the canteen during short 15-to-30-minute breaks:
- Long physical queues at payment counters cause students to waste their entire break.
- Canteen staff struggle with manual paper tokens and verbal order mistakes.
- Students have no clear visibility into what dishes are currently available or their prices.

**CampusCanteen** solves this by providing a lightweight digital self-ordering system accessible directly from any mobile or desktop browser without requiring complex app installations.

---

## 4. Objectives
- To build a fully working end-to-end Full Stack application demonstrating seamless frontend and backend communication.
- To implement standard RESTful API architecture (`GET` and `POST` methods).
- To maintain cart persistence across browser refreshes using `localStorage`.
- To enforce secure server-side price calculation and validation (never trusting client-supplied prices).
- To deploy both React frontend and Express backend together under a single unified web server on cloud platforms like Render.
- To keep the codebase clean, modular, and beginner-friendly so any student can explain it with confidence in a college viva.

---

## 5. Technologies Used

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React.js (v18) with Vite | Fast UI rendering with component-based reactive state |
| **Markup & Scripting** | HTML5 (JSX) & JavaScript (ES6+) | Structure and client-side logic |
| **Styling** | Vanilla CSS3 | Modern design system, responsive Flexbox/Grid, Warm Orange `#F97316` theme (No Tailwind or Bootstrap) |
| **Backend Framework** | Node.js with Express.js (v4) | Fast HTTP server, RESTful API endpoints, static file hosting |
| **Database** | Local JSON (`menu.json`) & Memory | Menu database file and in-memory simulated order storage |
| **Client Storage** | Browser `localStorage` | Keeps user's food tray saved even after browser refresh |
| **Cloud Hosting** | Render Web Service / GitHub | Single-server production hosting |

---

## 6. Frontend Explanation
The frontend is built using **React with Vite**. It is structured as a Single-Page Application (SPA):
1. **Navbar:** Features the CampusCanteen brand identity, quick navigation links, and a dynamic cart button showing a live count badge.
2. **Hero Section:** A warm, inviting welcome banner with the project tagline: *"Delicious campus food, just a click away!"*, an "Explore Menu" call-to-action button, and campus perk highlights.
3. **Filter & Search Bar:** Allows instant real-time filtering of items both by category tabs (*All, Breakfast, Snacks, Meals, Drinks*) and by search keywords.
4. **Food Menu Grid:** Displays cards with food photography, category tags, Indian vegetarian markers, descriptions, prices in Indian Rupees (₹), and interactive "Add to Cart" or quantity adjuster buttons.
5. **Cart Drawer:** A smooth slide-in tray displaying itemized quantities, subtotal calculations, convenience fee waiver, and an order submission trigger.
6. **Confirmation Modal:** Displays a generated canteen pickup token, unique order ID, itemized receipt, and a clear educational disclaimer.

---

## 7. Backend Explanation
The backend is powered by **Node.js** and **Express.js** (`server/index.js`):
- It parses incoming JSON request bodies using `express.json()`.
- It enables Cross-Origin Resource Sharing (`cors`) for local multi-port development.
- It exposes 4 clean REST endpoints under `/api`.
- It implements server-side validation: verifies that requested items exist, quantities are valid integers between 1 and 50, and recalculates totals directly against `menu.json`.
- In production, it serves the compiled React frontend static files from `client/dist` and routes non-API requests back to `index.html` for client-side routing.

---

## 8. JSON Database Explanation
The food catalog is stored in `server/data/menu.json`. Each entry contains:
- `id`: Unique integer identifier.
- `name`: Dish name (e.g., *Masala Dosa, Veg Burger, Idli Sambar*).
- `category`: Category group (*Breakfast, Snacks, Meals, Drinks*).
- `price`: Unit price in Indian Rupees (₹).
- `description`: Fresh culinary description.
- `image`: High-definition food photography URL.

The frontend never directly imports or modifies this file; it fetches the data through the `GET /api/menu` REST endpoint.

---

## 9. REST API Explanation

### Endpoint Summary

| Method | Endpoint | Description | Request Body | Success Response | Error Code |
|---|---|---|---|---|---|
| `GET` | `/api/health` | Backend status check | None | `{ status: "OK", message: "..." }` | - |
| `GET` | `/api/menu` | Retrieve all food items | None | Array of 10+ food objects | `500` |
| `GET` | `/api/menu/:id` | Retrieve single item by ID | None | Single food object | `404` |
| `POST` | `/api/orders` | Place simulated order | `{ items: [{ id: 1, quantity: 2 }] }` | `{ success: true, orderId: "...", ... }` | `400` |

### Sample POST `/api/orders` Payload:
```json
{
  "items": [
    { "id": 1, "quantity": 2 },
    { "id": 3, "quantity": 1 }
  ]
}
```

### Sample Response:
```json
{
  "success": true,
  "orderId": "CC-ORD-10498421",
  "items": [
    { "id": 1, "name": "Idli Sambar", "price": 30, "quantity": 2, "subtotal": 60 },
    { "id": 3, "name": "Samosa (2 pcs)", "price": 20, "quantity": 1, "subtotal": 20 }
  ],
  "totalAmount": 80,
  "status": "Confirmed (Demo)",
  "createdAt": "2026-10-14T18:15:00.000Z",
  "message": "Demo Order Placed Successfully! (This is an educational simulation - no payment was processed.)"
}
```

---

## 10. Project Architecture

```
+-------------------------------------------------------------+
|                  Client Browser (React SPA)                 |
|  - App.jsx (State: menuItems, cart, searchQuery, category)  |
|  - LocalStorage (Persists cart across page reloads)        |
+-------------------------------------------------------------+
                              |
                     HTTP / REST Requests
               (Vite Proxy in Dev / Same-Origin in Prod)
                              |
                              v
+-------------------------------------------------------------+
|               Node.js + Express Production Server           |
|                                                             |
|  Routes:                                                    |
|  - GET  /api/health       --> Status check                  |
|  - GET  /api/menu         --> Reads server/data/menu.json   |
|  - GET  /api/menu/:id     --> Searches item by ID           |
|  - POST /api/orders       --> Validates & recalculates sum  |
|  - GET  * (Catch-all)     --> Serves client/dist/index.html |
+-------------------------------------------------------------+
          |                                   |
          v                                   v
+-----------------------+           +-----------------------+
|  server/data/menu.json|           |   In-Memory Storage   |
|   (Menu Database)     |           |  (Active Demo Orders) |
+-----------------------+           +-----------------------+
```

---

## 11. Folder Structure

```
campuscanteen/
├── client/                      # React Frontend (Vite)
│   ├── public/
│   │   └── favicon.svg          # Canteen SVG logo icon
│   ├── src/
│   │   ├── App.jsx              # Main React Component (State & UI)
│   │   ├── App.css              # Application CSS (Warm Orange styling)
│   │   ├── index.css            # Global CSS reset & design tokens
│   │   └── main.jsx             # React DOM root entry
│   ├── index.html               # Main HTML with Google Fonts
│   ├── package.json             # Frontend dependencies
│   └── vite.config.js           # Vite config with API proxy
├── server/                      # Node.js + Express Backend
│   ├── data/
│   │   └── menu.json            # Sample food catalog JSON
│   ├── index.js                 # Express server & REST API logic
│   └── package.json             # Backend dependencies
├── .gitignore                   # Git ignore rules
├── package.json                 # Root package.json (dev & build scripts)
└── README.md                    # Project documentation & viva guide
```

---

## 12. Main Features
1. **Dynamic Menu Fetching:** All food items are fetched over HTTP from the Express API on component mount.
2. **Instant Search:** Real-time search by food name as the student types.
3. **Category Filtering:** Quick filter tabs (*All, Breakfast, Snacks, Meals, Drinks*) working harmoniously with the search query.
4. **Persistent Shopping Tray:** Add items, increment/decrement quantities, remove items, with automatic sync to browser `localStorage`.
5. **Server-Side Price Security:** Prices are never trusted from the client; Express validates each item against `menu.json` and computes the bill total securely.
6. **Unique Demo Order ID & Token:** Issues tokens like `#8421` for campus counter pickup simulation.
7. **Responsive & Mobile-First:** Fluid layouts optimized for smartphones, tablets, laptops, and desktop monitors.

---

## 13. How React Communicates with Express
- When `App.jsx` mounts, a React `useEffect` hook fires an asynchronous `fetch('/api/menu')` request.
- In **development**, the Vite development server proxies requests starting with `/api` to `http://localhost:5000`.
- In **production**, Express serves both the `/api` routes and the static compiled frontend files from `client/dist` from the **exact same port and domain**, avoiding all CORS issues.

---

## 14. How the Cart Works
- The cart state is managed in React via `useState`.
- When an item is added:
  - If the item already exists in the cart, its `quantity` property increments by 1.
  - If it is new, it is appended to the array with `{ quantity: 1 }`.
- Decreasing quantity below 1 automatically cleans up the item from the tray.
- Subtotal is computed dynamically: `sum = items.reduce((total, i) => total + (i.price * i.quantity), 0)`.

---

## 15. How Orders Are Processed
1. User clicks **"Place Demo Order"** in the cart drawer.
2. React checks that the cart is not empty.
3. React sends `POST /api/orders` with an array of `{ id, quantity }`.
4. Express verifies each ID against `menu.json` and ensures quantity is between 1 and 50.
5. Express computes the exact grand total using server prices.
6. Express generates a unique Order ID (`CC-ORD-XXXX`), saves the order in memory, and returns HTTP `201 Created`.
7. React clears the cart from state and `localStorage`, closes the drawer, and pops open the Order Confirmation Token Modal.

---

## 16. LocalStorage Explanation
The browser's `localStorage` is used to persist the shopping tray:
- On initial load: `JSON.parse(localStorage.getItem('campuscanteen_cart') || '[]')`.
- On state change: A `useEffect` hook triggers `localStorage.setItem('campuscanteen_cart', JSON.stringify(cart))`.
- When an order is placed: `localStorage.removeItem('campuscanteen_cart')` resets the stored tray.
This ensures a student won't lose their selected items if they accidentally refresh the tab or close the browser.

---

## 17. Steps to Run Locally

### Prerequisites
- Node.js (version 18 or higher)
- npm (version 9 or higher)

### Step 1: Clone or Open the Project
Open terminal in the `campuscanteen` folder:
```bash
cd campuscanteen
```

### Step 2: Install All Dependencies
```bash
npm install
```
*(This automatically installs root, server, and client packages using the `postinstall` script).*

### Step 3: Run Development Server
```bash
npm run dev
```
- Starts Express backend on `http://localhost:5000`
- Starts Vite frontend on `http://localhost:5173`
- Open your browser at: **`http://localhost:5173`**

### Step 4: Run Production Mode Locally (Optional)
```bash
npm run build
npm start
```
- Compiles the React frontend into `client/dist`.
- Starts the unified Express production server at: **`http://localhost:5000`**.

---

## 18. Steps to Deploy on Render

Render enables hosting both React and Express under a **Single Free Web Service**:

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CampusCanteen Full Stack Project"
   git branch -M main
   git remote add origin https://github.com/<your-username>/campuscanteen.git
   git push -u origin main
   ```
2. **Log in to [Render](https://render.com):**
   - Click **"New +"** and choose **"Web Service"**.
   - Select your `campuscanteen` GitHub repository.
3. **Configure Settings:**
   - **Name:** `campuscanteen` (or any unique name)
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. **Deploy:**
   - Click **"Create Web Service"**.
   - Render will build the React bundle and start the Express server.
   - Once deployed, your app will be live at `https://campuscanteen-xxxx.onrender.com`.

---

## 19. Live Website Link
- **Deployment Status:** Ready for deployment on Render.
- *(When deployed to your Render account, your public URL will be `https://<your-service-name>.onrender.com`)*.

---

## 20. Advantages
- **Fast and Lightweight:** Zero heavy databases; starts in seconds.
- **Easy to Explain:** Clean code without confusing abstractions or complex build pipelines.
- **Cost Effective:** Completely free to run locally and on cloud free tiers.
- **Safe & Realistic:** Simulates real-world counter ordering workflow without financial risk.

---

## 21. Limitations
- **Demo Order Records in Memory:** Orders are stored in memory and reset if the server restarts.
- **Simulated Payment:** No real payment gateway integration (designed intentionally for academic demonstration).
- **Single Canteen Scope:** Tailored for a single campus canteen counter.

---

## 22. Future Enhancements
- Integration with MongoDB / PostgreSQL for persistent historical order tracking.
- WebSockets (Socket.io) for live order status updates (*e.g., "Preparing" -> "Ready for Pickup"*).
- Student ID authentication via College ERP login.
- Real payment integration with UPI QR code or Razorpay.

---

## 23. Conclusion
CampusCanteen proves that a full-stack web application can be built cleanly, professionally, and robustly using fundamental industry-standard technologies (React, Node.js, Express, REST). It solves a practical, relatable campus problem while remaining straightforward for undergraduate engineering students to present and defend during project viva examinations.

---

# 1-Minute Project Presentation Script (For Viva / Demo)

> *"Good morning respected evaluators,*  
> *Today I am presenting **CampusCanteen**, a Full Stack Digital College Canteen Ordering System that I built to solve the daily rush and long queues students experience during short campus breaks.*  
>  
> *The frontend is developed using **React with Vite and Vanilla CSS**, featuring an intuitive orange-themed design, real-time search, category filters, and a shopping tray persisted via browser **LocalStorage**.*  
>  
> *The backend is powered by **Node.js and Express.js**, providing RESTful endpoints for health checks, menu retrieval from a local JSON database, and secure order placement. When a student places an order, the server validates the items, recalculates the prices server-side to prevent tampering, and generates a unique pickup token.*  
>  
> *The entire system is unified to run under a single production server, making it lightweight, fast, and ready for deployment on platforms like Render. Thank you, and I would now be happy to answer any questions!"*

---

# 15 Beginner-Friendly Viva Questions & Answers

### Q1. What is Full Stack Development?
**Answer:** Full Stack Development refers to the practice of developing both the client-side (frontend) and server-side (backend) portions of a web application. It includes designing the user interface, building server logic, handling databases, and writing APIs to connect them.

### Q2. What is CampusCanteen and what problem does it solve?
**Answer:** CampusCanteen is a digital college food ordering web application. It solves the problem of long queues and crowded counters in college canteens by allowing students to browse available food, customize their order online, and receive a digital pickup token.

### Q3. What is HTML and how is it used in React?
**Answer:** HTML (HyperText Markup Language) provides the structure for web pages. In React, we write **JSX (JavaScript XML)**, an HTML-like syntax that allows us to write HTML tags directly inside JavaScript files.

### Q4. What is CSS and why did you use Vanilla CSS instead of frameworks?
**Answer:** CSS (Cascading Style Sheets) styles the layout, colors, and fonts of web pages. We used Vanilla CSS to maintain full design control, keep the project lightweight, avoid external framework bloat, and demonstrate core CSS proficiency (Flexbox, Grid, and CSS variables).

### Q5. What is React.js?
**Answer:** React is a popular open-source JavaScript library developed by Meta for building dynamic, component-based user interfaces. It uses a virtual DOM to efficiently update and re-render only the components whose state changes.

### Q6. What is Node.js?
**Answer:** Node.js is an open-source, cross-platform JavaScript runtime environment built on Chrome's V8 engine that allows developers to run JavaScript code outside of a web browser, particularly on the backend server.

### Q7. What is Express.js?
**Answer:** Express.js is a minimalist, flexible web application framework for Node.js. It simplifies building web servers, routing HTTP requests (`GET`, `POST`), applying middleware, and serving static files.

### Q8. What is a REST API?
**Answer:** REST (Representational State Transfer) is an architectural style for designing networked applications. A REST API uses standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) to exchange data between client and server, usually in JSON format.

### Q9. What is JSON and where is it used in this project?
**Answer:** JSON (JavaScript Object Notation) is a lightweight, human-readable data format used to transmit and store structured data. In this project, it is used for our menu database (`menu.json`) and as the communication format for REST API requests and responses.

### Q10. What is the difference between GET and POST requests?
**Answer:**
- `GET`: Used to retrieve data from the server without modifying server state (e.g., `GET /api/menu`). Parameters are sent in the URL.
- `POST`: Used to submit data to the server to create or process a resource (e.g., `POST /api/orders`). Data is securely sent inside the HTTP request body.

### Q11. What is the `useState` hook in React?
**Answer:** `useState` is a built-in React hook that allows functional components to declare and manage state variables. When a state variable is updated using its setter function, React automatically re-renders the component to reflect the new state.

### Q12. What is the `useEffect` hook in React?
**Answer:** `useEffect` is a React hook used to perform side effects in functional components, such as fetching data from an API, subscribing to events, or synchronizing state with browser `localStorage`.

### Q13. What is LocalStorage and why is it used here?
**Answer:** `localStorage` is a Web Storage API feature in modern browsers that allows web applications to store key-value data persistently with no expiration time. We use it to save the student's cart so that reloading the page does not erase their selected food items.

### Q14. Why do you recalculate prices on the backend rather than trusting the frontend total?
**Answer:** Security best practice. A client-side request can easily be intercepted and modified by a malicious user (e.g., changing the price from ₹100 to ₹1). By looking up each item ID in the server's `menu.json` and computing the total on the backend, we guarantee accurate and tamper-proof billing.

### Q15. How are the frontend and backend connected in this project?
**Answer:** The frontend communicates with the backend via HTTP requests using the native JavaScript `fetch()` API. During local development, Vite proxies `/api` calls to the Express server on port 5000. In production, Express hosts both the REST endpoints and the compiled React static files on the same port, creating a unified single-server application.
