// Service des types de cuisine (Pizza, Tunisien...) : lecture publique, gestion réservée à l'admin.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { API_URL } from './config';

export interface Cuisine {
  _id: string;
  nom: string;
  description: string;
  icon: string;
  restaurants?: number; // nombre de restaurants validés qui utilisent cette cuisine
}

// Liste de secours si l'API ne répond pas (même valeurs que seedCuisines.js)
export const DEFAULT_CUISINES: Cuisine[] = ['Pizza', 'Fast-food', 'Tunisien', 'Italien', 'Desserts', 'Boissons'].map((nom) => ({
  _id: nom, nom, description: '', icon: nom === 'Pizza' ? 'pizza' : nom === 'Fast-food' ? 'sandwich' : nom === 'Desserts' ? 'cake-slice' : 'utensils'
}));

@Injectable({ providedIn: 'root' })
export class CuisineService {
  private http = inject(HttpClient);

  // GET /api/cuisines (public). Si la liste est vide ou si l'API échoue : liste de secours.
  list(): Observable<Cuisine[]> {
    return this.http.get<{ success: boolean; cuisines: Cuisine[] }>(`${API_URL}/cuisines`).pipe(
      map((r) => (r.cuisines?.length ? r.cuisines : DEFAULT_CUISINES)),
      catchError(() => of(DEFAULT_CUISINES))
    );
  }

  // Liste brute (sans liste de secours) : pour la page d'administration, qui a besoin des vrais identifiants
  listRaw(): Observable<Cuisine[]> {
    return this.http.get<{ success: boolean; cuisines: Cuisine[] }>(`${API_URL}/cuisines`).pipe(map((r) => r.cuisines ?? []));
  }

  // --- Administrateur ---
  create(body: { nom: string; description?: string; icon?: string }) { return this.http.post(`${API_URL}/cuisines`, body); }
  update(id: string, body: { nom?: string; description?: string; icon?: string }) { return this.http.put(`${API_URL}/cuisines/${id}`, body); }
  remove(id: string) { return this.http.delete(`${API_URL}/cuisines/${id}`); }
}
