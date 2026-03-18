# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Android App (Capacitor)

This project includes an Android app built with [Capacitor](https://capacitorjs.com/), which wraps the web app into a native Android application.

### Prerequisites for Android Development

- **Node.js** 18+ and npm
- **Java JDK** 17+
- **Android Studio** (recommended) or Android SDK with build tools
- **Android SDK** with platform 34+ and build-tools 34+

### Getting the APK

#### Option 1: Download from GitHub Actions (Recommended)

The APK is automatically built by the CI workflow on every push to the main branch.

1. Go to the **Actions** tab in this GitHub repository
2. Click on the latest **"Build Android APK"** workflow run
3. Download the `crop-doc-debug-apk` artifact

Or check the **Releases** section for pre-built APK files.

#### Option 2: Build Locally

```sh
# Step 1: Install dependencies
npm install

# Step 2: Build web app and sync to Android (runs npm build + cap sync)
npm run cap:sync

# Step 3: Open in Android Studio
npm run cap:android
# Then in Android Studio: Build → Build Bundle(s)/APK(s) → Build APK(s)

# OR build APK from command line (requires Android SDK in ANDROID_HOME)
npm run cap:build:apk
# APK will be at: android/app/build/outputs/apk/debug/app-debug.apk
```

#### Option 3: Manual Steps

```sh
# 1. Build web assets
npm run build

# 2. Sync to Android platform
npx cap sync android

# 3. Build debug APK
cd android
./gradlew assembleDebug

# APK output: android/app/build/outputs/apk/debug/app-debug.apk
```

### Installing the APK on Your Device

1. Enable **"Install from unknown sources"** in your Android device settings:
   - Settings → Security → Unknown sources (Android 7 and below)
   - Settings → Apps → Special app access → Install unknown apps (Android 8+)
2. Transfer the APK to your device (via USB, email, or cloud storage)
3. Open the APK file on your device and tap **Install**

### Android App Features

The Android app includes all the features of the web app:

- 🌿 AI-powered plant disease diagnosis (camera + image upload)
- 📡 Works offline with local TensorFlow.js model
- 💬 Community forum
- 🤖 AI chatbot assistant
- 📋 Scan history
- 🌍 Multilingual support (7 Indian languages)
- 🎙️ Voice input/output
- 🌤️ Weather-aware recommendations

### Android Project Structure

```
android/                          # Capacitor Android project
├── app/
│   └── src/main/
│       ├── AndroidManifest.xml   # App permissions and config
│       └── assets/public/        # Bundled web assets
├── build.gradle                  # Root build config
├── variables.gradle              # SDK version config
└── gradlew                       # Gradle wrapper
capacitor.config.ts               # Capacitor configuration
```

