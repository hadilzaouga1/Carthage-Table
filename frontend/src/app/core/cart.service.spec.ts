// Tests du panier (module 4) : exemple chiffré du cahier des charges, quantités, codes promo.
import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';

const pizzeria = { _id: 'r1', nom: 'Pizza House', fraisLivraison: 5 };
const pizza = { _id: 'd1', nom: 'Pizza Margherita', prix: 15, icon: '🍕' };
const coca = { _id: 'd2', nom: 'Coca-Cola', prix: 3, icon: '🥤' };
const tiramisu = { _id: 'd3', nom: 'Tiramisu', prix: 7, icon: '🍰' };

describe('CartService', () => {
  let cart: CartService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    cart = TestBed.inject(CartService);
  });

  // Exemple du cahier : 2 pizzas + 1 Coca + 1 Tiramisu = 40 DT, livraison 5 DT, total 45 DT
  function fillLikeTheSpec() {
    cart.add(pizzeria, pizza);
    cart.add(pizzeria, pizza);
    cart.add(pizzeria, coca);
    cart.add(pizzeria, tiramisu);
  }

  it('calcule le sous-total, la livraison et le total (exemple du cahier)', () => {
    fillLikeTheSpec();
    expect(cart.sousTotal()).toBe(40);
    expect(cart.fraisEffectifs()).toBe(5);
    expect(cart.total()).toBe(45);
    expect(cart.count()).toBe(4);
  });

  it('ajouter deux fois le même plat augmente la quantité', () => {
    cart.add(pizzeria, pizza);
    cart.add(pizzeria, pizza);
    expect(cart.lines().length).toBe(1);
    expect(cart.lines()[0].quantite).toBe(2);
  });

  it('augmenter ou diminuer la quantité met le total à jour', () => {
    cart.add(pizzeria, pizza);
    cart.change('d1', +2);
    expect(cart.total()).toBe(50); // 3 × 15 + 5
    cart.change('d1', -1);
    expect(cart.total()).toBe(35); // 2 × 15 + 5
  });

  it('une quantité à 0 supprime la ligne et vide le panier', () => {
    cart.add(pizzeria, pizza);
    cart.change('d1', -1);
    expect(cart.lines().length).toBe(0);
    expect(cart.total()).toBe(0);
    expect(cart.restaurantId()).toBeNull();
  });

  it('supprimer un plat du panier', () => {
    fillLikeTheSpec();
    cart.remove('d2');
    expect(cart.lines().map((l) => l.plat)).toEqual(['d1', 'd3']);
    expect(cart.sousTotal()).toBe(37);
  });

  it('CARTHAGE10 retire 10 % du sous-total', () => {
    fillLikeTheSpec();
    expect(cart.applyPromo('carthage10')).toBe(true);
    expect(cart.remise()).toBe(4);
    expect(cart.total()).toBe(41);
  });

  it('BIENVENUE offre la livraison', () => {
    fillLikeTheSpec();
    cart.applyPromo('BIENVENUE');
    expect(cart.fraisEffectifs()).toBe(0);
    expect(cart.total()).toBe(40);
  });

  it('un code promo inconnu est refusé avec un message', () => {
    fillLikeTheSpec();
    expect(cart.applyPromo('FAUX')).toBe(false);
    expect(cart.promoError()).toContain('FAUX');
    expect(cart.total()).toBe(45);
  });

  it('le panier est conservé dans le navigateur (il survit à un rechargement)', () => {
    fillLikeTheSpec();
    TestBed.resetTestingModule();
    const reloaded = TestBed.inject(CartService);
    expect(reloaded.count()).toBe(4);
    expect(reloaded.total()).toBe(45);
  });

  it('vider le panier remet tout à zéro', () => {
    fillLikeTheSpec();
    cart.clear();
    expect(cart.count()).toBe(0);
    expect(localStorage.getItem('ct_cart')).toBeNull();
  });
});
