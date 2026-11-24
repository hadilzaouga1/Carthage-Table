// Tests des gardes de routes : accès selon la connexion et le rôle.
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { authGuard, roleGuard } from './guards';
import { AuthService } from './auth.service';

const run = (guard: any) => TestBed.runInInjectionContext(() => guard({} as any, {} as any));

describe('guards', () => {
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });
    auth = TestBed.inject(AuthService);
  });

  const login = (role: 'client' | 'restaurateur' | 'admin') => {
    auth.token.set('token');
    auth.user.set({ id: '1', nom: 'A', prenom: 'B', email: 'a@b.tn', telephone: '22123456', role });
  };

  it('authGuard renvoie vers /login si on n\'est pas connecté', () => {
    const result = run(authGuard) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login');
  });

  it('authGuard laisse passer un utilisateur connecté', () => {
    login('client');
    expect(run(authGuard)).toBe(true);
  });

  it('roleGuard("admin") laisse passer un admin', () => {
    login('admin');
    expect(run(roleGuard('admin'))).toBe(true);
  });

  it('roleGuard("admin") refuse un client et le renvoie à l\'accueil', () => {
    login('client');
    const result = run(roleGuard('admin')) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/');
  });

  it('roleGuard("restaurateur") refuse un visiteur non connecté', () => {
    expect(run(roleGuard('restaurateur'))).not.toBe(true);
  });
});
