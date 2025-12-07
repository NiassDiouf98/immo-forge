import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Property {
  id?: number;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  size: number;
  description: string;
  images?: string[];
  status?: 'published'|'draft'|'archived';
}

@Injectable({ providedIn: 'root' })
export class PropertyService {
  base = '/api/properties'; // adapter au backend

  constructor(private http: HttpClient) {}

  list(params = {}): Observable<Property[]> { return this.http.get<Property[]>(this.base, { params }); }
  get(id: number) { return this.http.get<Property>(`${this.base}/${id}`); }
  create(payload: Property) { return this.http.post(this.base, payload); }
  update(id: number, payload: Property) { return this.http.put(`${this.base}/${id}`, payload); }
  delete(id: number) { return this.http.delete(`${this.base}/${id}`); }
  uploadImage(id: number, formData: FormData) { return this.http.post(`${this.base}/${id}/images`, formData); }
}
