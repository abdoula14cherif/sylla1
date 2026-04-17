// ============================================================
//  api/juri.js — Proxy Vercel pour l'IA JuriAfrik
//  Placer dans : /api/juri.js à la racine du projet
// ============================================================

const ANTHROPIC_KEY = 'METS_TA_CLE_ANTHROPIC_ICI'; // sk-ant-...

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { domaine, question } = req.body;
  if (!domaine || !question) return res.status(400).json({ error: 'Champs manquants' });

  const DOMAIN_LABELS = {
    travail:'Droit du Travail', famille:'Droit de la Famille',
    locatif:'Droit Locatif', commerce:'Droit Commercial OHADA',
    penal:'Droit Pénal', foncier:'Droit Foncier',
    consommateur:'Droit du Consommateur', administratif:'Droit Administratif',
  };

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':            'application/json',
        'x-api-key':               ANTHROPIC_KEY,
        'anthropic-version':       '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001', // Rapide et moins cher
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Tu es JuriAfrik, un assistant juridique spécialisé en droit africain francophone.
Tu réponds en français simple, accessible à quelqu'un sans formation juridique au Cameroun.

Domaine : ${DOMAIN_LABELS[domaine] || domaine}
Question : ${question}

Réponds avec cette structure HTML (balises directement, pas de markdown) :
<h4>Votre situation en bref</h4> résumé clair en 2 phrases
<h4>Ce que dit la loi</h4> textes applicables (Code du travail camerounais, OHADA, Code pénal, etc.)
<h4>Vos droits concrets</h4> liste <ul><li> pratique de ce que vous pouvez faire
<h4>Étapes recommandées</h4> quoi faire maintenant, dans quel ordre
Si pertinent : <div class="warning">⚠️ Point important</div> ou <div class="good">✅ Bonne nouvelle</div>

Sois précis, pratique, adapté au Cameroun. Max 350 mots. Pas de disclaimer légal excessif.`
        }]
      })
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || 'Erreur API');

    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ response: text });

  } catch (error) {
    console.error('JuriAfrik API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
