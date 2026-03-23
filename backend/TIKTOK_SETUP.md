# TikTok Ads API setup (paid media dashboard)

Follow these to pull live TikTok Ads data into your paid media dashboard.

---

## 1. TikTok for Business / Marketing API access

1. Go to [TikTok for Business](https://business.tiktok.com) and sign in (or create a Business account).
2. Open the [TikTok Marketing API](https://business-api.tiktok.com/portal/docs) or **TikTok for Developers** and create an app (or use an existing one).
3. In the app, request **Marketing API** access and the scopes needed for **reporting** (e.g. read campaign and ad metrics).
4. Complete any **business verification** or approval steps TikTok requires.

---

## 2. Get your Advertiser ID

1. In [TikTok Ads Manager](https://ads.tiktok.com), go to your account.
2. Your **Advertiser ID** is in the account settings or in the URL when you’re in the Ads Manager. It’s a numeric ID (e.g. `1234567890123456789`).
3. Put this in `.env` as **TIKTOK_ADVERTISER_ID**.

---

## 3. Get an access token

TikTok uses OAuth. You need a **long-lived access token** that has permission to read reporting data for your advertiser.

- **Option A – TikTok’s OAuth flow:**  
  Use the official [Authorization guide](https://business-api.tiktok.com/portal/docs?id=1739585693130753) to have a user (with access to the TikTok Ads account) sign in and approve your app. Exchange the auth code for an **access token** and, if supported, a **refresh token**. Store the access token in `.env` as **TIKTOK_ACCESS_TOKEN**. If the token is short-lived, implement refresh and always use the latest token when calling the API.

- **Option B – Generate in TikTok Ads Manager:**  
  Some accounts can generate a token under **Tools → API** in Ads Manager. If you see an option to create an access token for your app, use that and paste it into **TIKTOK_ACCESS_TOKEN**.

The token must have **reporting** (and any other scopes your app requests) so the backend can call the report endpoint.

---

## 4. `.env` in the backend folder

In `paid-media-dashboard/backend`, create or edit **`.env`** (do not commit it):

```env
TIKTOK_ACCESS_TOKEN=your_long_lived_access_token_here
TIKTOK_ADVERTISER_ID=1234567890123456789
```

Restart the backend (double‑click **Start Backend.command** or run `node server.js`). Open the dashboard at **http://localhost:5001**; TikTok rows should appear in the tables and charts with **platform = TikTok**.

---

## 5. If TikTok data doesn’t show up

- Confirm **TIKTOK_ACCESS_TOKEN** and **TIKTOK_ADVERTISER_ID** are set in `.env` with no extra spaces or quotes.
- Check the Terminal window where the backend is running for errors like `TikTok API error: ...`.
- Ensure the token has not expired and has reporting permissions for the advertiser.
- Verify the Advertiser ID matches the account you use in TikTok Ads Manager.

If you see a specific error message from the backend or from the TikTok API response, use that to adjust the token, permissions, or Advertiser ID.
