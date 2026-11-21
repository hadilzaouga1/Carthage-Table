import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestaurantList, RestaurantMenu, RestaurantQuery } from '../models/restaurant.model';

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private http = inject(HttpClient);

  list(query: RestaurantQuery = {}) {
    let params = new HttpParams();
    if (query.q?.trim()) params = params.set('q', query.q.trim());
    if (query.cuisine && query.cuisine !== 'Tous') params = params.set('cuisine', query.cuisine);
    if (query.open) params = params.set('open', 'true');
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    return this.http.get<RestaurantList>('/api/restaurants', { params });
  }
  
  get(id: string) {
    return this.http.get<RestaurantMenu>(`/api/restaurants/${id}`);
  }
}
