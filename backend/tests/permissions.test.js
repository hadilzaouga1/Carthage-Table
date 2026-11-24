import test from 'node:test';
import assert from 'node:assert/strict';
import assertCanManage from '../utils/assertCanManage.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { errorHandler } from '../middleware/errorMiddleware.js';

const user = (role, id = 'u1') => ({ role, _id: { toString: () => id } });
const restaurantDe = (ownerId) => ({ owner: { toString: () => ownerId } });

test("règle 7 : un restaurateur ne gère que SES restaurants", () => {
  assert.doesNotThrow(() => assertCanManage(user('restaurateur', 'u1'), restaurantDe('u1')));
  assert.throws(() => assertCanManage(user('restaurateur', 'u1'), restaurantDe('u2')), (e) => e.statusCode === 403);
});

test("l'administrateur peut superviser tous les restaurants", () => {
  assert.doesNotThrow(() => assertCanManage(user('admin', 'a1'), restaurantDe('u2')));
});

test('authorize refuse un rôle non autorisé (règle 12 : contrôle côté serveur)', () => {
  let erreur = null;
  authorize('admin')({ user: user('client') }, {}, (e) => { erreur = e; });
  assert.equal(erreur?.statusCode, 403);
});

test('authorize laisse passer un rôle autorisé', () => {
  let erreur = 'pas appelé';
  authorize('restaurateur', 'admin')({ user: user('restaurateur') }, {}, (e) => { erreur = e; });
  assert.equal(erreur, undefined);
});

test("le gestionnaire d'erreurs renvoie { success: false, message } avec le bon code", () => {
  const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
  errorHandler(Object.assign(new Error('Interdit'), { statusCode: 403 }), {}, res, () => {});
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { success: false, message: 'Interdit' });
});

test("un doublon d'index unique (email déjà pris) devient une erreur 409", () => {
  const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
  errorHandler(Object.assign(new Error('E11000'), { code: 11000 }), {}, res, () => {});
  assert.equal(res.statusCode, 409);
});
