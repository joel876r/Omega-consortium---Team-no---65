
"use client"

import { useState } from "react"
import { 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  MessageSquare,
  Zap,
  Loader2,
  CheckCircle2,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { generateAgentResponseSuggestions } from "@/ai/flows/generate-agent-response-suggestions"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, orderBy, doc, updateDoc, deleteDoc, where } from "firebase/firestore"
import Link from "next/link"

export default function AgentDashboard() {
  const { user, isUserLoading: authLoading } = useUser()
  const firestore = useFirestore()
  
  const ticketsQuery = useMemoFirebase(() => {
    if (!user) return null;
    
    // If anonymous, the user is a customer. They should only see their own tickets.
    // We remove the orderBy to avoid needing a composite index for the prototype.
    if (user.isAnonymous) {
      return query(collection(firestore, 'tickets'), where('customerId', '==', user.uid))
    }
    
    // For regular users (agents/admins), fetch all tickets.
    return query(collection(firestore, 'tickets'), orderBy('createdAt', 'desc'))
  }, [firestore, user])
  
  const { data: tickets, isLoading: ticketsLoading } = useCollection(ticketsQuery)
  
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const selectedTicket = tickets?.find(t => t.id === selectedTicketId) || tickets?.[0]

  const handleGetSuggestions = async () => {
    if (!selectedTicket) return
    setIsGenerating(true)
    try {
      const res = await generateAgentResponseSuggestions({
        customerComplaintHistory: `Ticket for ${selectedTicket.customerName} (${selectedTicket.customerEmail})`,
        currentTicketContext: `Subject: ${selectedTicket.title}. Description: ${selectedTicket.description}`
      })
      setSuggestions(res.suggestions)
      toast({ title: "AI suggestions generated" })
    } catch (error) {
      toast({ variant: "destructive", title: "Error generating suggestions" })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await updateDoc(doc(firestore, 'tickets', id), { status: 'Resolved', updatedAt: new Date() })
      toast({ title: "Ticket Resolved" })
    } catch (e) {
      toast({ variant: "destructive", title: "Update failed" })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(firestore, 'tickets', id))
      toast({ title: "Ticket Removed" })
    } catch (e) {
      toast({ variant: "destructive", title: "Delete failed" })
    }
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Urgent': case 'Critical': return 'bg-destructive/20 text-destructive border-destructive/50'
      case 'High': return 'bg-orange-500/20 text-orange-500 border-orange-500/50'
      case 'Medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
      default: return 'bg-secondary text-muted-foreground'
    }
  }

  if (authLoading || (user && ticketsLoading)) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-background p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
          <p className="text-muted-foreground max-w-sm">Please sign in with your agent account to access the workspace.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 glow-primary">
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-6 border-b border-border bg-card/30 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {user.isAnonymous ? "My Tickets" : "Agent Workspace"}
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user.isAnonymous ? "Guest Session" : user.email}</p>
            <p className="text-xs text-muted-foreground">Active Session</p>
          </div>
          <Avatar className="h-9 w-9 border border-primary/20">
            <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100/100`} />
            <AvatarFallback>{(user.email?.[0] || 'G').toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-full md:w-80 lg:w-96 border-r border-border bg-card/20 overflow-y-auto flex flex-col">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">
                {user.isAnonymous ? "Your Reports" : "Active Tickets"} ({tickets?.length || 0})
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Filter className="h-4 w-4" /></Button>
            </div>
            
            <div className="space-y-3">
              {tickets?.map((ticket) => (
                <div 
                  key={ticket.id} 
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                    (selectedTicketId === ticket.id || (!selectedTicketId && ticket.id === tickets[0].id))
                      ? 'bg-primary/10 border-primary/40 glow-primary' 
                      : 'bg-card/50 border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{ticket.id.slice(-6)}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 truncate">{ticket.title}</h3>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="truncate max-w-[120px]">{ticket.customerName}</span>
                    <span className="flex items-center gap-1 shrink-0"><Clock className="w-3 h-3" /> Live</span>
                  </div>
                </div>
              ))}
              {!ticketsLoading && !tickets?.length && (
                <div className="p-8 text-center text-muted-foreground text-sm italic">No tickets found.</div>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-background p-6">
          {selectedTicket ? (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-primary uppercase">{selectedTicket.id.slice(-8)}</span>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{selectedTicket.category}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedTicket.title}</h2>
                </div>
                {!user.isAnonymous && (
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-border" onClick={() => handleDelete(selectedTicket.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                    {selectedTicket.status !== 'Resolved' && (
                      <Button 
                        onClick={() => handleResolve(selectedTicket.id)}
                        className="bg-primary hover:bg-primary/90 text-white glow-primary"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Resolve
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-card/40 border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" /> Complaint Context
                      </CardTitle>
                      <Badge variant="secondary" className="text-[10px]">{selectedTicket.status}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex gap-4">
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback>{selectedTicket.customerName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="bg-secondary p-4 rounded-2xl rounded-tl-none text-sm max-w-[80%]">
                          <p className="font-semibold text-xs mb-1 text-primary">{selectedTicket.customerName}</p>
                          {selectedTicket.description}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {!user.isAnonymous && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">AI Response Suggester</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleGetSuggestions}
                          disabled={isGenerating}
                          className="text-accent hover:text-accent/80 hover:bg-accent/10 h-8"
                        >
                          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                          Generate
                        </Button>
                      </div>
                      
                      {suggestions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 animate-fadeIn">
                          {suggestions.map((s, i) => (
                            <div key={i} className="p-4 rounded-xl bg-accent/5 border border-accent/20 hover:border-accent/50 transition-all cursor-pointer group">
                              <p className="text-sm text-foreground mb-2">{s}</p>
                              <div className="flex justify-end">
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-accent">Use Template</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card/20 text-sm text-muted-foreground">
                          Use AI to draft professional responses.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <Card className="bg-card/40 border-border">
                    <CardHeader><CardTitle className="text-sm font-semibold">Intelligence Analysis</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase text-muted-foreground font-bold">Sentiment: {selectedTicket.sentiment}</span>
                        <div className={`h-2 w-full rounded-full ${selectedTicket.sentiment === 'Negative' ? 'bg-destructive/30' : 'bg-green-500/30'}`}>
                           <div className={`h-full rounded-full ${selectedTicket.sentiment === 'Negative' ? 'bg-destructive' : 'bg-green-500'}`} style={{ width: '75%' }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase text-muted-foreground font-bold">Severity: {selectedTicket.severity}</span>
                        <div className="flex items-center gap-2">
                          <AlertCircle className={`h-4 w-4 ${selectedTicket.severity === 'Critical' ? 'text-destructive' : 'text-orange-500'}`} />
                          <span className="text-sm font-medium">{selectedTicket.severity}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground italic">Select a ticket to view details.</div>
          )}
        </main>
      </div>
    </div>
  )
}
