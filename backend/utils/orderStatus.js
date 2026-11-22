// Cycle de vie d'une commande (règle 8) : à partir d'un statut, quels statuts sont possibles ?
export const STATUTS = ['en_attente', 'acceptee', 'en_preparation', 'en_livraison', 'livree', 'annulee'];

export const TRANSITIONS = {
  en_attente: ['acceptee', 'annulee'],
  acceptee: ['en_preparation', 'annulee'],
  en_preparation: ['en_livraison', 'annulee'],
  en_livraison: ['livree'],
  livree: [],   // état final (règle 9 : plus modifiable)
  annulee: []   // état final
};

// Le passage de "depuis" vers "vers" respecte-t-il le cycle de vie ?
export const canTransition = (depuis, vers) => (TRANSITIONS[depuis] || []).includes(vers);
