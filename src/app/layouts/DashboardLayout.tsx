import { Outlet, useNavigate } from 'react-router-dom'
import { LayoutGrid, UserCircle, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { SidebarNav, Topbar, type NavItem } from '@/shared/components/layout'
import { Button } from '@/shared/components/ui'
import { ROUTES } from '@/shared/constants'
import { getErrorMessage } from '@/shared/utils'
import { useAuth } from '@/features/auth'
import { PortfolioSwitcher } from '@/features/portfolios'

const navItems: NavItem[] = [
  { to: ROUTES.portfolios.root, label: 'Portfolios', icon: LayoutGrid },
  { to: ROUTES.account, label: 'Account', icon: UserCircle, end: true },
]

/** Authenticated app shell: sidebar + topbar (portfolio switcher + sign out). */
export function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate(ROUTES.login, { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col bg-slate-900 p-4 md:flex">
        <div className="mb-6 px-3 text-lg font-semibold text-white">
          Portfolio CMS
        </div>
        <SidebarNav items={navItems} />
      </aside>

      <div className="flex flex-1 flex-col">
        <Topbar
          left={<PortfolioSwitcher />}
          right={
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </>
          }
        />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
