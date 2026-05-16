// services/api.ts — All backend API calls for QRShield

const BASE_URL = 'https://qrshield-backend-3.onrender.com';

export interface ScanResult {
  decoded_url: string | null;
  is_short_url: boolean;
  ml_probability: number;
  dl_probability: number;
  fusion_score: number;
  fusion_mode: string;
  status: string;
  error: string | null;
  note: string | null;
  shap_explanation: ShapEntry[];
}

export interface ShapEntry {
  feature: string;
  value: number;
  shap_value: number;
}

export interface RecentScan {
  url: string;
  status: string;
}

/**
 * Send a captured QR image to the backend for threat analysis.
 * @param imageUri - Local file URI of the captured frame (JPEG)
 */
export async function scanQRImage(imageUri: string): Promise<ScanResult> {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'scan.jpg',
    type: 'image/jpeg',
  } as any);

  const response = await fetch(`${BASE_URL}/scan`, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return response.json();
}

/**
 * Analyze a raw URL string directly (no image required).
 * @param url - The URL to analyze
 */
export async function analyzeURL(url: string): Promise<ScanResult> {
  const response = await fetch(`${BASE_URL}/analyze-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get the 30 most recent scans for the history screen.
 */
export async function getRecentScans(): Promise<RecentScan[]> {
  const response = await fetch(`${BASE_URL}/recent-scans`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const data = await response.json();
  return data.scans ?? [];
}

/**
 * Ping the backend to check if it's alive (used for status dot).
 */
export async function pingBackend(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/recent-scans`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
