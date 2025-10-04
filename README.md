# 🎬 Cinehack Celluloid - AI-Powered Film Production ERP

A comprehensive film production management system that combines AI-driven script analysis with intelligent budget forecasting, scene planning, and resource management.

## 🚀 Features

### ✅ Currently Implemented
- **Project Management**: Create, manage, and track film projects
- **AI Script Analysis**: Upload PDF scripts and automatically extract scenes, characters, props, and locations using Google Gemini AI
- **Scene Management**: Detailed scene breakdowns with cast, crew, and equipment requirements
- **Budget Tracking**: Comprehensive budget management with cost categories and spending tracking
- **Character Management**: Cast management with actor assignments and role tracking
- **Actor Catalog**: Centralized database of actors with rates and availability
- **Database Integration**: PostgreSQL database with comprehensive data models
- **API Integration**: Full RESTful API with FastAPI backend and Next.js frontend

### 🔄 Architecture

```
Frontend (Next.js + TypeScript)
├── React Components
├── API Client Layer
├── State Management (Zustand)
└── UI Components (Radix UI + Tailwind)

Backend (FastAPI + Python)
├── REST API Endpoints
├── AI Integration (Google Gemini)
├── Database Models (SQLAlchemy)
├── PDF Processing
└── Business Logic Services

Database (PostgreSQL)
├── Projects & Scenes
├── Actors & Characters
├── Budget & Costs
├── Script Analysis
└── Resource Catalog
```

## 🛠️ Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL database (or use the provided Neon DB)

### 1. Clone & Setup
```bash
git clone <repository-url>
cd "Cinehack celluloid"

# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

### 2. Start Development Servers

**Option A: Start Both (Recommended)**
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

**Option B: Start Individually**

Backend:
```bash
cd Backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python main.py
```

Frontend:
```bash
cd Frontend
npm install
npm run dev
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📡 API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `GET /api/projects/{id}/scenes` - Get project scenes

### Script Analysis
- `POST /api/scripts/analyze` - Upload and analyze script PDF
- `GET /api/scripts/analyses` - List all analyses
- `GET /api/scripts/analyses/{id}` - Get analysis details

### Scenes
- `GET /api/scenes/projects/{project_id}/scenes` - Get project scenes
- `POST /api/scenes/projects/{project_id}/scenes` - Create scene
- `PUT /api/scenes/{id}` - Update scene
- `DELETE /api/scenes/{id}` - Delete scene

### Characters
- `GET /api/characters/projects/{project_id}/characters` - Get project characters
- `POST /api/characters/projects/{project_id}/characters` - Create character
- `PUT /api/characters/{id}` - Update character
- `DELETE /api/characters/{id}` - Delete character

### Budget
- `GET /api/budget/projects/{project_id}` - Get project budget
- `POST /api/budget/projects/{project_id}/budget-lines` - Create budget line

### Catalog
- `GET /api/catalog/actors` - List all actors
- `POST /api/catalog/actors` - Create new actor

## 🗄️ Database Schema

### Core Tables
- **projects**: Project information and metadata
- **scenes**: Scene details with JSON fields for flexible data
- **actors**: Actor catalog with contact and rate information
- **project_actors**: Character assignments linking actors to projects
- **budget_lines**: Budget breakdown by categories
- **script_analyses**: AI analysis results from uploaded scripts

## 🔧 Configuration

### Backend Configuration (.env)
```env
DATABASE_URL=postgresql://username:password@host:port/database
GEMINI_API_KEY=your_gemini_api_key
DEBUG=True
CORS_ORIGINS=http://localhost:3000
```

### Frontend Configuration
- API mode switching in `src/services/api/apiConfig.ts`
- Mock data available for development
- Real API integration ready

## 🧪 Development

### Backend Development
```bash
cd Backend
python main.py  # Starts with auto-reload
```

### Frontend Development
```bash
cd Frontend
npm run dev  # Starts with hot reload
```

### API Mode Switching
Toggle between mock and real API in `Frontend/src/services/api/apiConfig.ts`:
```typescript
const USE_REAL_API = true; // true for backend, false for mock data
```

## 📁 Project Structure

```
Cinehack celluloid/
├── Backend/
│   ├── app/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # API endpoints
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utilities (PDF parsing, etc.)
│   ├── main.py             # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── Frontend/
│   ├── src/
│   │   ├── app/            # Next.js app router
│   │   ├── components/     # React components
│   │   ├── services/       # API clients
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/           # Types and utilities
│   ├── package.json       # Node dependencies
│   └── next.config.ts     # Next.js configuration
├── setup.bat/.sh          # Setup scripts
├── start.sh               # Development server launcher
└── README.md             # This file
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use a production WSGI server (e.g., Gunicorn)
3. Configure database connection
4. Set up SSL certificates

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Configure environment variables
4. Update API endpoints for production

## 🔮 Features in Development

### High Priority
- [ ] **Schedule Management**: Timeline and shooting schedule
- [ ] **Location Management**: Location catalog and booking
- [ ] **Equipment Management**: Equipment catalog and rental tracking
- [ ] **Weather Integration**: Weather alerts for outdoor shoots
- [ ] **Real-time Collaboration**: Multi-user project collaboration
- [ ] **Mobile App**: React Native companion app

### Medium Priority
- [ ] **Cost Estimation AI**: ML-based cost prediction
- [ ] **Risk Assessment**: AI-powered risk analysis
- [ ] **Document Management**: Contract and release form management
- [ ] **Crew Management**: Crew scheduling and contact management
- [ ] **Call Sheet Generation**: Automated call sheet creation

### Low Priority
- [ ] **Analytics Dashboard**: Production analytics and insights
- [ ] **Integration APIs**: Third-party tool integrations
- [ ] **Multi-language Support**: Internationalization
- [ ] **Advanced Reporting**: Detailed production reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please create an issue in the repository or contact the development team.

---

**Built with ❤️ for the film industry**