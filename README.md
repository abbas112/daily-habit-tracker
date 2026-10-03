# Daily Habit Tracker

An Expo / React Native app for iPhone and Android. Add and rename daily habits, check them off, archive habits, and view streaks and monthly history. Data stays on the device using AsyncStorage. No account or backend is required.

## Run in Codex cloud
Select this repository in Codex. In its terminal:
```sh
npm install
npx expo install --check
npm test
npx expo start --tunnel
```
Install Expo Go on your iPhone, and open the Expo Go link printed by Expo. If prompted to install the tunnel dependency, accept it. The development server must stay running while you use the preview. Codex environments must allow outbound network access for dependency installation and the tunnel. If your environment cannot keep the server running, use an Expo Snack or a development build service for a phone preview.

This project targets Expo SDK 54; use a compatible Expo Go version. If the current App Store Expo Go requires a newer SDK, upgrade with Expo's SDK upgrade guide before previewing.

## Cloud builds
Create/sign in to an Expo account, then run:
```sh
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform ios --profile production
```
EAS will guide you through project registration, bundle identifier, and Apple signing. TestFlight/App Store distribution requires Apple Developer membership. Builds and publishing are not performed automatically.

## Storage
Habits and completions are stored locally, not in GitHub. Clearing app data or uninstalling can remove them. Dates follow your phone's local timezone. Archived habits keep their historical completions. No notifications or cloud sync in this first version.

## Verification
`npm test` checks date, streak, and completion logic. Device preview is needed to verify native layout and persistence.
