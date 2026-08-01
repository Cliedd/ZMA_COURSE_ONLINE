import { http, HttpResponse } from 'msw'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { mswServer } from '@/test/msw'
import { renderWithProviders } from '@/test/renderWithProviders'
import { CertificateVerifyPage } from './CertificateVerifyPage'

const API = 'http://localhost/api/v1'

function renderAt(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/certificates/verify" element={<CertificateVerifyPage />} />
      <Route path="/certificates/verify/:certNumber" element={<CertificateVerifyPage />} />
    </Routes>,
    { route },
  )
}

describe('CertificateVerifyPage', () => {
  it("affiche le certificat comme authentique quand il est valide", async () => {
    mswServer.use(http.get(`${API}/certificates/verify/ZTF-2026-000123`, () => HttpResponse.json({
      valid: true,
      certNumber: 'ZTF-2026-000123',
      courseTitle: 'Piano classique & harmonie',
      issuedAt: '2026-03-15T10:00:00',
    })))

    renderAt('/certificates/verify/ZTF-2026-000123')

    expect(await screen.findByText('Certificate authentic')).toBeInTheDocument()
    expect(screen.getByText('Piano classique & harmonie')).toBeInTheDocument()
  })

  it('affiche un message « introuvable » quand le certificat est inconnu (404)', async () => {
    mswServer.use(http.get(`${API}/certificates/verify/INCONNU`, () => HttpResponse.json({ message: 'not found' }, { status: 404 })))

    renderAt('/certificates/verify/INCONNU')

    expect(await screen.findByText('Certificate not found')).toBeInTheDocument()
  })

  it("permet de rechercher un certificat via le formulaire quand aucun numéro n'est dans l'URL", async () => {
    mswServer.use(http.get(`${API}/certificates/verify/ZTF-9`, () => HttpResponse.json({
      valid: true,
      certNumber: 'ZTF-9',
      courseTitle: 'Guitare jazz',
      issuedAt: null,
    })))

    renderAt('/certificates/verify')
    expect(screen.queryByText('Certificat authentique')).not.toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Certificate number'), 'ZTF-9')
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }))

    expect(await screen.findByText('Certificate authentic')).toBeInTheDocument()
    expect(screen.getByText('Guitare jazz')).toBeInTheDocument()
  })
})
