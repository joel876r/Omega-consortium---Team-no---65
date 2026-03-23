"use client"

import { 
  Shield, 
  Settings, 
  Zap, 
  Database, 
  Key, 
  Activity, 
  Server,
  Lock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function AdminPage() {
  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground">Manage core infrastructure, security, and global AI parameters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" /> AI System Controls
              </CardTitle>
              <CardDescription>Configure how GenAI flows behave across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Automatic Sentiment Analysis</Label>
                  <p className="text-sm text-muted-foreground">Analyze all incoming tickets for sentiment immediately.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Proactive Agent Suggestions</Label>
                  <p className="text-sm text-muted-foreground">Suggest response drafts automatically on ticket open.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Initial Chatbot Self-Service</Label>
                  <p className="text-sm text-muted-foreground">Allow AI to attempt ticket resolution before assigning humans.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" /> Security Policies
              </CardTitle>
              <CardDescription>Global access rules and authentication requirements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enforce Multi-Factor Auth</Label>
                  <p className="text-sm text-muted-foreground">Require all agent and admin accounts to use MFA.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Data Anonymization</Label>
                  <p className="text-sm text-muted-foreground">Scrub PII from complaint text before sending to AI flows.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-sm">Health Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Core Services", status: "Operational", color: "text-green-500" },
                { label: "GenAI Pipeline", status: "Active", color: "text-green-500" },
                { label: "Real-time Socket", status: "Operational", color: "text-green-500" },
                { label: "DB Primary Cluster", status: "Under Load", color: "text-yellow-500" },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground">{s.label}</span>
                   <Badge variant="outline" className={s.color}>{s.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start border-border bg-transparent">
                <Key className="w-4 h-4 mr-2" /> API Key Management
              </Button>
              <Button variant="outline" className="w-full justify-start border-border bg-transparent">
                <Database className="w-4 h-4 mr-2" /> Backup Databases
              </Button>
              <Button variant="outline" className="w-full justify-start border-border bg-transparent">
                <Activity className="w-4 h-4 mr-2" /> Audit System Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
