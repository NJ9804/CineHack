# Celluloid - AI-Powered Film Production Management System

A modern, cinematic frontend for managing film production workflows, built with Next.js and designed for integration with FastAPI backends.

## 🎬 Features

### Production Dashboard
- **Global Cost Management**: Standardized rates for actors, actresses, and properties
- **Project Overview**: Real-time budget tracking, scene progress, and alert monitoring
- **Cinematic UI**: Dark theme with gold accents for a professional film industry feel

### Project Management
- **New Project Creation**: Script upload/input with simulated AI processing
- **Individual Project Dashboards**: Comprehensive view of characters, scenes, schedule, and budget
- **Character Mapping**: Link characters to actors with availability tracking
- **Scene Management**: Detailed scene cards with location, budget, and alert information

### Smart Features
- **Budget Visualization**: Real-time spending vs. allocation tracking
- **Risk Alerts**: Weather, equipment, scheduling, and budget warnings
- **Mock API Layer**: Fully functional interface ready for FastAPI integration

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom cinematic theme
- **UI Components**: Custom components built on Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React hooks (ready for Zustand/TanStack Query)
- **Build Tool**: Turbopack for fast development

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd cine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── global-costs/      # Global cost management
│   ├── projects/          # Project listing and management
│   │   ├── [id]/         # Individual project dashboard
│   │   └── new/          # New project creation
│   ├── globals.css       # Global styles and theme
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Dashboard home
├── components/
│   ├── layout/           # Layout components (Sidebar, Header)
│   └── ui/               # Reusable UI components
├── lib/
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Utility functions
└── services/
    ├── api/              # API service layer (ready for FastAPI)
    └── mock/             # Mock data for development
```

## 🎨 Design System

### Color Palette
- **Background**: Deep blue gradients (#0f0f23 → #1a1a2e → #16213e)
- **Accent**: Amber/Gold (#fbbf24, #f59e0b)
- **Text**: White/Gray scale for contrast
- **Status Colors**: Green (success), Blue (info), Yellow (warning), Red (error)

### Key Features
- Responsive design for desktop and mobile
- Dark mode optimized
- Smooth animations and transitions
- Accessible components
- Professional film industry aesthetic

## 🔌 FastAPI Integration Ready

The project is structured for easy backend integration:

### API Service Layer
- **Location**: `src/services/api/index.ts`
- **Mock Data**: `src/services/mock/data.ts`
- **Ready Endpoints**:
  - Global costs management
  - Project CRUD operations
  - Character and scene management
  - Budget and schedule tracking
  - Alert system

### Integration Steps
1. Replace mock functions in `src/services/api/` with actual API calls
2. Update base URL and authentication
3. Add error handling and loading states
4. Implement real-time updates

## 📊 Data Models

### Core Entities
- **Projects**: Title, year, budget, status, script
- **Characters**: Name, actor mapping, scenes
- **Scenes**: Number, location, characters, budget, equipment, alerts
- **Global Costs**: Standardized rates for actors/properties
- **Alerts**: Risk monitoring for weather, equipment, budget, scheduling

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Vercel Deployment
The project is ready for deployment on Vercel:
1. Push to GitHub
2. Import to Vercel
3. Deploy automatically

### Docker (Optional)
```dockerfile
# Add Dockerfile for containerized deployment
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Development

### Adding New Features
1. **New Pages**: Add to `src/app/` following App Router conventions
2. **Components**: Create in `src/components/` with TypeScript
3. **API Endpoints**: Update `src/services/api/` and mock data
4. **Styles**: Use Tailwind classes or extend in `globals.css`

### Code Style
- TypeScript strict mode
- ESLint configuration included
- Consistent file naming (PascalCase for components)
- Tailwind for styling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Complete scene management with Kanban board
- [ ] Implement budget charts and analytics
- [ ] Add risk assessment algorithms
- [ ] Real-time collaboration features
- [ ] Mobile app companion
- [ ] Advanced scheduling optimization
- [ ] Integration with external film industry APIs

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in `/docs`
- Review the API service layer for integration guidance

---

**Celluloid** - Bringing AI-powered efficiency to film production management 🎬
