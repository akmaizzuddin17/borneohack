import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const api = axios.create({ baseURL: API_BASE, headers: { "Content-Type": "application/json" } });

export interface QueryResponse { answer: string; sources: { source: string; page: string; country: string }[]; }
export interface ChecklistResponse { checklist: string; product: string; destination_country: string; }
export interface TranslationResponse { english_letter: string; translated_letter: string; target_language: string; }
export interface FormDResponse {
  verdict: "ELIGIBLE" | "NOT ELIGIBLE" | "MORE INFORMATION REQUIRED";
  rvc: number | null;
  is_asean_manufacturer: boolean;
  is_asean_destination: boolean;
  wholly_obtained: boolean;
  asean_material_pct: number;
  explanation: string;
  answers: Record<string, string>;
}

export async function queryTrade(question: string): Promise<QueryResponse> {
  const res = await api.post("/api/query", { question }); return res.data;
}
export async function getChecklist(product: string, destinationCountry: string): Promise<ChecklistResponse> {
  const res = await api.post("/api/checklist", { product, destination_country: destinationCountry }); return res.data;
}
export async function translateLetter(product: string, destinationCountry: string, senderName: string, companyName: string): Promise<TranslationResponse> {
  const res = await api.post("/api/translate-letter", { product, destination_country: destinationCountry, sender_name: senderName, company_name: companyName }); return res.data;
}
export async function checkFormD(answers: Record<string, string>): Promise<FormDResponse> {
  const res = await api.post("/api/form-d-check", { answers }); return res.data;
}
export async function uploadPdf(file: File) {
  const formData = new FormData(); formData.append("file", file);
  const res = await api.post("/api/ingest", formData, { headers: { "Content-Type": "multipart/form-data" } }); return res.data;
}
