# 🍽️ Fridge-Mate

**Match with people based on what's in your fridge.**

Take a photo of your leftovers, and the app pairs you with someone whose fridge completes your meal.

_You: cold pasta. Them: half a pizza. Together: relationship material._

## ✨ Features

### 🔐 User Authentication

- **Sign Up**: Username, email, phone number, password
- **Sign In**: Email/username and password
- **Profile Setup**: Complete onboarding with food preferences and matching goals

### 👤 Profile Management

- **Personal Info**: Name, nickname, age, gender, bio
- **Food Preferences**: Vegetarian, Vegan, Halal, Kosher, Gluten-Free, etc.
- **Leftover Vibe**: "Always have pizza", "Meal prep enthusiast", "Serial bruncher"
- **Match Goals**: "Looking to share leftovers", "Cooking collab", "Sustainable food buddy", "Date night material"

### 🎯 Matching System

- **AI Food Recognition**: Upload photos of your leftovers
- **Smart Matching**: Find people whose food complements yours
- **Compatibility Scoring**: See how well you match with potential partners
- **Profile Browsing**: Explore potential matches with detailed profiles

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Firebase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd fridge-mate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase**

   - Follow the [Firebase Setup Guide](./FIREBASE_SETUP.md)
   - Update `lib/firebase.ts` with your Firebase configuration

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Run on your device**
   - Install Expo Go app on your phone
   - Scan the QR code from the terminal
   - Or run on simulator: `npm run ios` or `npm run android`

## 🏗️ Project Structure

```
fridge-mate/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Main app tabs
│   │   ├── index.tsx      # Home screen
│   │   └── explore.tsx    # Matches/Explore screen
│   ├── auth/              # Authentication screens
│   │   ├── login.tsx     # Sign in
│   │   ├── signup.tsx    # Sign up
│   │   └── profile-setup.tsx # Profile configuration
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── AuthGuard.tsx     # Authentication wrapper
│   └── ui/               # UI components
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utilities and configurations
│   └── firebase.ts       # Firebase configuration
└── constants/            # App constants
```

## 🔧 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **State Management**: React Context
- **UI**: Custom components with theming
- **Language**: TypeScript

## 🎨 Design System

### Colors

- **Primary**: #FF6B6B (Coral Red)
- **Secondary**: #4ECDC4 (Teal)
- **Background**: #FFFFFF (White)
- **Text**: #333333 (Dark Gray)

### Typography

- **Headers**: Bold, 24-32px
- **Body**: Regular, 16px
- **Captions**: Regular, 14px

### Components

- **Buttons**: Rounded corners (12px), primary color
- **Cards**: Subtle shadows, rounded corners
- **Inputs**: Clean borders, focus states

## 🔐 Authentication Flow

1. **Welcome Screen** → Sign Up or Sign In
2. **Sign Up** → Basic info (username, email, password)
3. **Profile Setup** → Detailed preferences and goals
4. **Main App** → Home and Explore tabs

## 📱 Screens Overview

### Authentication Screens

- **Login**: Email/username and password
- **Signup**: Registration form with validation
- **Profile Setup**: Multi-step onboarding with preferences

### Main App Screens

- **Home**: Welcome dashboard with user info
- **Explore**: Potential matches and discovery

## 🚧 Roadmap

### Phase 1: Core Features ✅

- [x] User authentication
- [x] Profile setup
- [x] Basic UI/UX

### Phase 2: Matching System 🚧

- [ ] Photo upload functionality
- [ ] AI food recognition
- [ ] Matching algorithm
- [ ] Real-time chat

### Phase 3: Advanced Features 📋

- [ ] Push notifications
- [ ] Location-based matching
- [ ] Recipe suggestions
- [ ] Social features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- Firebase for backend services
- React Native community for components and inspiration

## 📞 Support

If you have any questions or need help:

1. Check the [Firebase Setup Guide](./FIREBASE_SETUP.md)
2. Review the [Expo Documentation](https://docs.expo.dev/)
3. Open an issue on GitHub

---

**Happy matching! 🍽️💕**
