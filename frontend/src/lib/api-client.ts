import { API_BASE_URL } from './config';
import type { ApiDocument, ApiDocumentState, ApiTask, ApiUser, ConfirmExtractionRequest, ExtractionJob, SessionResponse, TaskState, Transaction, TransactionCard, UploadResponse, ExtractedField } from '@/types/api';

export class ApiError extends Error { constructor(public status:number,message:string){super(message);this.name='ApiError'} }
const TOKEN_KEY='altitude.token'; const USER_KEY='altitude.user';
function getToken(){return typeof window==='undefined'?null:window.localStorage.getItem(TOKEN_KEY)}
export function setToken(token:string|null){if(typeof window!=='undefined'){token?window.localStorage.setItem(TOKEN_KEY,token):window.localStorage.removeItem(TOKEN_KEY)}}
export function setStoredUser(user:ApiUser|null){if(typeof window!=='undefined'){user?window.localStorage.setItem(USER_KEY,JSON.stringify(user)):window.localStorage.removeItem(USER_KEY)}}
export function getStoredUser():ApiUser|null{if(typeof window==='undefined')return null;try{return JSON.parse(window.localStorage.getItem(USER_KEY)||'null')}catch{return null}}
async function request<T>(path:string,init:RequestInit={}):Promise<T>{const headers=new Headers(init.headers);const token=getToken();if(token)headers.set('Authorization',`Bearer ${token}`);if(init.body && !(init.body instanceof FormData))headers.set('Content-Type','application/json');let res:Response;try{res=await fetch(`${API_BASE_URL}${path}`,{...init,headers})}catch{throw new ApiError(0,'Could not reach the Altitude API. Is the backend running?')}if(!res.ok){let detail=res.statusText;try{const body=await res.json();detail=body.detail??body.message??detail}catch{}throw new ApiError(res.status,typeof detail==='string'?detail:JSON.stringify(detail))}return res.status===204?undefined as T:await res.json() as T}
export const api={
 createSession:()=>request<SessionResponse>('/auth/session',{method:'POST',body:'{}'}),
 listTransactions:()=>request<TransactionCard[]>('/transactions'),
 getTransaction:(id:string)=>request<Transaction>(`/transactions/${id}`),
 getExtractedFields:(id:string)=>request<ExtractedField[]>(`/transactions/${id}/extracted-fields`),
 uploadDocument:(file:File,transactionId?:string)=>{const form=new FormData();form.append('file',file);if(transactionId)form.append('transactionId',transactionId);return request<UploadResponse>('/documents/upload',{method:'POST',body:form})},
 getExtraction:(documentId:string)=>request<ExtractionJob>(`/documents/${documentId}/extraction`),
 getExtractionRun:(runId:string)=>request<ExtractionJob>(`/extractions/${runId}`),
 confirmExtraction:(jobId:string,body:ConfirmExtractionRequest={})=>request<Transaction>(`/extractions/${jobId}/confirm`,{method:'POST',body:JSON.stringify(body)}),
 approveField:(id:string,value?:string)=>request<ExtractedField>(`/extracted-fields/${id}`,{method:'PATCH',body:JSON.stringify(value?{action:'edit',value}:{action:'approve'})}),
 updateTask:(id:string,state:TaskState)=>request<ApiTask>(`/tasks/${id}`,{method:'PATCH',body:JSON.stringify({state})}),
 updateDocument:(id:string,state:ApiDocumentState)=>request<ApiDocument>(`/documents/${id}`,{method:'PATCH',body:JSON.stringify({state})}),
};
