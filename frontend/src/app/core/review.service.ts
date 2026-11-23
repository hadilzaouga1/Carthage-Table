import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './config';

export interface ReviewAuthor {
  _id?: string;
  nom: string;
  prenom: string;
}

export interface Review {
  _id: string;
  restaurant: string;
  client: ReviewAuthor | string;
  order?: string | null;
  note: number;
  commentaire: string;
  createdAt: string;
}

export interface RestaurantReviewsResponse {
  success: boolean;
  reviews: Review[];
  noteMoyenne: number;
  nombreAvis: number;
}

export interface UpsertReviewResponse {
  success: boolean;
  review: Review;
  noteMoyenne: number;
  nombreAvis: number;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);

  listByRestaurant(restaurantId: string) {
    return this.http.get<RestaurantReviewsResponse>(`${API_URL}/reviews/restaurant/${restaurantId}`);
  }

  submitReview(payload: {
    restaurant: string;
    order?: string;
    note: number;
    commentaire?: string;
  }) {
    return this.http.post<UpsertReviewResponse>(`${API_URL}/reviews`, payload);
  }

  deleteReview(reviewId: string) {
    return this.http.delete<{ success: boolean; noteMoyenne: number; nombreAvis: number }>(
      `${API_URL}/reviews/${reviewId}`
    );
  }
}