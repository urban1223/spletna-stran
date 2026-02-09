# Contact Modal Setup - EmailJS Configuration

This document provides instructions for setting up the EmailJS service to enable email functionality in the contact modal.

## Prerequisites

1. An EmailJS account (free tier available at https://emailjs.com)
2. Access to the email account that will receive inquiries (info.nova.akademija@gmail.com)

## Setup Instructions

### 1. Create an EmailJS Account

1. Go to https://emailjs.com and sign up for a free account
2. Verify your email address

### 2. Add an Email Service

1. Navigate to "Email Services" in the EmailJS dashboard
2. Click "Add New Service"
3. Select your email provider (Gmail, Outlook, etc.)
4. Follow the instructions to connect your email account
5. Note down the **Service ID** (e.g., `service_xyz123`)

### 3. Create an Email Template

1. Navigate to "Email Templates" in the EmailJS dashboard
2. Click "Create New Template"
3. Use the following template structure:

```
Subject: Nova akademija - Poizvedba: {{course_name}}

From: {{from_name}}
Email: {{from_email}}

Sporočilo:
{{message}}

---
Tečaj: {{course_name}}
```

4. Available variables:
   - `{{from_name}}` - Sender's name
   - `{{from_email}}` - Sender's email address
   - `{{course_name}}` - Name of the course
   - `{{message}}` - Message content
   - `{{to_email}}` - Recipient email (info.nova.akademija@gmail.com)

5. Set the "To Email" field to: `info.nova.akademija@gmail.com`
6. Save the template and note down the **Template ID** (e.g., `template_xyz123`)

### 4. Get Your Public Key

1. Navigate to "Account" > "General" in the EmailJS dashboard
2. Find your **Public Key** (also called User ID)
3. Copy this key (e.g., `user_xyz123...`)

### 5. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your EmailJS credentials:
   ```env
   VITE_EMAILJS_SERVICE_ID=your_service_id_here
   VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
   VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
   ```

3. Save the file

### 6. Test the Configuration

1. Restart the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Projects page (http://localhost:8080/projekti)
3. Click on "PRIJAVA PO E-POŠTI" button
4. Fill in the form with test data
5. Submit the form
6. Check if you receive the test email at info.nova.akademija@gmail.com

## Security Features

The contact modal includes the following spam protection mechanisms:

1. **Honeypot Field**: Hidden field that catches automated bots
2. **Time-based Validation**: Prevents submissions faster than 3 seconds (catches automated scripts)
3. **Client-side Validation**: Email format and required field validation using Zod

## Troubleshooting

### Email not sending

1. Check browser console for errors
2. Verify all environment variables are set correctly
3. Ensure EmailJS service is connected and active
4. Check EmailJS dashboard for usage limits (free tier has monthly limits)

### CORS Errors

EmailJS is configured to work from any domain. If you encounter CORS errors:
1. Check that your EmailJS account is active
2. Verify the Public Key is correct

### Rate Limiting

EmailJS free tier has the following limits:
- 200 emails per month
- 1 email service
- 2 email templates

For production use with higher volume, consider upgrading to a paid plan.

## Production Deployment

When deploying to production:

1. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Do NOT commit the `.env` file to version control
3. Monitor EmailJS dashboard for usage and delivery status
4. Consider setting up email notifications for delivery failures

## Alternative Email Services

If you prefer not to use EmailJS, you can replace the email sending logic with:
- **Formspree** (https://formspree.io)
- **SendGrid** (requires backend)
- **Netlify Forms** (if hosted on Netlify)
- **Backend API endpoint** with nodemailer or similar

To replace EmailJS, modify the `onSubmit` function in `/src/components/ContactModal.tsx`.
