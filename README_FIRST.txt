SEEKHO DIGITAL INDIA ACADEMY — REACT NATIVE STUDENT APP

Framework
- React Native 0.87.0
- TypeScript
- React Navigation
- Android + iOS project included

App identity
- User-facing name: Seekho Digital India Academy
- Android and iOS display names updated
- Custom academy-style launcher icon included
- Brand palette: academy orange + deep navy + clean neutral surfaces

Demo authentication
- Enter any 10-digit Indian mobile number
- OTP: 123456
- Authentication is intentionally demo-only

Ready app sections
- Professional splash, login and OTP flow
- Home learning dashboard
- Course catalog, search and filters
- Course details, syllabus, tools and career outcomes
- Free demo / counseling request form
- My Learning dashboard
- Course modules and lesson navigation
- Lesson player UI, resources and notes
- Working practice quiz and results
- Assignments and local demo submission workflow
- Live classes
- Certificates and share action
- Placement & Career Hub
- Job search, job details and local demo applications
- Application tracking
- Career tools: resume, mock interview, portfolio and counseling readiness
- Career roadmap
- Notifications and read state
- Student profile and edit profile
- Help & support with phone, WhatsApp, email and website links
- About academy
- Privacy Policy and Terms draft screens

Academy content
The public academy information, featured programs, academy stats, placement support and contact information are aligned with seekhodigitalindia.com as reviewed during this build.

Important backend note
This package is a complete professional mobile frontend. Because no production backend/API credentials were supplied, student-specific live data such as real enrollments, actual lesson video URLs, uploaded assignment files, real job applications, push notifications and server persistence currently use local/demo workflow state. These screens are already structured for later API integration without redesigning the app.

Run on Windows PowerShell
1. Open this folder in VS Code.
2. Install dependencies:
   npm.cmd install
3. Connect an Android phone with USB debugging enabled or start an emulator.
4. Run:
   npx.cmd react-native run-android

If Metro is already running on another terminal, keep it open. If required:
   npx.cmd react-native start --reset-cache

Build release APK later
   cd android
   .\gradlew.bat assembleRelease

Before public production release
- Connect real authentication/API/backend
- Replace draft Privacy Policy / Terms with academy-approved legal copy
- Add production signing key
- Configure Firebase push notifications if required
- Configure real course videos/files/storage
- Perform device testing and Play Store/App Store release checks
