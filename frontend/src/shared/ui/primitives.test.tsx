import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, it, expect, vi } from 'vitest'
import { Badge, Button, Card, CardBody, CardFooter, CardMedia, Skeleton } from './index'

describe('Button', () => {
  it('rend un vrai bouton accessible par son nom', () => {
    render(<Button>Explorer les formations</Button>)
    expect(screen.getByRole('button', { name: 'Explorer les formations' })).toBeInTheDocument()
  })

  it('déclenche onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Valider</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('respecte la cible tactile minimale de 44 px', () => {
    render(<Button size="md">Valider</Button>)
    expect(screen.getByRole('button').className).toContain('min-h-touch')
  })

  it('ne déclenche rien quand il est désactivé', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Valider</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('rend un lien quand asChild est utilisé', () => {
    render(<Button asChild><a href="/catalogue">Catalogue</a></Button>)
    expect(screen.getByRole('link', { name: 'Catalogue' })).toHaveAttribute('href', '/catalogue')
  })

  it('n\'a aucune violation d\'accessibilité', async () => {
    const { container } = render(<Button>Explorer</Button>)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Badge', () => {
  it('affiche son contenu', () => {
    render(<Badge tone="accent">Licence · Semestre 3</Badge>)
    expect(screen.getByText('Licence · Semestre 3')).toBeInTheDocument()
  })

  it('utilise --accent-ink et jamais --accent pour du texte', () => {
    render(<Badge tone="accent">Licence</Badge>)
    const el = screen.getByText('Licence')
    const classNames = el.className.split(' ')
    expect(classNames).toContain('text-accent-ink')
    expect(classNames).not.toContain('text-accent')
  })
})

describe('Card', () => {
  it('se compose par ses sous-parties', () => {
    render(
      <Card>
        <CardMedia><img src="/images/heroBg.jpg" alt="" width={400} height={250} /></CardMedia>
        <CardBody><h3>Piano classique</h3></CardBody>
        <CardFooter><span>18 $</span></CardFooter>
      </Card>,
    )
    expect(screen.getByRole('heading', { name: 'Piano classique' })).toBeInTheDocument()
    expect(screen.getByText('18 $')).toBeInTheDocument()
  })

  it('n\'a aucune violation d\'accessibilité', async () => {
    const { container } = render(<Card><CardBody><h3>Piano</h3></CardBody></Card>)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Skeleton', () => {
  it('est masqué aux lecteurs d\'écran', () => {
    render(<Skeleton className="h-4 w-32" />)
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true')
  })
})
