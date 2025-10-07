# LOGISTICS 1 - Smart Hospital Supply Chain & Procurement Management

A comprehensive role-based hospital logistics management system built with React, TypeScript, TailwindCSS, and Framer Motion.

## 🏥 System Overview

LOGISTICS 1 is a smart hospital supply chain and procurement management system designed to streamline hospital operations through role-based access control, RFID tracking simulation, and comprehensive dashboard management.

### Key Features

- **Role-Based Access Control**: 7 different user roles with specific permissions
- **RFID Simulation**: Mock RFID scanning for procurement tracking
- **Real-time Dashboards**: Role-specific analytics and monitoring
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI/UX**: Clean, professional interface with smooth animations
- **Offline-First Architecture**: Designed to work without constant internet connection

## 🎯 System Modules

### 1. Smart Warehousing System (SWS)
- **Access**: Employee, Manager
- **Features**: Inventory management, RFID scanning, stock monitoring
- **Key Functions**: Track items, manage deliveries, low stock alerts

### 2. Procurement & Sourcing Management (PSM)
- **Access**: Procurement Staff, Admin
- **Features**: Purchase order management, supplier tracking, RFID procurement
- **Key Functions**: Create requests, track deliveries, manage suppliers

### 3. Project Logistics Tracker (PLT)
- **Access**: Project Manager
- **Features**: Project-based logistics, delivery tracking, staff assignment
- **Key Functions**: Monitor project progress, track deliveries, assign resources

### 4. Asset Lifecycle & Maintenance (ALMS)
- **Access**: Maintenance Staff, Manager
- **Features**: Asset tracking, maintenance scheduling, RFID tagging
- **Key Functions**: Schedule repairs, track asset conditions, maintenance logs

### 5. Document Tracking & Records (DTRS)
- **Access**: Document Analyst, Admin
- **Features**: Document management, verification, archival
- **Key Functions**: Upload documents, verify records, maintain archives

## 👥 User Roles & Access

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| **Admin** | admin | admin123 | Full system access, user management |
| **Manager** | manager1 | manager123 | Management functions, approvals |
| **Employee** | employee1 | employee123 | Warehouse operations, RFID scanning |
| **Procurement Staff** | procurement1 | procurement123 | Purchase orders, supplier management |
| **Project Manager** | project1 | project123 | Project tracking, logistics coordination |
| **Maintenance Staff** | maintenance1 | maintenance123 | Asset management, maintenance logs |
| **Document Analyst** | document1 | document123 | Document verification, record keeping |

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd logistics1-hospital-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Login Credentials

Use any of the demo credentials provided in the login page or refer to the User Roles table above.

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Data visualization and charts
- **Lucide React** - Modern icon library

### Development Tools
- **Vite** - Fast build tool and dev server
- **PostCSS** - CSS processing
- **ESLint** - Code linting (recommended)

### Future Integrations
- **Supabase** - Database and authentication (ready for integration)
- **Vercel** - Deployment platform
- **GitHub** - Version control and CI/CD

## 📱 Features Overview

### Authentication System
- Secure role-based login
- Session management with localStorage
- Protected routes and navigation
- User authorization system

### Dashboard Features
- **Real-time Analytics**: Live charts and statistics
- **RFID Simulation**: Mock scanning for procurement
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion transitions
- **Interactive Charts**: Recharts integration

### Role-Specific Features

#### Admin Dashboard
- User management and authorization
- System health monitoring
- Comprehensive analytics
- User role distribution charts
- System activity logs

#### Manager Dashboard
- Approval workflows
- Department performance monitoring
- Procurement trend analysis
- Project status tracking
- Budget oversight

#### Employee Dashboard (SWS)
- Inventory management
- RFID scanning simulation
- Stock level monitoring
- Delivery tracking
- Low stock alerts

#### Procurement Dashboard (PSM)
- Purchase order management
- Supplier performance tracking
- RFID procurement scanning
- Delivery verification
- Spending analytics

#### Project Manager Dashboard (PLT)
- Project progress tracking
- Resource allocation
- Delivery timeline management
- Staff assignment
- Project analytics

#### Maintenance Dashboard (ALMS)
- Asset lifecycle management
- Maintenance scheduling
- RFID asset scanning
- Repair tracking
- Equipment status monitoring

#### Document Analyst Dashboard (DTRS)
- Document upload and verification
- Record archival
- Delivery receipt management
- Document type analytics
- Verification workflows

## 🎨 Design System

### Color Palette
- **Primary**: #1D3557 (Corporate Dark Blue)
- **Secondary**: #457B9D (Blue Gray)
- **Accent**: #00A896 (Teal Green)
- **Background**: #F4F5F7 (Light Gray)
- **Text**: #1E1E1E (Dark Gray)

### Typography
- **Font Family**: Inter, Poppins (Google Fonts)
- **Headings**: Poppins Bold/ExtraBold
- **Body Text**: Inter Regular/Medium

### Components
- **Cards**: Rounded corners (rounded-2xl), soft shadows
- **Buttons**: Primary, secondary, and accent variants
- **Inputs**: Rounded with focus states
- **Animations**: Smooth transitions and hover effects

## 📊 Data Visualization

The system includes comprehensive charts and analytics:

- **Bar Charts**: Performance metrics, comparisons
- **Line Charts**: Trends over time
- **Pie Charts**: Distribution analysis
- **Progress Bars**: Task completion
- **Status Indicators**: Real-time updates

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable components
│   ├── dashboards/     # Role-specific dashboards
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── TopNavigation.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── pages/              # Page components
│   ├── LoginPage.tsx   # Authentication page
│   └── Dashboard.tsx    # Main dashboard
├── App.tsx             # Main application
└── main.tsx           # Application entry point
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Deploy automatically on push to main branch

### Environment Variables
Create a `.env.local` file for environment-specific configurations:
```env
VITE_APP_TITLE=LOGISTICS 1
VITE_APP_VERSION=1.0.0
```

## 🔮 Future Enhancements

### Database Integration
- **Supabase Setup**: User authentication and data storage
- **Real-time Updates**: Live data synchronization
- **Offline Support**: Progressive Web App features

### Advanced Features
- **Email Notifications**: Automated alerts and updates
- **Advanced Analytics**: Machine learning insights
- **Mobile App**: React Native companion app
- **API Integration**: Third-party service connections

### Security Enhancements
- **JWT Tokens**: Secure authentication
- **Role Permissions**: Granular access control
- **Audit Logs**: Comprehensive activity tracking
- **Data Encryption**: Secure data handling

## 📞 Support

For questions, issues, or feature requests:

1. Check the documentation
2. Review the code comments
3. Create an issue in the repository
4. Contact the development team

## 📄 License

This project is created for educational purposes as a school project for project management studies.

---

**LOGISTICS 1** - Streamlining Hospital Operations Through Smart Technology

*Built with ❤️ for better healthcare logistics management*
