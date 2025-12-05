// This service handles interactions with the browser's WebAuthn API
// enabling support for YubiKeys, TouchID, FaceID, and Windows Hello.

export const registerSecurityKey = async (username: string, displayName: string): Promise<boolean> => {
  if (!window.PublicKeyCredential) {
    throw new Error("WebAuthn is not supported in this browser.");
  }

  // 1. Generate random challenge buffer
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  // 2. Generate User ID buffer
  const userId = new Uint8Array(16);
  window.crypto.getRandomValues(userId);

  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge: challenge,
    rp: {
      name: "NexusAI Platform",
      id: window.location.hostname
    },
    user: {
      id: userId,
      name: username,
      displayName: displayName
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" },  // ES256
      { alg: -257, type: "public-key" } // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: "cross-platform", // Prefer external keys like YubiKey, remove for TouchID
      userVerification: "preferred"
    },
    timeout: 60000,
    attestation: "none"
  };

  try {
    // This triggers the browser's native security dialog
    const credential = await navigator.credentials.create({ publicKey });
    
    if (credential) {
      console.log("WebAuthn Registration Successful:", credential);
      // In a real app, we would send `credential` to the backend for verification and storage.
      return true;
    }
  } catch (err) {
    console.error("WebAuthn Error:", err);
    throw err;
  }
  return false;
};

// Helper to generate a random Base32-like string for TOTP Secret simulation
export const generateTOTPSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 16; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

export const generateBackupCodes = (): string[] => {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    const code = Math.random().toString(36).substr(2, 4) + '-' + Math.random().toString(36).substr(2, 4);
    codes.push(code.toUpperCase());
  }
  return codes;
};