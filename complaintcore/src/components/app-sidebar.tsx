
"use client"

import * as React from "react"
import {
  BarChart3,
  Bot,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Settings,
  PlusCircle,
  Users,
  Heart,
  Bell,
  LogOut
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useUser, useAuth } from "@/firebase"
import { signOut } from "firebase/auth"

const agentItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Admin Panel", url: "/admin", icon: ShieldCheck },
  { title: "User Management", url: "/users", icon: Users },
  { title: "Charity Impact", url: "/charity", icon: Heart },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const auth = useAuth()
  const router = useRouter()

  // Only show the sidebar content if we are NOT on the login page
  const isLoginPage = pathname === "/login"
  const isAgent = user && !user.isAnonymous

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  if (isLoginPage) return null

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-border bg-card">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary glow-primary">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            Complaint<span className="text-primary">Core</span>
          </span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        {isAgent && (
          <SidebarMenu className="px-2">
            {agentItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                  tooltip={item.title}
                  className={`transition-all duration-200 hover:bg-primary/10 hover:text-primary ${
                    pathname === item.url ? "bg-primary/15 text-primary" : ""
                  }`}
                >
                  <Link href={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
        
        <SidebarSeparator className="my-4 opacity-50" />
        
        <SidebarMenu className="px-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Customer Chat" isActive={pathname === "/chat"}>
              <Link href="/chat">
                <MessageSquare className="h-4 w-4" />
                <span>Customer Chat</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {isAgent && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Notifications" className="text-accent hover:bg-accent/10">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="New Ticket" className="text-primary hover:bg-primary/10">
                  <PlusCircle className="h-4 w-4" />
                  <span>Quick Ticket</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            {user ? (
               <div className="flex flex-col gap-2">
                 <SidebarMenuButton tooltip="Profile" className="group">
                    <AvatarFallback className="h-4 w-4 mr-2">{user.email?.[0] || user.uid[0]}</AvatarFallback>
                    <span className="truncate">{user.email || "Guest User"}</span>
                  </SidebarMenuButton>
                  {!user.isAnonymous && (
                    <SidebarMenuButton tooltip="Logout" onClick={handleLogout} className="text-destructive hover:bg-destructive/10">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </SidebarMenuButton>
                  )}
               </div>
            ) : (
              <SidebarMenuButton asChild tooltip="Login">
                <Link href="/login">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Agent Login</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function AvatarFallback({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold ${className}`}>
      {children}
    </div>
  )
}
