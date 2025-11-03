# Google Search Console Verification - Step by Step Guide

## How to Get Your Verification Code

1. **Go to Google Search Console**: https://search.google.com/search-console

2. **Select Your Property**:
   - If you have a domain property (like `taypro.in`), select that
   - Or select a URL prefix property (like `https://taypro.in`)

3. **Go to Settings**:
   - Click on the gear icon (⚙️) in the left sidebar
   - Or click on "Settings" at the bottom of the left navigation

4. **Access Ownership Verification**:
   - Click on "Ownership verification"
   - You'll see different verification methods

5. **Choose HTML Tag Method**:
   - Look for the "HTML tag" verification method
   - Click on it
   - You'll see something like:
     ```html
     <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
     ```
   - **Copy the content value** (the part after `content="` and before `"`)
   - This is your verification code

## Alternative: If Already Verified

If your domain is already verified, you can:
1. Go to Settings → Ownership verification
2. You might see "Verified" status
3. Click on "View" to see the verification methods used
4. Find the HTML tag method and copy the verification code

## Add Verification Code to Website

Once you have the verification code, I'll add it to your `layout.tsx` file in the metadata verification section.

The verification code format will be something like:
- `abc123xyz789...` (usually a long alphanumeric string)

## Need Help?

If you can't find it, you can also verify using:
- **DNS verification** (if you have domain access)
- **HTML file upload** (upload a file to your server)

But the HTML tag method (meta tag) is the easiest for Next.js applications.


