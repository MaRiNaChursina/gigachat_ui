import type React from 'react'
import cls from './AppLayout.module.css'

export type AppLayoutProps = {
  sidebar: React.ReactNode
  children: React.ReactNode
  sidebarOpen: boolean
  onSidebarOpenChange: (open: boolean) => void
}

export function AppLayout({ sidebar, children, sidebarOpen, onSidebarOpenChange }: AppLayoutProps) {
  return (
    <div className={cls.root}>
      <div className={cls.sidebarDesktop}>{sidebar}</div>

      {sidebarOpen ? (
        <>
          <div className={cls.overlay} onMouseDown={() => onSidebarOpenChange(false)} />
          <div className={cls.sidebarDrawer}>{sidebar}</div>
        </>
      ) : null}

      <main className={cls.main}>{children}</main>
    </div>
  )
}

