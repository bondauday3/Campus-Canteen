/**
 * CampusCanteen - Backend Server
 * Technology: Node.js & Express.js
 * 
 * This server provides REST APIs for the CampusCanteen system:
 * 1. GET  /api/health   - Check server status
 * 2. GET  /api/menu     - Get all food menu items from local JSON
 * 3. GET  /api/menu/:id - Get single food item details by ID
 * 4. POST /api/orders   - Place a simulated demo order with server-side calculation
 * 
 * In production, it also serves the built React frontend static files.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors()); // Allow cross-origin requests in development
app.use(express.json()); // Parse incoming JSON request bodies

// Path to sample food menu JSON database
const MENU_FILE_PATH = path.join(__dirname, 'data', 'menu.json');

// In-memory array for demo orders (resets when server restarts)
const demoOrders = [];

/**
 * Helper function: Read menu items from local JSON file
 * Keeps data reading simple and beginner-friendly.
 */
function getMenuData() {
  try {
    const rawData = fs.readFileSync(MENU_FILE_PATH, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading menu.json file:', error.message);
    return [];
  }
}

// ==========================================
// REST API ROUTES
// ==========================================

/**
 * API 1: GET /api/health
 * Purpose: Health check endpoint to verify backend status
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'CampusCanteen API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * API 2: GET /api/menu
 * Purpose: Returns all food items from the JSON database
 */
app.get('/api/menu', (req, res) => {
  const menu = getMenuData();
  if (!menu || menu.length === 0) {
    return res.status(500).json({
      error: 'Unable to load menu data from database'
    });
  }
  res.status(200).json(menu);
});

/**
 * API 3: GET /api/menu/:id
 * Purpose: Returns a specific food item by its ID
 */
app.get('/api/menu/:id', (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  if (isNaN(itemId)) {
    return res.status(400).json({ error: 'Invalid food item ID' });
  }

  const menu = getMenuData();
  const item = menu.find(food => food.id === itemId);

  if (!item) {
    return res.status(404).json({ error: 'Food item not found' });
  }

  res.status(200).json(item);
});

/**
 * API 4: POST /api/orders
 * Purpose: Place a demo food order
 * 
 * Security & Logic:
 * - Validates request body structure
 * - Rejects empty orders
 * - Rejects non-existent item IDs
 * - Rejects zero, negative, or excessively high (>50) quantities
 * - Recalculates all prices using server JSON data (Never trusts client prices!)
 * - Generates unique demo order ID
 * - Stores in backend memory
 */
app.post('/api/orders', (req, res) => {
  const { items } = req.body;

  // 1. Validate items array
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Order must contain at least one food item'
    });
  }

  const menu = getMenuData();
  let totalAmount = 0;
  const verifiedOrderItems = [];

  // 2. Validate each item and calculate price server-side
  for (let i = 0; i < items.length; i++) {
    const orderItem = items[i];
    const itemId = parseInt(orderItem.id, 10);
    const quantity = parseInt(orderItem.quantity, 10);

    // Validate item ID
    if (isNaN(itemId)) {
      return res.status(400).json({
        error: `Invalid item ID at position ${i + 1}`
      });
    }

    // Validate quantity: integer between 1 and 50
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        error: `Quantity for item ID ${itemId} must be at least 1`
      });
    }

    if (quantity > 50) {
      return res.status(400).json({
        error: `Maximum quantity per item is 50. Received ${quantity} for item ID ${itemId}`
      });
    }

    // Lookup item in menu database
    const menuItem = menu.find(f => f.id === itemId);
    if (!menuItem) {
      return res.status(400).json({
        error: `Food item with ID ${itemId} does not exist in our canteen menu`
      });
    }

    // Calculate subtotal securely from server price
    const subtotal = menuItem.price * quantity;
    totalAmount += subtotal;

    verifiedOrderItems.push({
      id: menuItem.id,
      name: menuItem.name,
      category: menuItem.category,
      price: menuItem.price,
      quantity: quantity,
      subtotal: subtotal
    });
  }

  // 3. Generate unique demo order ID (e.g. CC-ORD-XXXX)
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `CC-ORD-${Date.now().toString().slice(-4)}${randomSuffix}`;

  // 4. Create in-memory demo order record
  const newOrder = {
    orderId,
    items: verifiedOrderItems,
    totalAmount,
    status: 'Confirmed (Demo)',
    createdAt: new Date().toISOString()
  };

  demoOrders.push(newOrder);

  // 5. Return success response
  res.status(201).json({
    success: true,
    orderId: newOrder.orderId,
    items: newOrder.items,
    totalAmount: newOrder.totalAmount,
    status: newOrder.status,
    createdAt: newOrder.createdAt,
    message: 'Demo Order Placed Successfully! (This is an educational simulation - no payment was processed.)'
  });
});

// ==========================================
// SERVE PRODUCTION FRONTEND STATIC ASSETS
// ==========================================
const clientDistPath = path.join(__dirname, '../client/dist');

// Serve static assets from built React frontend
app.use(express.static(clientDistPath));

// For any non-API route, send back React's index.html (supports single page refresh)
app.get('*', (req, res) => {
  // If request starts with /api but didn't match any route above
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CampusCanteen API</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; background: #FFF9F2; color: #1F2937; }
            h1 { color: #F97316; }
            .card { background: white; padding: 20px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>CampusCanteen Backend Server</h1>
            <p>API is running smoothly on port ${PORT}.</p>
            <p>React frontend build not found in <code>client/dist</code> yet.</p>
            <p>Run <code>npm run build</code> to compile the frontend, or visit <code>/api/menu</code> to test the API.</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Start Express server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(` CampusCanteen Server Running!`);
  console.log(` Port: ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(` Menu API:     http://localhost:${PORT}/api/menu`);
  console.log(`=========================================`);
});
