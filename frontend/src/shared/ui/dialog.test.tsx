import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Dialog, DialogContent, DialogTrigger, Menu, MenuContent, MenuItem, MenuTrigger } from './index'

describe('Dialog', () => {
  it('s\'ouvre au clic sur son déclencheur', async () => {
    render(
      <Dialog>
        <DialogTrigger>Ouvrir le menu</DialogTrigger>
        <DialogContent title="Navigation">Contenu du tiroir</DialogContent>
      </Dialog>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }))
    expect(screen.getByRole('dialog', { name: 'Navigation' })).toBeInTheDocument()
  })

  it('se ferme avec la touche Échap', async () => {
    render(
      <Dialog>
        <DialogTrigger>Ouvrir</DialogTrigger>
        <DialogContent title="Navigation">Contenu</DialogContent>
      </Dialog>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir' }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('expose un bouton de fermeture nommé', async () => {
    render(
      <Dialog>
        <DialogTrigger>Ouvrir</DialogTrigger>
        <DialogContent title="Navigation">Contenu</DialogContent>
      </Dialog>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir' }))
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument()
  })
})

describe('Menu', () => {
  it('s\'ouvre et se navigue au clavier', async () => {
    render(
      <Menu>
        <MenuTrigger>Mon compte</MenuTrigger>
        <MenuContent>
          <MenuItem>Mon espace</MenuItem>
          <MenuItem>Déconnexion</MenuItem>
        </MenuContent>
      </Menu>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Mon compte' }))
    expect(await screen.findByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Mon espace' })).toBeInTheDocument()
  })

  it('porte aria-expanded sur son déclencheur', async () => {
    render(
      <Menu>
        <MenuTrigger>Mon compte</MenuTrigger>
        <MenuContent><MenuItem>Déconnexion</MenuItem></MenuContent>
      </Menu>,
    )
    const trigger = screen.getByRole('button', { name: 'Mon compte' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})
