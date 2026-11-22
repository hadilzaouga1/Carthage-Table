// Service du profil utilisateur : modifier ses infos et changer son mot de passe.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './config';

export interface ProfileData {
  nom: string;
  prenom: string;
  telephone: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  // PUT /api/users/profile
  updateProfile(data: ProfileData) {
    return this.http.put<{ success: boolean; user: ProfileData & { _id: string; email: string; role: string } }>(
      `${API_URL}/users/profile`,
      data
    );
  }

  // PUT /api/users/password
  changePassword(oldPassword: string, newPassword: string) {
    return this.http.put<{ success: boolean; message: string }>(`${API_URL}/users/password`, { oldPassword, newPassword });
  }
}