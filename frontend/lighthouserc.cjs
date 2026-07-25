/**
 * Budget de performance du spec § 9.1, rendu opposable.
 * Ne pas desserrer un seuil pour faire passer la CI : corriger la régression.
 */
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['http://localhost/index.html'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        // Représentatif de la cible : mobile de milieu de gamme sur 3G rapide.
        throttlingMethod: 'simulate',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'unminified-javascript': 'error',
        'uses-responsive-images': 'error',
        'font-display': 'error',
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
}
