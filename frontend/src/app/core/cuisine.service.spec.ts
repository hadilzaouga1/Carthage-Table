// Tests du service des catégories de cuisine (appels API et liste partagée).
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CuisineService } from './cuisine.service';
import { API_URL } from './config';

describe('CuisineService', () => {
  let service: CuisineService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CuisineService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('affiche une liste de secours avant le chargement', () => {
    expect(service.cuisines().map((c) => c.nom)).toContain('Pizza');
  });

  it('load() remplace la liste par celle de l\'API', () => {
    service.load().subscribe();
    http.expectOne(`${API_URL}/cuisines`).flush({ success: true, cuisines: [{ _id: '1', nom: 'Libanais', icon: '🥙' }] });
    expect(service.cuisines().map((c) => c.nom)).toEqual(['Libanais']);
  });

  it('load() garde la liste de secours si l\'API renvoie une liste vide', () => {
    service.load().subscribe();
    http.expectOne(`${API_URL}/cuisines`).flush({ success: true, cuisines: [] });
    expect(service.cuisines().length).toBeGreaterThan(0);
  });

  it('create, update et remove appellent les bonnes routes', () => {
    service.create({ nom: 'Grec' }).subscribe();
    const post = http.expectOne(`${API_URL}/cuisines`);
    expect(post.request.method).toBe('POST');
    post.flush({});

    service.update('42', { nom: 'Grec bis' }).subscribe();
    const put = http.expectOne(`${API_URL}/cuisines/42`);
    expect(put.request.method).toBe('PUT');
    put.flush({});

    service.remove('42').subscribe();
    const del = http.expectOne(`${API_URL}/cuisines/42`);
    expect(del.request.method).toBe('DELETE');
    del.flush({});
  });
});
