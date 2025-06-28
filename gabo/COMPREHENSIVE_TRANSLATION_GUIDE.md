# Comprehensive Translation System Guide

## Overview
This document describes the complete translation system implemented for the Academy Sim Racing website, providing Bulgarian (default) to English translation capabilities without external dependencies.

## System Architecture

### Core Components

1. **Language Store** (`src/stores/language.js`)
   - Pinia store managing translation state
   - Contains all translations for both languages
   - Provides `t(key)` method for translations
   - Handles localStorage persistence
   - Default language: Bulgarian (bg)

2. **Navigation Toggle** (`src/components/Navigation.vue`)
   - Globe icon with BG/EN text toggle
   - Mobile-responsive design
   - Updates all components reactively

## Translation Coverage

### ✅ Fully Translated Pages

1. **Home Page** (`src/views/Home.vue`)
   - Hero section (title, subtitle, description, buttons)
   - Statistics section (users, hours, tournaments)
   - Features section (4 main features)
   - Pricing plans (3 tiers with features)
   - Recent activity with dynamic time formatting

2. **Login Page** (`src/views/Login.vue`)
   - Form labels and placeholders
   - Status messages and notifications
   - Social login options
   - Registration links

3. **Academy Page** (`src/views/Academy.vue`)
   - Course catalog interface
   - Loading states and error messages
   - Purchase confirmation modal
   - Category filters

4. **Tournaments Page** (`src/views/Tournaments.vue`)
   - Tournament cards and status badges
   - Registration interface
   - Tournament categories (active, upcoming, completed)
   - Progress indicators

5. **Navigation Component** (`src/components/Navigation.vue`)
   - Main menu items
   - User dropdown menu
   - Mobile menu
   - Language toggle button

6. **Profile Page** (`src/views/Profile.vue`)
   - User information and tier badges
   - Progress tracking and XP system
   - Recent sessions display
   - Achievements grid
   - Quick statistics

7. **Booking Page** (`src/views/Booking.vue`)
   - Personal information form
   - Date and time selection
   - Booking type options
   - Simulator selection
   - Status indicators (available/unavailable)

### 🔄 Basic Translation Setup (Ready for Content)

8. **Shop Page** (`src/views/Shop.vue`)
   - Store interface structure
   - Language store integrated

9. **Leaderboard Page** (`src/views/Leaderboard.vue`)
   - Rankings interface structure
   - Language store integrated

10. **News Page** (`src/views/News.vue`)
    - News feed structure
    - Language store integrated

## Translation Categories

### Navigation & UI
- `home`, `tournaments`, `academy`, `leaderboard`, `shop`, `booking`, `news`
- `profile`, `adminPanel`, `logout`, `language`

### Content Sections
- `heroTitle`, `heroSubtitle`, `heroDescription`
- `getStarted`, `learnMore`
- `registeredUsers`, `hoursPlayed`, `activeTournaments`

### Features & Pricing
- Professional simulators, expert training, tournaments, progress tracking
- TESTER, ROOKIE, RACER plans with all features

### User Interface
- Form elements, buttons, status messages
- Loading states, error handling, success notifications
- Time formatting (`ago`, `minutes`, `hours`, `days`)

### Page-Specific Content
- Login: authentication flow, social login, form validation
- Academy: course management, purchase flow, categories
- Tournaments: registration, status tracking, prize information

## Technical Implementation

### Usage Pattern
```javascript
// Import in component
import { useLanguageStore } from '../stores/language'

// In setup()
const languageStore = useLanguageStore()

// In template
{{ languageStore.t('translationKey') }}

// In return statement
return {
  languageStore,
  // ... other properties
}
```

### Dynamic Content
- Token amounts: `{{ languageStore.t('buyFor') + ' ' + price + ' ' + languageStore.t('tokens') }}`
- Time formatting: Based on current language setting
- Conditional text: Ternary operators with translations

### State Management
- Automatic localStorage persistence
- Reactive updates across all components
- No external i18n dependencies
- Fallback to translation key if missing

## File Structure
```
src/
├── stores/
│   └── language.js          # Main translation store
├── components/
│   └── Navigation.vue       # Language toggle + navigation
├── views/
│   ├── Home.vue            # ✅ Complete translation
│   ├── Login.vue           # ✅ Complete translation
│   ├── Academy.vue         # ✅ Complete translation
│   ├── Tournaments.vue     # ✅ Complete translation
│   ├── Shop.vue            # 🔄 Structure ready
│   ├── Leaderboard.vue     # 🔄 Structure ready
│   └── News.vue            # 🔄 Structure ready
└── App.vue                 # Language store initialization
```

## Testing & Verification

### Manual Testing Checklist
1. Toggle language button in navigation (both desktop and mobile)
2. Navigate through all pages to verify translations
3. Check form inputs and placeholders
4. Verify error messages and loading states
5. Test purchase flows and confirmations
6. Validate time formatting in different languages

### Browser Testing
- Language preference persists across sessions
- All reactive updates work correctly
- Mobile responsive design functions properly
- No console errors related to missing translations

## Adding New Translations

### 1. Add to Language Store
```javascript
// In src/stores/language.js
bg: {
  newTranslationKey: 'Български текст'
},
en: {
  newTranslationKey: 'English text'
}
```

### 2. Use in Component
```vue
<template>
  <div>{{ languageStore.t('newTranslationKey') }}</div>
</template>
```

### 3. Ensure Language Store Access
```javascript
// In component setup()
const languageStore = useLanguageStore()

// In return statement
return {
  languageStore,
  // ... other properties
}
```

## Best Practices

### Translation Keys
- Use descriptive, hierarchical names
- Group by functionality/page
- Avoid generic names like 'text1', 'button2'

### Content Organization
- Group related translations together
- Add comments for context
- Maintain alphabetical organization within groups

### Component Integration
- Always add languageStore to return statement
- Use consistent import pattern
- Handle dynamic content appropriately

## Maintenance Notes

### Regular Tasks
- Review and update translations for new features
- Verify translation completeness for new pages
- Test language toggle functionality after updates

### Performance Considerations
- Translations loaded once on app initialization
- Minimal overhead with Pinia reactivity
- No network requests for language switching

## Troubleshooting

### Common Issues
1. **Missing Translation**: Returns translation key - add to language store
2. **Not Updating**: Check if languageStore in return statement
3. **Console Errors**: Verify import paths and store initialization

### Debug Steps
1. Check browser localStorage for 'language' key
2. Verify language store state in Vue DevTools
3. Confirm component has access to languageStore
4. Test translation key exists in both languages

## Future Enhancements

### Potential Additions
- Date/number formatting per locale
- Pluralization rules
- Additional languages (Romanian, Serbian)
- Admin interface for translation management
- Translation validation tools

### Integration Options
- Content management system integration
- Translation service APIs for automated updates
- User-contributed translations interface

## Summary

The translation system provides complete Bulgarian/English support for the Academy Sim Racing website with:
- ✅ 5 fully translated pages (Home, Login, Academy, Tournaments, Navigation)
- ✅ 3 structurally prepared pages (Shop, Leaderboard, News)
- ✅ Persistent language preferences
- ✅ Mobile-responsive toggle interface
- ✅ No external dependencies
- ✅ Easy extensibility for new translations

The system is production-ready and provides a solid foundation for internationalization without the complexity of full i18n libraries. 