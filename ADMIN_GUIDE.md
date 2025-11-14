# Admin User Guide

Complete guide for administrators managing the MST-KSA website content.

## Table of Contents

- [Getting Started](#getting-started)
- [Accessing the Admin Dashboard](#accessing-the-admin-dashboard)
- [Dashboard Overview](#dashboard-overview)
- [Managing Categories](#managing-categories)
- [Managing Catalogs](#managing-catalogs)
- [Viewing Contact Submissions](#viewing-contact-submissions)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Getting Started

### What You Need

- Admin account credentials (email and password)
- Or Google account configured for admin access
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Internet connection

### First Time Setup

If this is your first time accessing the admin dashboard:

1. **Get your admin credentials** from the system administrator
2. **Navigate to the website** in your browser
3. **Click "Admin Dashboard"** in the navigation menu (or go to `/auth`)
4. **Sign in** with your credentials
5. **Familiarize yourself** with the dashboard layout

## Accessing the Admin Dashboard

### Sign In with Email and Password

1. Navigate to the website
2. Click **"Admin Dashboard"** in the navigation menu
3. You'll be redirected to the authentication page
4. Click the **"Log In"** tab if not already selected
5. Enter your **email address**
6. Enter your **password**
7. Click **"Sign In"**
8. You'll be redirected to the admin dashboard

### Sign In with Google

1. Navigate to the authentication page
2. Click **"Sign in with Google"** button
3. Select your Google account
4. Grant permissions if prompted
5. You'll be redirected to the admin dashboard

### Troubleshooting Sign In

**"Invalid email or password"**
- Check that you're entering the correct credentials
- Ensure Caps Lock is off
- Try resetting your password (contact system administrator)

**"Access denied"**
- Your account may not have admin privileges
- Contact the system administrator to verify your account status

**Google sign-in not working**
- Ensure pop-ups are not blocked in your browser
- Try clearing browser cache and cookies
- Use email/password sign-in as alternative

## Dashboard Overview

After signing in, you'll see the admin dashboard with:

### Navigation Sidebar

Located on the left side (or top on mobile):

- **Dashboard**: Overview and statistics
- **Catalogs**: Manage product catalogs
- **Categories**: Manage catalog categories
- **Contact Submissions**: View customer inquiries

### Header

Located at the top:

- **Your email address**: Shows you're logged in
- **Logout button**: Sign out of the dashboard
- **Language switcher**: Change between English and Arabic
- **Theme toggle**: Switch between light and dark mode

### Main Content Area

Displays the current page content based on your selection.

## Managing Categories

Categories help organize your catalogs (e.g., "Structural Steel", "Fabrication", "Custom Solutions").

### Viewing Categories

1. Click **"Categories"** in the sidebar
2. You'll see a table with all categories:
   - **Name (English)**: Category name in English
   - **Name (Arabic)**: Category name in Arabic
   - **Slug**: URL-friendly identifier
   - **Created**: When the category was created
   - **Actions**: Edit and delete buttons

### Adding a New Category

1. Click **"Categories"** in the sidebar
2. Click the **"Add Category"** button (top right)
3. A dialog will open with a form
4. Fill in the fields:
   - **Name (English)**: Enter category name in English
     - Example: "Structural Steel"
   - **Name (Arabic)**: Enter category name in Arabic
     - Example: "الفولاذ الإنشائي"
   - **Slug**: Auto-generated from English name
     - You can edit this if needed
     - Must be unique and URL-friendly (lowercase, hyphens only)
5. Click **"Save"**
6. The category will appear in the table

**Tips:**
- Use clear, descriptive names
- Keep names concise (2-3 words ideal)
- Ensure Arabic translation is accurate
- Slug should be lowercase with hyphens (e.g., "structural-steel")

### Editing a Category

1. Find the category in the table
2. Click the **pencil icon** (Edit) in the Actions column
3. The edit dialog will open with current values
4. Update the fields as needed
5. Click **"Save"**
6. Changes will be reflected immediately

**What you can edit:**
- Name in English
- Name in Arabic
- Slug (be careful - this changes the URL)

### Deleting a Category

1. Find the category in the table
2. Click the **trash icon** (Delete) in the Actions column
3. A confirmation dialog will appear
4. Click **"Confirm"** to delete

**⚠️ Important:**
- You **cannot delete** a category that has catalogs assigned to it
- First reassign or delete all catalogs in that category
- Deletion is permanent and cannot be undone

### Category Best Practices

**Do:**
- Create 5-10 main categories (not too many)
- Use clear, industry-standard terminology
- Keep names consistent across languages
- Review categories periodically

**Don't:**
- Create duplicate or similar categories
- Use overly technical jargon
- Create categories for single products
- Delete categories without checking for catalogs

## Managing Catalogs

Catalogs are PDF documents showcasing your products, with thumbnails and metadata.

### Viewing Catalogs

1. Click **"Catalogs"** in the sidebar
2. You'll see a table with all catalogs:
   - **Thumbnail**: Preview image
   - **Title (English)**: Catalog title in English
   - **Title (Arabic)**: Catalog title in Arabic
   - **Category**: Assigned category
   - **File Size**: PDF file size
   - **Created**: Upload date
   - **Actions**: Edit and delete buttons

### Searching and Filtering

**Search by title:**
1. Use the search box at the top
2. Type catalog title (English or Arabic)
3. Results filter automatically as you type

**Filter by category:**
1. Use the category dropdown
2. Select a category
3. Only catalogs in that category will show

**Combine filters:**
- Use both search and category filter together
- Clear filters by clearing search or selecting "All Categories"

### Uploading a New Catalog

1. Click **"Catalogs"** in the sidebar
2. Click the **"Upload Catalog"** button (top right)
3. A dialog will open with an upload form
4. Fill in the form:

   **Step 1: Basic Information**
   - **Title (English)**: Enter catalog title in English
     - Example: "Steel Beams Catalog 2024"
   - **Title (Arabic)**: Enter catalog title in Arabic
     - Example: "كتالوج العوارض الفولاذية 2024"
   - **Category**: Select from dropdown
     - Choose the most appropriate category

   **Step 2: Upload Files**
   - **PDF File**: Click to browse or drag and drop
     - Must be a PDF file
     - Maximum size: 10MB
     - Recommended: Compress large PDFs before uploading
   - **Thumbnail Image**: Click to browse or drag and drop
     - Accepted formats: PNG, JPG, JPEG, WebP
     - Maximum size: 2MB
     - Recommended size: 400x300 pixels
     - Use high-quality images

5. Click **"Upload"**
6. Wait for upload to complete (progress bar will show)
7. Catalog will appear in the table

**File Requirements:**

| File Type | Max Size | Formats | Notes |
|-----------|----------|---------|-------|
| PDF | 10MB | .pdf | Compress if larger |
| Thumbnail | 2MB | .png, .jpg, .jpeg, .webp | 400x300px recommended |

**Tips:**
- Use descriptive titles that help users find catalogs
- Include year in title if catalog is time-sensitive
- Compress PDFs to reduce file size (use online tools)
- Use clear, high-quality thumbnail images
- Ensure thumbnail represents the catalog content

### Editing a Catalog

1. Find the catalog in the table
2. Click the **pencil icon** (Edit) in the Actions column
3. The edit dialog will open with current values
4. Update the fields:
   - **Title (English)**: Update if needed
   - **Title (Arabic)**: Update if needed
   - **Category**: Change category if needed
   - **PDF File**: Upload new PDF (optional)
   - **Thumbnail**: Upload new thumbnail (optional)
5. Click **"Save"**
6. Changes will be reflected immediately

**What you can edit:**
- Titles in both languages
- Category assignment
- PDF file (replaces old file)
- Thumbnail image (replaces old image)

**Note:** If you upload a new PDF or thumbnail, the old file will be permanently deleted.

### Deleting a Catalog

1. Find the catalog in the table
2. Click the **trash icon** (Delete) in the Actions column
3. A confirmation dialog will appear
4. Click **"Confirm"** to delete

**⚠️ Important:**
- Deletion is permanent and cannot be undone
- Both the PDF and thumbnail will be deleted from storage
- The catalog will be removed from the public website immediately
- Users will no longer be able to view or download the PDF

### Catalog Best Practices

**Organizing Catalogs:**
- Use clear, descriptive titles
- Assign to appropriate categories
- Include year or version in title if applicable
- Keep catalog count manageable (remove outdated ones)

**File Optimization:**
- Compress PDFs before uploading (use tools like Adobe Acrobat, Smallpdf)
- Optimize images for web (use tools like TinyPNG, Squoosh)
- Test PDF readability before uploading
- Ensure PDF is not password-protected

**Thumbnail Guidelines:**
- Use the first page of the PDF as thumbnail
- Ensure text is readable in thumbnail
- Use consistent thumbnail style across catalogs
- Avoid cluttered or busy images

**Naming Conventions:**
- Be consistent with naming format
- Include product type and year
- Use title case for English
- Ensure Arabic translation is accurate

**Examples:**
- ✅ Good: "Steel Beams Catalog 2024"
- ✅ Good: "Custom Fabrication Services"
- ❌ Bad: "catalog1.pdf"
- ❌ Bad: "new file"

## Viewing Contact Submissions

View and manage inquiries submitted through the contact form.

### Accessing Submissions

1. Click **"Contact Submissions"** in the sidebar
2. You'll see a table with all submissions:
   - **Date**: When submitted
   - **Name**: Submitter's name
   - **Email**: Submitter's email
   - **Phone**: Submitter's phone (if provided)
   - **Subject**: Message subject
   - **Status**: new, read, or responded
   - **Actions**: View and mark as read

### Viewing Submission Details

1. Find the submission in the table
2. Click on the row to expand
3. Full message content will be displayed
4. You'll see:
   - Complete message text
   - All contact information
   - Submission timestamp

### Marking as Read

1. Find the submission
2. Click the **"Mark as Read"** button
3. Status will change from "new" to "read"
4. This helps track which submissions you've reviewed

### Searching Submissions

1. Use the search box at the top
2. Search by:
   - Name
   - Email address
   - Subject line
3. Results filter automatically

### Responding to Submissions

**The system does not send automatic responses.** You must respond manually:

1. View the submission details
2. Note the submitter's email address
3. Open your email client
4. Compose a response
5. Send the email
6. Mark the submission as "read" or "responded" in the dashboard

**Response Best Practices:**
- Respond within 24-48 hours
- Be professional and courteous
- Address all questions in the message
- Include your contact information
- Follow up if needed

### Submission Management

**Daily Tasks:**
- Check for new submissions
- Respond to urgent inquiries
- Mark submissions as read

**Weekly Tasks:**
- Review all unread submissions
- Follow up on pending inquiries
- Archive or delete old submissions (if needed)

## Best Practices

### General Guidelines

**Security:**
- Never share your admin credentials
- Log out when finished
- Use a strong, unique password
- Enable two-factor authentication if available

**Content Management:**
- Review content before publishing
- Keep information up-to-date
- Remove outdated catalogs regularly
- Maintain consistent naming conventions

**Organization:**
- Create logical category structure
- Use descriptive titles and names
- Keep catalog count manageable
- Regular maintenance and cleanup

### Workflow Recommendations

**Daily:**
- Check contact submissions
- Respond to urgent inquiries

**Weekly:**
- Review and update catalogs
- Check for outdated content
- Respond to all pending inquiries

**Monthly:**
- Review category structure
- Archive old catalogs
- Update catalog information
- Performance review

**Quarterly:**
- Major content review
- Category reorganization if needed
- User feedback review
- System updates

## Troubleshooting

### Common Issues

**"Upload failed"**
- Check file size (PDF max 10MB, image max 2MB)
- Ensure correct file format
- Check internet connection
- Try compressing the file
- Try a different browser

**"Cannot delete category"**
- Category has catalogs assigned to it
- Reassign or delete catalogs first
- Then try deleting category again

**"Session expired"**
- You've been logged out due to inactivity
- Sign in again to continue
- Your work may not be saved

**"Changes not saving"**
- Check internet connection
- Ensure all required fields are filled
- Try refreshing the page
- Clear browser cache

**"PDF not displaying"**
- Check PDF is not corrupted
- Ensure PDF is not password-protected
- Try re-uploading the PDF
- Test PDF in another viewer first

### Getting Help

If you encounter issues:

1. **Check this guide** for solutions
2. **Try a different browser** (Chrome, Firefox, Safari, Edge)
3. **Clear browser cache and cookies**
4. **Contact technical support** at admin@mst-ksa.com
5. **Provide details**: What you were doing, error messages, screenshots

## FAQ

### General Questions

**Q: How do I change my password?**
A: Contact the system administrator to reset your password.

**Q: Can I have multiple admin accounts?**
A: Yes, the system administrator can create multiple admin accounts.

**Q: Is there a mobile app?**
A: No, but the admin dashboard is mobile-responsive and works in mobile browsers.

**Q: Can I undo a deletion?**
A: No, deletions are permanent. Always confirm before deleting.

### Category Questions

**Q: How many categories should I create?**
A: 5-10 categories is ideal. Too many categories can confuse users.

**Q: Can I rename a category?**
A: Yes, edit the category and update the name. The slug can also be changed.

**Q: What happens if I delete a category with catalogs?**
A: You cannot delete a category that has catalogs. Reassign or delete catalogs first.

### Catalog Questions

**Q: What's the maximum PDF size?**
A: 10MB. Compress larger PDFs before uploading.

**Q: Can I upload multiple catalogs at once?**
A: No, catalogs must be uploaded one at a time.

**Q: How do I compress a PDF?**
A: Use online tools like Smallpdf, Adobe Acrobat, or PDF Compressor.

**Q: What image format is best for thumbnails?**
A: WebP or PNG for best quality. JPEG is also acceptable.

**Q: Can users download the PDFs?**
A: Yes, users can view, download, and print PDFs from the public website.

### Contact Submission Questions

**Q: Do submissions get emailed to me?**
A: Currently, no. Check the dashboard regularly for new submissions.

**Q: Can I export submissions?**
A: Not currently. You can copy information manually if needed.

**Q: How long are submissions stored?**
A: Indefinitely, unless manually deleted by an administrator.

**Q: Can I reply directly from the dashboard?**
A: No, you must respond via email using the submitter's email address.

### Technical Questions

**Q: Which browsers are supported?**
A: Chrome, Firefox, Safari, and Edge (latest versions).

**Q: Do I need to install anything?**
A: No, the admin dashboard works entirely in your web browser.

**Q: Is my data backed up?**
A: Yes, Supabase automatically backs up the database daily.

**Q: Can I access the dashboard from anywhere?**
A: Yes, as long as you have internet access and your login credentials.

---

## Quick Reference

### Keyboard Shortcuts

- **Escape**: Close dialog/modal
- **Tab**: Navigate between form fields
- **Enter**: Submit form (when in input field)

### File Size Limits

- PDF: 10MB maximum
- Thumbnail: 2MB maximum

### Supported File Formats

- PDF: .pdf
- Images: .png, .jpg, .jpeg, .webp

### Contact Information

- **Technical Support**: admin@mst-ksa.com
- **Documentation**: See README.md and other guides

---

**Last Updated**: November 2024

For the latest version of this guide, check the project repository.
