"use client"

import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Star, 
  BadgeCheck,
  UserPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const AGENTS = [
  { id: 1, name: "Alice Smith", role: "Senior Agent", skills: ["Billing", "Tech Support"], status: "Online", email: "alice@complaintcore.ai" },
  { id: 2, name: "Bob Johnson", role: "Agent", skills: ["Returns", "Billing"], status: "Away", email: "bob@complaintcore.ai" },
  { id: 3, name: "Charlie Brown", role: "Support Specialist", skills: ["Hardware", "Software"], status: "Busy", email: "charlie@complaintcore.ai" },
  { id: 4, name: "Diana Prince", role: "Supervisor", skills: ["Escalations", "Legal"], status: "Online", email: "diana@complaintcore.ai" },
  { id: 5, name: "Eve Adams", role: "Agent", skills: ["Account Management"], status: "Offline", email: "eve@complaintcore.ai" },
]

export default function UserManagementPage() {
  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Directory</h1>
          <p className="text-muted-foreground">Manage your support team, their specialized skills, and roles.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white glow-primary">
          <UserPlus className="w-4 h-4 mr-2" /> Invite New Agent
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input className="pl-10 h-12 bg-card border-border" placeholder="Search by name, email, or skill..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AGENTS.map((agent) => (
          <Card key={agent.id} className="bg-card/50 border-border transition-all hover:bg-card hover:border-primary/30 group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Avatar className="h-14 w-14 border-2 border-primary/20">
                  <AvatarImage src={`https://picsum.photos/seed/${agent.id}/100/100`} />
                  <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <Badge variant="outline" className={`${
                  agent.status === 'Online' ? 'text-green-500 border-green-500/30 bg-green-500/10' :
                  agent.status === 'Away' ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10' :
                  'text-muted-foreground border-border'
                }`}>
                  {agent.status}
                </Badge>
              </div>
              
              <div className="space-y-1 mb-4">
                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{agent.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-accent" /> {agent.role}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {agent.email}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expertise</p>
                <div className="flex flex-wrap gap-1.5">
                  {agent.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] bg-secondary border-none">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs border-border">Edit Profile</Button>
                <Button variant="outline" size="sm" className="h-8 text-xs border-border text-destructive hover:bg-destructive/10">Disable Access</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
