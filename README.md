# White Chillies Cafe - Full Stack Application

A complete full-stack café ordering system built with Next.js 14, TypeScript, and MongoDB.

## Features

- **Single Cafe System**: Cafe Aroma only
- **User Authentication**: Separate login pages for users and admins with JWT-based authentication
- **Menu Management**: Admins can add, edit, remove, and manage item availability
- **Order Management**: Admins can accept, reject, complete, and delete orders
- **Order History**: Users can view their past orders with status tracking
- **Order Cancellation**: Users can cancel orders within 5 minutes of placement
- **Cart System**: Persistent shopping cart across navigation with accurate total calculation
- **Gallery Management**: Admins can upload and manage gallery photos
- **Rating System**: Users can rate menu items they've ordered
- **Notification System**: Persistent user notifications for order status updates with color-coded types
- **Item Availability Management**: Admins can mark items as unavailable; unavailable items automatically become available at 9 AM daily
- **Auto-Cancellation**: Orders containing unavailable items are automatically cancelled with user notification
- **Real-time Updates**: Changes reflect immediately across the system

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes (serverless)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **State Management**: React Context API
- **Styling**: CSS Modules + Global CSS
- **Icons**: Font Awesome 6.7.2

## Prerequisites

- Node.js 18+ installed
- MongoDB installed and running (local) OR MongoDB Atlas account (cloud)
- npm or yarn package manager

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Project 1 html"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/cafe-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/cafe-app?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important Security Notes:**
- Never commit `.env.local` to version control
- Use a strong, random string for `JWT_SECRET` in production
- Generate a secure secret: `openssl rand -base64 32`

### 4. Set Up MongoDB

**Option A: Local MongoDB**
1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   - **Mac (Homebrew):** `brew services start mongodb-community`
   - **Linux:** `sudo systemctl start mongod`
   - **Windows:** Start MongoDB service from Services panel
3. MongoDB will run on `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string and update `MONGODB_URI` in `.env.local`

### 5. Seed Database with Default Admin User

Run the seed script to create the default admin user:

```bash
npm run seed
```

This creates an admin user with:
- **Username:** `parth`
- **Password:** `pa123`
- **Role:** `admin`

**Note:** The seed script will create the user if it doesn't exist, or update the password if it already exists.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── admin/               # Admin pages
│   │   ├── login/          # Admin login page
│   │   └── page.tsx        # Admin dashboard
│   ├── api/                 # API routes (backend)
│   │   ├── auth/           # Authentication endpoints
│   │   ├── menu/           # Menu CRUD endpoints
│   │   ├── orders/         # Order management endpoints
│   │   ├── notifications/  # Notification endpoints
│   │   ├── gallery/         # Gallery management endpoints
│   │   └── ratings/        # Rating submission endpoint
│   ├── login/              # User login page
│   ├── register/           # User registration page
│   ├── menu/               # Cafe menu page (users)
│   ├── cart/               # Shopping cart page
│   ├── orders/             # Order history page (users)
│   ├── notifications/      # Notifications page (users)
│   ├── gallery/            # Gallery page (users)
│   ├── about/              # About page
│   ├── layout.tsx         # Root layout (providers)
│   ├── globals.css        # Global styles
│   └── page.tsx            # Home page (redirects)
├── components/             # React components
│   ├── Navbar.tsx         # Navigation bar
│   ├── Footer.tsx         # Footer component
│   ├── MenuCard.tsx       # Menu item card
│   └── OrderModal.tsx     # Order form modal
├── contexts/               # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   └── CartContext.tsx    # Shopping cart state
├── lib/                    # Utility functions
│   ├── mongodb.ts         # Database connection
│   ├── auth.ts            # Auth utilities (localStorage)
│   └── notifications.ts   # Notification helper functions
├── models/                 # MongoDB models (Mongoose schemas)
│   ├── User.ts            # User model
│   ├── MenuItem.ts        # Menu item model
│   ├── Order.ts           # Order model
│   ├── GalleryPhoto.ts    # Gallery photo model
│   ├── Rating.ts          # Rating model
│   └── Notification.ts    # Notification model
├── data/                   # Static data (TypeScript types)
│   └── menuItems.ts       # MenuItem type definition
├── scripts/                # Utility scripts
│   └── seed.js            # Database seeding script
├── public/                 # Static assets
│   ├── gallery/           # Uploaded gallery photos
│   └── [images]           # Menu item images, etc.
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## Usage

### For Users

1. **Register**: Create an account at `/register`
2. **Login**: Sign in at `/login`
3. **Browse Menu**: View menu items at `/menu` and add items to cart
4. **View Cart**: Review cart items at `/cart`
5. **Place Order**: Complete order form with delivery details
6. **View History**: Check order status at `/orders`
7. **Cancel Orders**: Cancel orders within 5 minutes of placement
8. **View Notifications**: Check order status updates at `/notifications`
9. **Rate Items**: Rate menu items from order history
10. **Reorder**: Quickly reorder previous orders

### For Admins

1. **Login**: Sign in at `/admin/login`
2. **Manage Menu**: 
   - Add new menu items in "Menu Management" tab
   - Edit existing items (name, price, image, rating)
   - Delete items
3. **Manage Orders**: 
   - View all orders in "Orders" tab
   - Accept/reject pending orders
   - Mark orders as completed
   - Delete orders permanently
   - Mark items as unavailable directly from order items
4. **Manage Item Availability**:
   - Mark items as unavailable (from orders or menu management)
   - View unavailable items in dedicated section
   - Add items back to menu
   - Items automatically become available at 9 AM daily
5. **Manage Gallery**:
   - Add photos by URL or upload files
   - Delete photos

## Default Admin Credentials

After running the seed script (`npm run seed`), you can login with:

- **Username:** `parth`
- **Password:** `pa123`
- **Role:** `admin`

**⚠️ Security Warning:** Change the default password in production!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (public)
- `POST /api/auth/login` - Login user/admin (public)

### Menu
- `GET /api/menu` - Get all menu items (public)
- `POST /api/menu` - Add menu item (admin only)
- `PATCH /api/menu/[id]` - Update menu item (admin only)
- `DELETE /api/menu/[id]` - Delete menu item (admin only)

### Orders
- `GET /api/orders` - Get orders (user gets own, admin gets all)
- `POST /api/orders` - Create new order (authenticated)
- `PUT /api/orders/[id]` - Cancel order (user only, within 5-minute buffer)
- `PATCH /api/orders/[id]` - Update order status (admin only)
- `DELETE /api/orders/[id]` - Delete order (admin only)

### Notifications
- `GET /api/notifications` - Get user notifications (authenticated)
- `PATCH /api/notifications/[id]` - Mark notification as read (authenticated)

### Gallery
- `GET /api/gallery` - Get all gallery photos (public)
- `POST /api/gallery` - Add photo by URL (admin only)
- `POST /api/gallery/upload` - Upload photo file (admin only)
- `DELETE /api/gallery/[id]` - Delete photo (admin only)

### Ratings
- `POST /api/ratings` - Submit/update rating (user only)

## Key Features Explained

### Authentication & Authorization
- JWT-based stateless authentication
- Passwords hashed with bcrypt (10 rounds)
- Role-based access control (user vs admin)
- Token stored in localStorage (client-side)
- 7-day token expiration

### Order Management
- Status flow: `pending` → `accepted` → `completed` OR `rejected`/`cancelled`
- Users can cancel orders within 5 minutes of placement (even if accepted)
- Orders containing unavailable items are automatically cancelled
- Users can only view their own orders
- Admins can view and manage all orders

### Cart System
- Client-side cart state (React Context)
- Persists across navigation (Next.js Link prevents page reload)
- Cafe-specific carts (currently single cafe: "aroma")
- Cart cleared after successful order placement

### Rating System
- Users can only rate items they've ordered
- One rating per user per item (upsert)
- Average rating automatically calculated
- Ratings displayed on menu items

### Notification System
- Persistent notifications stored in database
- Notifications created for: order placed, accepted, rejected, completed, cancelled
- Color-coded by type (blue: placed, green: accepted, red: rejected, orange: cancelled, dark green: completed)
- Notifications persist across login/logout
- Users can mark notifications as read

### Item Availability Management
- Admins can mark items as unavailable
- Unavailable items remain visible but disabled in user menu
- Unavailable items cannot be added to cart
- Orders containing unavailable items are automatically cancelled
- Items automatically become available at 9:00 AM server time daily

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Seed database (create admin user)
npm run seed

# Lint code
npm run lint
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running (local) or cluster is accessible (Atlas)
- Check `MONGODB_URI` in `.env.local`
- Verify MongoDB port (default: 27017 for local)
- For Atlas: Check IP whitelist and connection string format

### Authentication Issues
- Clear browser localStorage: `localStorage.clear()`
- Check `JWT_SECRET` in `.env.local` matches between requests
- Verify user exists in database
- Check token expiration (7 days)

### Image Loading Issues
- Ensure images are in `/public` folder
- Use paths starting with `/` (e.g., `/image.jpg`)
- For external URLs, use full `http://` or `https://` path
- Check browser console for 404 errors

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`

## Security Best Practices

1. **Environment Variables**: Never commit `.env.local` to version control
2. **JWT Secret**: Use a strong, random secret in production
3. **Password Hashing**: All passwords are hashed with bcrypt
4. **Input Validation**: All API endpoints validate input
5. **Role-Based Access**: Admin routes verify JWT and role
6. **HTTPS**: Use HTTPS in production
7. **Rate Limiting**: Consider adding rate limiting for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes.

## Support

For issues or questions, please open an issue on the repository.
