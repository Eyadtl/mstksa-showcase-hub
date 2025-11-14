# Requirements Document: Mst-ksa Website

## Introduction

This document defines the requirements for completing the Mst-ksa corporate website - a modern, professional, bilingual (Arabic/English) web application for a premier steel manufacturing firm. The website showcases the company's brand, capabilities, and product catalogs to clients and stakeholders. The system builds upon an existing React/TypeScript frontend foundation and requires integration with Supabase for backend services, implementation of internationalization, admin dashboard, and catalog management features.

## Glossary

- **System**: The Mst-ksa website application
- **Public User**: Any visitor accessing the website without authentication
- **Administrator**: Authenticated internal team member with access to admin dashboard
- **Catalog**: A PDF document showcasing steel products with associated metadata (title, category, thumbnail)
- **Category**: A classification group for organizing catalogs (e.g., "Structural Steel", "Fabrication")
- **Contact Submission**: A form entry from a Public User stored in the database
- **Supabase**: Backend-as-a-Service platform providing authentication, database, and storage
- **i18n**: Internationalization system supporting multiple languages
- **RTL**: Right-to-Left text direction for Arabic language support
- **PDF Viewer**: Browser-based component for displaying and interacting with PDF documents
- **Theme**: Visual appearance mode (Light or Dark)

## Requirements

### Requirement 1: Supabase Backend Integration

**User Story:** As a developer, I want to integrate Supabase services, so that the System can handle authentication, data storage, and file management.

#### Acceptance Criteria

1. WHEN the System initializes, THE System SHALL establish connection to Supabase using environment variables for project URL and anonymous key
2. THE System SHALL configure Supabase client for authentication, database operations, and storage access
3. THE System SHALL define database schema including tables for users, catalogs, categories, and contact submissions
4. THE System SHALL configure Row Level Security policies to protect admin-only data while allowing public read access to catalogs
5. THE System SHALL create storage buckets for catalog PDFs and thumbnail images with appropriate access policies

### Requirement 2: Internationalization (i18n) Implementation

**User Story:** As a Public User, I want to switch between English and Arabic languages, so that I can view content in my preferred language.

#### Acceptance Criteria

1. THE System SHALL integrate react-i18next library for managing translations
2. THE System SHALL provide language switcher component in the navigation bar with English and Arabic options
3. WHEN a Public User selects Arabic language, THE System SHALL apply RTL layout direction to all content
4. WHEN a Public User selects English language, THE System SHALL apply LTR layout direction to all content
5. THE System SHALL persist language preference in browser local storage across sessions
6. THE System SHALL translate all static UI text including navigation, buttons, labels, and messages
7. THE System SHALL load dynamic content (catalog titles, categories) in the selected language from Supabase

### Requirement 3: Authentication System

**User Story:** As an Administrator, I want to log in securely using email/password or Google OAuth, so that I can access the admin dashboard.

#### Acceptance Criteria

1. THE System SHALL provide an authentication page with tabbed interface for "Log In" and "Sign Up" forms
2. WHEN an Administrator submits login credentials, THE System SHALL authenticate via Supabase Auth with email and password
3. WHEN an Administrator clicks Google sign-in button, THE System SHALL authenticate via Supabase Auth with Google OAuth provider
4. WHEN authentication succeeds, THE System SHALL redirect the Administrator to the admin dashboard
5. WHEN authentication fails, THE System SHALL display error message indicating invalid credentials
6. THE System SHALL maintain authentication session using Supabase session management
7. THE System SHALL provide sign-out functionality that clears the session and redirects to home page

### Requirement 4: Protected Admin Routes

**User Story:** As an Administrator, I want admin pages to be accessible only when authenticated, so that unauthorized users cannot access management features.

#### Acceptance Criteria

1. THE System SHALL implement route protection for all admin dashboard paths
2. WHEN an unauthenticated user attempts to access admin routes, THE System SHALL redirect to the authentication page
3. WHEN an authenticated Administrator accesses admin routes, THE System SHALL render the requested admin page
4. THE System SHALL verify authentication status on initial page load and route changes
5. WHEN a session expires, THE System SHALL redirect the Administrator to the authentication page

### Requirement 5: Category Management

**User Story:** As an Administrator, I want to create, edit, and delete catalog categories, so that I can organize products effectively.

#### Acceptance Criteria

1. THE System SHALL provide admin interface displaying all existing categories in a table format
2. WHEN an Administrator clicks "Add Category" button, THE System SHALL display form with fields for category name in English and Arabic
3. WHEN an Administrator submits new category form, THE System SHALL save the category to Supabase database
4. WHEN an Administrator clicks edit icon on a category, THE System SHALL display form pre-filled with existing category data
5. WHEN an Administrator updates category data, THE System SHALL save changes to Supabase database
6. WHEN an Administrator clicks delete icon on a category, THE System SHALL display confirmation dialog
7. IF an Administrator confirms deletion AND the category has no associated catalogs, THEN THE System SHALL remove the category from database
8. IF a category has associated catalogs, THEN THE System SHALL prevent deletion and display warning message

### Requirement 6: Catalog Management

**User Story:** As an Administrator, I want to upload, edit, and delete catalog PDFs with metadata, so that Public Users can view our product offerings.

#### Acceptance Criteria

1. THE System SHALL provide admin interface for managing catalogs with upload, edit, and delete capabilities
2. WHEN an Administrator clicks "Upload Catalog" button, THE System SHALL display form with fields for PDF file, thumbnail image, title (English), title (Arabic), and category selection
3. WHEN an Administrator submits catalog upload form, THE System SHALL upload PDF to Supabase storage in catalogs bucket
4. WHEN PDF upload completes, THE System SHALL upload thumbnail image to Supabase storage in thumbnails bucket
5. WHEN file uploads complete, THE System SHALL save catalog metadata to Supabase database with references to uploaded files
6. THE System SHALL validate PDF file type and size (maximum 10MB) before upload
7. THE System SHALL validate thumbnail image file type (PNG, JPG, WebP) and size (maximum 2MB) before upload
8. WHEN an Administrator clicks edit icon on a catalog, THE System SHALL display form pre-filled with existing catalog data
9. WHEN an Administrator updates catalog metadata, THE System SHALL save changes to Supabase database
10. WHEN an Administrator clicks delete icon on a catalog, THE System SHALL display confirmation dialog
11. WHEN an Administrator confirms catalog deletion, THE System SHALL remove files from Supabase storage and delete database record

### Requirement 7: Public Catalog Viewing

**User Story:** As a Public User, I want to browse, search, and filter catalogs, so that I can find relevant product information.

#### Acceptance Criteria

1. THE System SHALL display all published catalogs on the catalogs page in grid layout
2. THE System SHALL show catalog thumbnail, title in selected language, and category for each catalog item
3. WHEN a Public User enters text in search field, THE System SHALL filter catalogs by title or category matching the search query
4. THE System SHALL provide category filter dropdown showing all available categories
5. WHEN a Public User selects a category filter, THE System SHALL display only catalogs belonging to that category
6. THE System SHALL combine search and category filters when both are applied
7. WHEN no catalogs match the filters, THE System SHALL display "No catalogs found" message
8. THE System SHALL load catalog data from Supabase database on page mount
9. THE System SHALL display loading state while fetching catalog data

### Requirement 8: PDF Viewer Integration

**User Story:** As a Public User, I want to view catalog PDFs with zoom, download, print, and share controls, so that I can interact with product documentation effectively.

#### Acceptance Criteria

1. WHEN a Public User clicks a catalog thumbnail, THE System SHALL open PDF viewer in modal or dedicated view
2. THE System SHALL load the selected PDF from Supabase storage URL
3. THE System SHALL display PDF content using browser native PDF rendering capabilities
4. THE System SHALL provide zoom in button that increases PDF scale by 25% increments
5. THE System SHALL provide zoom out button that decreases PDF scale by 25% increments
6. THE System SHALL provide download button that triggers PDF file download to user device
7. THE System SHALL provide print button that opens browser print dialog for the PDF
8. THE System SHALL provide share button that copies PDF public URL to clipboard
9. WHEN share button is clicked, THE System SHALL display toast notification confirming URL copied
10. THE System SHALL provide close button to exit PDF viewer and return to catalog grid

### Requirement 9: Contact Form Backend Integration

**User Story:** As a Public User, I want my contact form submissions to be saved and trigger email notifications, so that the company can respond to my inquiry.

#### Acceptance Criteria

1. WHEN a Public User submits the contact form, THE System SHALL validate all required fields (name, email, subject, message)
2. WHEN validation passes, THE System SHALL save form data to Supabase contact_submissions table
3. WHEN database save succeeds, THE System SHALL invoke Supabase Edge Function to send email notification
4. THE System SHALL send email to configured admin email address with submission details
5. THE System SHALL include submitter name, email, phone, subject, and message in email body
6. WHEN email sends successfully, THE System SHALL display success toast notification to Public User
7. WHEN any step fails, THE System SHALL display error toast notification with appropriate message
8. THE System SHALL clear form fields after successful submission
9. THE System SHALL close contact modal after successful submission

### Requirement 10: Admin Contact Submissions View

**User Story:** As an Administrator, I want to view all contact form submissions in a table, so that I can track and respond to inquiries.

#### Acceptance Criteria

1. THE System SHALL provide admin page displaying all contact submissions in tabular format
2. THE System SHALL show columns for submission date, name, email, phone, subject, and status
3. THE System SHALL sort submissions by date with most recent first
4. THE System SHALL load submissions from Supabase contact_submissions table
5. WHEN an Administrator clicks a submission row, THE System SHALL display full message content in expandable detail view
6. THE System SHALL provide search functionality to filter submissions by name, email, or subject
7. THE System SHALL display loading state while fetching submissions data
8. WHEN no submissions exist, THE System SHALL display "No submissions yet" message

### Requirement 11: Admin Dashboard Layout

**User Story:** As an Administrator, I want a dashboard with navigation to all admin features, so that I can efficiently manage website content.

#### Acceptance Criteria

1. THE System SHALL provide admin dashboard with sidebar navigation
2. THE System SHALL include navigation links for Dashboard Home, Catalogs, Categories, and Contact Submissions
3. THE System SHALL highlight active navigation item based on current route
4. THE System SHALL display Administrator email and logout button in dashboard header
5. WHEN an Administrator clicks logout button, THE System SHALL sign out and redirect to home page
6. THE System SHALL provide responsive layout that collapses sidebar on mobile devices
7. THE System SHALL display admin dashboard only to authenticated Administrators

### Requirement 12: Environment Configuration

**User Story:** As a developer, I want to configure Supabase credentials and email settings via environment variables, so that sensitive data is not hardcoded.

#### Acceptance Criteria

1. THE System SHALL read Supabase project URL from VITE_SUPABASE_URL environment variable
2. THE System SHALL read Supabase anonymous key from VITE_SUPABASE_ANON_KEY environment variable
3. THE System SHALL read admin notification email from VITE_ADMIN_EMAIL environment variable
4. THE System SHALL provide .env.example file documenting all required environment variables
5. THE System SHALL validate presence of required environment variables on application startup
6. WHEN required environment variables are missing, THE System SHALL display error message in console

### Requirement 13: Success Metrics Data Management

**User Story:** As an Administrator, I want success metrics (years in business, projects completed, clients served) to be hardcoded values, so that they display consistently on the landing page.

#### Acceptance Criteria

1. THE System SHALL define success metrics as constant values in the MetricsSection component
2. THE System SHALL display "Years in Business" metric with value 25
3. THE System SHALL display "Projects Completed" metric with value 500
4. THE System SHALL display "Clients Served" metric with value 150
5. THE System SHALL format metric numbers with appropriate separators for readability
6. THE System SHALL translate metric labels based on selected language

### Requirement 14: Google OAuth Configuration

**User Story:** As a developer, I want to configure Google OAuth in Supabase, so that Administrators can sign in with Google accounts.

#### Acceptance Criteria

1. THE System SHALL configure Google OAuth provider in Supabase authentication settings
2. THE System SHALL register OAuth redirect URLs for development and production environments
3. THE System SHALL provide Google sign-in button on authentication page
4. WHEN an Administrator clicks Google sign-in button, THE System SHALL redirect to Google OAuth consent screen
5. WHEN Google authentication succeeds, THE System SHALL create or update user record in Supabase
6. WHEN Google authentication succeeds, THE System SHALL redirect Administrator to admin dashboard
7. THE System SHALL handle OAuth errors and display appropriate error messages
