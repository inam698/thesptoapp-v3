# Code Citations

## License: unknown
https://github.com/sparlampe/captural-coding-challenge/blob/e3ee7f4ab288e50daa211dd3add66976dbba55a6/firestore.rules

```
---

# Google Play Store Quality Audit Report — The Spot App

---

## CRITICAL ISSUES (Must Fix Before Release)

### 1. Firebase Service Account Private Key Committed to Repository

**Severity: CRITICAL / SECURITY BLOCKER**

[configs/TheSpotApp-Firebase-Service-Account.json](configs/TheSpotApp-Firebase-Service-Account.json) contains a full Firebase Admin SDK service account **with the private key in plaintext**, committed to version control. This grants full administrative access to your Firebase project (Firestore, Auth, Storage — everything). An attacker who obtains this key can:

- Read/write/delete **all user data**
- Create/delete user accounts
- Impersonate any user

**Action:** Immediately rotate this key in Google Cloud Console, add the file to `.gitignore`, remove it from git history (`git filter-branch` or BFG Repo-Cleaner), and never commit service account credentials again. Use environment variables or a secrets manager for scripts that need admin access.

---

### 2. Firebase API Key & Config Hardcoded in Source

**Severity: HIGH / SECURITY**

[lib/firebase.ts](lib/firebase.ts#L8-L16) contains the full Firebase web config with `apiKey`, `appId`, etc. While Firebase web API keys are designed to be public (secured by Firestore Security Rules & App Check), this setup has **no App Check configured** in [app.json](app.json). Without App Check, anyone can use your API key from a script to:

- Abuse authentication endpoints
- Make Firestore requests outside the app
- Incur billing costs

**Action:** Enable Firebase App Check with the Expo plugin. Also, restrict the API key in Google Cloud Console to your specific app package/bundle ID.

---

### 3. No Firestore Security Rules Shipped or Documented

**Severity: HIGH / SECURITY**

The app writes to paths like `users/{uid}/journal`, `users/{uid}/cycles`, `users/{uid}/logs`, and reads from `articles`. There's no evidence of Firestore security rules in the repo. If rules are still at default (`allow read, write: if true`), **any user can read any other user's journal entries, period data, and health logs**.

**Action:** Deploy strict Firestore rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /articles/{articleId} {
      allow read: if true;
      allow write: if false; // admin-only via backend
    }
  }
}
```

---

### 4. Profile Settings Are Not Persisted

**Severity: HIGH
```


## License: unknown
https://github.com/sparlampe/captural-coding-challenge/blob/e3ee7f4ab288e50daa211dd3add66976dbba55a6/firestore.rules

```
---

# Google Play Store Quality Audit Report — The Spot App

---

## CRITICAL ISSUES (Must Fix Before Release)

### 1. Firebase Service Account Private Key Committed to Repository

**Severity: CRITICAL / SECURITY BLOCKER**

[configs/TheSpotApp-Firebase-Service-Account.json](configs/TheSpotApp-Firebase-Service-Account.json) contains a full Firebase Admin SDK service account **with the private key in plaintext**, committed to version control. This grants full administrative access to your Firebase project (Firestore, Auth, Storage — everything). An attacker who obtains this key can:

- Read/write/delete **all user data**
- Create/delete user accounts
- Impersonate any user

**Action:** Immediately rotate this key in Google Cloud Console, add the file to `.gitignore`, remove it from git history (`git filter-branch` or BFG Repo-Cleaner), and never commit service account credentials again. Use environment variables or a secrets manager for scripts that need admin access.

---

### 2. Firebase API Key & Config Hardcoded in Source

**Severity: HIGH / SECURITY**

[lib/firebase.ts](lib/firebase.ts#L8-L16) contains the full Firebase web config with `apiKey`, `appId`, etc. While Firebase web API keys are designed to be public (secured by Firestore Security Rules & App Check), this setup has **no App Check configured** in [app.json](app.json). Without App Check, anyone can use your API key from a script to:

- Abuse authentication endpoints
- Make Firestore requests outside the app
- Incur billing costs

**Action:** Enable Firebase App Check with the Expo plugin. Also, restrict the API key in Google Cloud Console to your specific app package/bundle ID.

---

### 3. No Firestore Security Rules Shipped or Documented

**Severity: HIGH / SECURITY**

The app writes to paths like `users/{uid}/journal`, `users/{uid}/cycles`, `users/{uid}/logs`, and reads from `articles`. There's no evidence of Firestore security rules in the repo. If rules are still at default (`allow read, write: if true`), **any user can read any other user's journal entries, period data, and health logs**.

**Action:** Deploy strict Firestore rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /articles/{articleId} {
      allow read: if true;
      allow write: if false; // admin-only via backend
    }
  }
}
```

---

### 4. Profile Settings Are Not Persisted

**Severity: HIGH
```


## License: unknown
https://github.com/sparlampe/captural-coding-challenge/blob/e3ee7f4ab288e50daa211dd3add66976dbba55a6/firestore.rules

```
---

# Google Play Store Quality Audit Report — The Spot App

---

## CRITICAL ISSUES (Must Fix Before Release)

### 1. Firebase Service Account Private Key Committed to Repository

**Severity: CRITICAL / SECURITY BLOCKER**

[configs/TheSpotApp-Firebase-Service-Account.json](configs/TheSpotApp-Firebase-Service-Account.json) contains a full Firebase Admin SDK service account **with the private key in plaintext**, committed to version control. This grants full administrative access to your Firebase project (Firestore, Auth, Storage — everything). An attacker who obtains this key can:

- Read/write/delete **all user data**
- Create/delete user accounts
- Impersonate any user

**Action:** Immediately rotate this key in Google Cloud Console, add the file to `.gitignore`, remove it from git history (`git filter-branch` or BFG Repo-Cleaner), and never commit service account credentials again. Use environment variables or a secrets manager for scripts that need admin access.

---

### 2. Firebase API Key & Config Hardcoded in Source

**Severity: HIGH / SECURITY**

[lib/firebase.ts](lib/firebase.ts#L8-L16) contains the full Firebase web config with `apiKey`, `appId`, etc. While Firebase web API keys are designed to be public (secured by Firestore Security Rules & App Check), this setup has **no App Check configured** in [app.json](app.json). Without App Check, anyone can use your API key from a script to:

- Abuse authentication endpoints
- Make Firestore requests outside the app
- Incur billing costs

**Action:** Enable Firebase App Check with the Expo plugin. Also, restrict the API key in Google Cloud Console to your specific app package/bundle ID.

---

### 3. No Firestore Security Rules Shipped or Documented

**Severity: HIGH / SECURITY**

The app writes to paths like `users/{uid}/journal`, `users/{uid}/cycles`, `users/{uid}/logs`, and reads from `articles`. There's no evidence of Firestore security rules in the repo. If rules are still at default (`allow read, write: if true`), **any user can read any other user's journal entries, period data, and health logs**.

**Action:** Deploy strict Firestore rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /articles/{articleId} {
      allow read: if true;
      allow write: if false; // admin-only via backend
    }
  }
}
```

---

### 4. Profile Settings Are Not Persisted

**Severity: HIGH
```


## License: unknown
https://github.com/sparlampe/captural-coding-challenge/blob/e3ee7f4ab288e50daa211dd3add66976dbba55a6/firestore.rules

```
---

# Google Play Store Quality Audit Report — The Spot App

---

## CRITICAL ISSUES (Must Fix Before Release)

### 1. Firebase Service Account Private Key Committed to Repository

**Severity: CRITICAL / SECURITY BLOCKER**

[configs/TheSpotApp-Firebase-Service-Account.json](configs/TheSpotApp-Firebase-Service-Account.json) contains a full Firebase Admin SDK service account **with the private key in plaintext**, committed to version control. This grants full administrative access to your Firebase project (Firestore, Auth, Storage — everything). An attacker who obtains this key can:

- Read/write/delete **all user data**
- Create/delete user accounts
- Impersonate any user

**Action:** Immediately rotate this key in Google Cloud Console, add the file to `.gitignore`, remove it from git history (`git filter-branch` or BFG Repo-Cleaner), and never commit service account credentials again. Use environment variables or a secrets manager for scripts that need admin access.

---

### 2. Firebase API Key & Config Hardcoded in Source

**Severity: HIGH / SECURITY**

[lib/firebase.ts](lib/firebase.ts#L8-L16) contains the full Firebase web config with `apiKey`, `appId`, etc. While Firebase web API keys are designed to be public (secured by Firestore Security Rules & App Check), this setup has **no App Check configured** in [app.json](app.json). Without App Check, anyone can use your API key from a script to:

- Abuse authentication endpoints
- Make Firestore requests outside the app
- Incur billing costs

**Action:** Enable Firebase App Check with the Expo plugin. Also, restrict the API key in Google Cloud Console to your specific app package/bundle ID.

---

### 3. No Firestore Security Rules Shipped or Documented

**Severity: HIGH / SECURITY**

The app writes to paths like `users/{uid}/journal`, `users/{uid}/cycles`, `users/{uid}/logs`, and reads from `articles`. There's no evidence of Firestore security rules in the repo. If rules are still at default (`allow read, write: if true`), **any user can read any other user's journal entries, period data, and health logs**.

**Action:** Deploy strict Firestore rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /articles/{articleId} {
      allow read: if true;
      allow write: if false; // admin-only via backend
    }
  }
}
```

---

### 4. Profile Settings Are Not Persisted

**Severity: HIGH
```


## License: unknown
https://github.com/sparlampe/captural-coding-challenge/blob/e3ee7f4ab288e50daa211dd3add66976dbba55a6/firestore.rules

```
---

# Google Play Store Quality Audit Report — The Spot App

---

## CRITICAL ISSUES (Must Fix Before Release)

### 1. Firebase Service Account Private Key Committed to Repository

**Severity: CRITICAL / SECURITY BLOCKER**

[configs/TheSpotApp-Firebase-Service-Account.json](configs/TheSpotApp-Firebase-Service-Account.json) contains a full Firebase Admin SDK service account **with the private key in plaintext**, committed to version control. This grants full administrative access to your Firebase project (Firestore, Auth, Storage — everything). An attacker who obtains this key can:

- Read/write/delete **all user data**
- Create/delete user accounts
- Impersonate any user

**Action:** Immediately rotate this key in Google Cloud Console, add the file to `.gitignore`, remove it from git history (`git filter-branch` or BFG Repo-Cleaner), and never commit service account credentials again. Use environment variables or a secrets manager for scripts that need admin access.

---

### 2. Firebase API Key & Config Hardcoded in Source

**Severity: HIGH / SECURITY**

[lib/firebase.ts](lib/firebase.ts#L8-L16) contains the full Firebase web config with `apiKey`, `appId`, etc. While Firebase web API keys are designed to be public (secured by Firestore Security Rules & App Check), this setup has **no App Check configured** in [app.json](app.json). Without App Check, anyone can use your API key from a script to:

- Abuse authentication endpoints
- Make Firestore requests outside the app
- Incur billing costs

**Action:** Enable Firebase App Check with the Expo plugin. Also, restrict the API key in Google Cloud Console to your specific app package/bundle ID.

---

### 3. No Firestore Security Rules Shipped or Documented

**Severity: HIGH / SECURITY**

The app writes to paths like `users/{uid}/journal`, `users/{uid}/cycles`, `users/{uid}/logs`, and reads from `articles`. There's no evidence of Firestore security rules in the repo. If rules are still at default (`allow read, write: if true`), **any user can read any other user's journal entries, period data, and health logs**.

**Action:** Deploy strict Firestore rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /articles/{articleId} {
      allow read: if true;
      allow write: if false; // admin-only via backend
    }
  }
}
```

---

### 4. Profile Settings Are Not Persisted

**Severity: HIGH
```

