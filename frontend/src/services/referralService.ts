// const API_BASE_URL =
//   import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5001';

// export interface CreateReferralData {
//   screening_id: string;
//   dr_grade: number;
//   risk_level: string;
//   referral_center?: string;
//   referral_date?: string;
//   appointment_date?: string;
//   follow_up_date?: string;
// }

// export interface ReferralResponse {
//   message: string;
//   referral_id: number;
//   patient_id: string;
//   status: string;
// }

// export async function createReferral(
//   data: CreateReferralData
// ): Promise<ReferralResponse> {
//   const response = await fetch(`${API_BASE_URL}/api/referrals`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data),
//   });

//   const result = await response.json();

//   if (!response.ok) {
//     throw new Error(result.error || 'Failed to create referral');
//   }

//   return result;
// }

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5001';

export interface CreateReferralData {
  patient_id: string;
  screening_id: string;
  dr_grade: number;
  risk_level: string;
  referral_center?: string;
  referral_date?: string;
  appointment_date?: string;
  follow_up_date?: string;
}

export interface ReferralResponse {
  message: string;
  referral_id: number;
  patient_id: string;
  status: string;
}

export async function createReferral(
  data: CreateReferralData
): Promise<ReferralResponse> {
  const response = await fetch(`${API_BASE_URL}/api/referrals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || 'Failed to create referral'
    );
  }

  return result;
}