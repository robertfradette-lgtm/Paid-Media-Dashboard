# Google Ads API setup (step-by-step)

Follow these to link live Google Ads data to your paid media dashboard.

---

## 1. Google Cloud project and OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a project (e.g. **Bob Evans Paid Media**).
3. **Enable the Google Ads API**
   - APIs & Services → **Library** → search **Google Ads API** → **Enable**.
4. **Create OAuth credentials**
   - APIs & Services → **Credentials** → **Create credentials** → **OAuth client ID**.
   - If asked, configure the OAuth consent screen (External, add your email as test user).
   - Application type: **Desktop app** (or **Web application** if you’ll host the dashboard).
   - Copy the **Client ID** and **Client Secret** → you’ll put these in `.env`.

---

## 2. Google Ads developer token

1. Log in to [Google Ads](https://ads.google.com).
2. **Tools & settings** (wrench) → **Setup** → **API Center**.
3. Apply for a **developer token**.
   - **Test account**: use your own account for development (no approval wait).
   - **Production**: submit the form; approval can take a few days.
4. Copy the **developer token** → `GOOGLE_ADS_DEVELOPER_TOKEN` in `.env`.

---

## 3. Refresh token (one-time)

The backend needs a **refresh token** so it can get access tokens without a browser.

**Option A – Use a small script (recommended)**

1. Install the Google Auth tool or use a script that:
   - Opens a browser so a user logs in with the **Google account that has access to the Google Ads account**.
   - Exchanges the auth code for **refresh_token** and optionally **access_token**.
2. You can use [Google’s OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) or a Node script with `google-auth-library`:
   - Scope: `https://www.googleapis.com/auth/adwords`
   - After signing in, copy the **refresh_token** → `GOOGLE_ADS_REFRESH_TOKEN` in `.env`.

**Option B – OAuth Playground**

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2. Click the gear (⚙), check **Use your own OAuth credentials**, enter your Client ID and Client Secret.
3. In **Step 1**, find and select **Google Ads API** (or add scope `https://www.googleapis.com/auth/adwords`).
4. Click **Authorize APIs** and sign in with the Google account that has access to the Google Ads account.
5. In **Step 2**, click **Exchange authorization code for tokens**.
6. Copy the **Refresh token** → `GOOGLE_ADS_REFRESH_TOKEN` in `.env`.

---

## 4. Customer IDs

- **GOOGLE_ADS_CUSTOMER_ID**: The Google Ads account you want to pull data from.  
  - Find it in Google Ads (top right or in **Tools → Setup → Account settings**).  
  - Use with or without dashes (e.g. `123-456-7890` or `1234567890`).
- **GOOGLE_ADS_LOGIN_CUSTOMER_ID**: Only if you use an **MCC (manager) account** that manages the account above.  
  - Set this to the MCC account ID.  
  - If you log in directly to the same account you’re querying, leave this unset.

---

## 5. `.env` file

In the `backend` folder, copy `.env.example` to `.env` and fill in:

```env
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
GOOGLE_ADS_CUSTOMER_ID=1234567890
# Only if using an MCC:
# GOOGLE_ADS_LOGIN_CUSTOMER_ID=9876543210
```

Never commit `.env` to git.

---

## 6. Run the backend

```bash
cd backend
npm install
npm start
```

Open the dashboard and use **Last 7 days** or **Last 30 days**. Google Ads rows will appear with **platform = google**. If you see no Google data, check the Terminal for errors (e.g. invalid token, wrong customer ID, or no test account linked).
