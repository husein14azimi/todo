# Material 3 Todo App

A Todo application built with Vanilla TypeScript, Google's official `@material/web` components, and `@material/material-color-utilities` demonstrating authentic Material 3 (Material You) UI/UX.

## Features

- **Material You Dynamic Color Engine**: Generates tonal palettes in the HCT color space across primary, secondary, tertiary, and neutral surface containers from any seed color. Includes presets (Baseline Purple, Ocean Blue, Forest Teal, Sunset Terracotta, etc.) and a custom color picker.
- **Light & Dark Mode**: Seamlessly switches color roles and surface elevations between light and dark palettes.
- **Official `@material/web` Components**:
  - `md-fab` (Extended Floating Action Button)
  - `md-dialog` (Modal task creation/editing and theme customization)
  - `md-checkbox` (Task completion toggles)
  - `md-outlined-text-field` (Form inputs)
  - `md-filter-chip` (Category filtering)
  - `md-icon-button` (Actions)
  - `md-filled-button` & `md-text-button` (Dialog actions)
- **Responsive Navigation**:
  - Desktop: Navigation Rail with notification badges
  - Mobile: Bottom Navigation Bar
- **Task Management**:
  - Filter by view: All, Today, Upcoming, Done
  - Filter by category: Work, Personal, Design, Study, General
  - Real-time search by title and description
  - Priority levels (Low, Medium, High) with M3 color badges
  - Due dates with overdue detection
  - Instant Undo support via M3 Snackbar
  - Full `localStorage` persistence with initial sample tasks

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit tests
npm test

# Build for production
npm run build
```
