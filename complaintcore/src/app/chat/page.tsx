
"use client"

import { useState, useRef, useEffect } from "react"
import { Send, User, Bot, Sparkles, Loader2, Mic, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { analyzeIncomingComplaint } from "@/ai/flows/analyze-incoming-complaint"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useUser, useAuth } from "@/firebase"
import { collection, serverTimestamp } from "firebase/firestore"
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates"

type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type ChatFlowStep = 'ask_name' | 'ask_email' | 'ask_issue' | 'ask_details' | 'confirm_ticket' | 'done'

export default function CustomerChatPage() {
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Welcome to ComplaintCore AI. I'm here to help you resolve your issues. First, could you tell me your full name?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<ChatFlowStep>('ask_name')
  
  // Collected data
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    issue: '',
    details: '',
  })
  
  const [analysis, setAnalysis] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const firestore = useFirestore()
  const auth = useAuth()
  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    // Automatically sign in anonymously if not logged in
    if (!user) {
      initiateAnonymousSignIn(auth)
    }
  }, [user, auth])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg = input.trim()
    const newUserMessage: Message = { role: 'user', content: userMsg, timestamp: new Date() }
    setMessages(prev => [...prev, newUserMessage])
    setInput("")
    setIsLoading(true)

    let nextStep: ChatFlowStep = step
    let responseText = ""

    try {
      if (step === 'ask_name') {
        setUserData(prev => ({ ...prev, name: userMsg }))
        responseText = `Thanks, ${userMsg}! What is your email address?`
        nextStep = 'ask_email'
      } 
      else if (step === 'ask_email') {
        if (!userMsg.includes('@')) {
          responseText = "That doesn't look like a valid email. Please provide a valid email address."
        } else {
          setUserData(prev => ({ ...prev, email: userMsg }))
          responseText = "Got it. Please describe the main issue you're experiencing in a few words."
          nextStep = 'ask_issue'
        }
      } 
      else if (step === 'ask_issue') {
        setUserData(prev => ({ ...prev, issue: userMsg }))
        responseText = "I see. Could you provide a few more details about what happened or how this is affecting you?"
        nextStep = 'ask_details'
      } 
      else if (step === 'ask_details') {
        setUserData(prev => ({ ...prev, details: userMsg }))
        
        // Analyze the full context
        const fullComplaint = `${userData.issue}. Details: ${userMsg}`
        const aiAnalysis = await analyzeIncomingComplaint({ complaintText: fullComplaint })
        setAnalysis(aiAnalysis)

        responseText = `I've analyzed your request. I classify this as a "${aiAnalysis.category}" issue with "${aiAnalysis.severity}" severity. Should I generate a formal support ticket for you? (Yes/No)`
        nextStep = 'confirm_ticket'
      } 
      else if (step === 'confirm_ticket') {
        if (userMsg.toLowerCase().includes('yes')) {
          if (!user) {
            toast({ variant: "destructive", title: "Authentication Required", description: "Waiting for secure connection..." })
            setIsLoading(false)
            return
          }

          const ticketData = {
            title: userData.issue,
            description: userData.details,
            customerName: userData.name,
            customerEmail: userData.email,
            customerId: user.uid, // Required by security rules
            status: 'New',
            priority: analysis?.priority || 'Medium',
            severity: analysis?.severity || 'Medium',
            category: analysis?.category || 'General',
            sentiment: analysis?.sentiment || 'Neutral',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }

          // Use non-blocking write
          addDocumentNonBlocking(collection(firestore, 'tickets'), ticketData)
          
          responseText = "Perfect! Your ticket has been generated and assigned to a specialist. They will contact you shortly via email. Is there anything else?"
          nextStep = 'done'
          toast({ title: "Ticket Generated", description: "Successfully created in the system." })
        } else {
          responseText = "No problem. I'll keep our session active if you have other questions. How can I help?"
          nextStep = 'done'
        }
      } else {
        responseText = "I'm always here to help. What's on your mind?"
      }

      setStep(nextStep)
      setMessages(prev => [...prev, { role: 'assistant', content: responseText, timestamp: new Date() }])
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMic = () => {
    toast({ title: "Voice Input", description: "Voice recognition activated (Simulated)." })
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-6 border-b border-border bg-card/50 flex justify-between items-center ios-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center glow-primary">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Complaint Assistance</h1>
            <p className="text-xs text-accent flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Step: {step.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {analysis && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold">
               AI Analysis Active
            </div>
          )}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 animate-slideIn ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-secondary' : 'bg-primary/20 text-primary'
              }`}>
                {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>
              <Card className={`p-4 max-w-[80%] rounded-2xl shadow-lg border-border ${
                msg.role === 'user' ? 'bg-primary text-white border-none glow-primary' : 'bg-card text-foreground'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-2 opacity-60 ${msg.role === 'user' ? 'text-white' : 'text-muted-foreground'}`}>
                  {mounted ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                </p>
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <Card className="p-4 rounded-2xl bg-card border-border flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground italic">Processing...</span>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-border bg-card/50 ios-blur">
        <div className="max-w-4xl mx-auto flex gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMic}
            className="h-12 w-12 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Input 
            placeholder="Type your answer here..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="h-12 bg-secondary border-none focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 glow-primary text-white shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <div className="max-w-4xl mx-auto flex justify-center gap-4 mt-4">
           {step === 'confirm_ticket' && (
             <>
               <Button variant="outline" size="sm" onClick={() => { setInput("Yes"); handleSend(); }} className="rounded-full border-primary/20 text-primary hover:bg-primary/10">Yes, create ticket</Button>
               <Button variant="outline" size="sm" onClick={() => { setInput("No"); handleSend(); }} className="rounded-full border-border">No, just chat</Button>
             </>
           )}
        </div>
      </div>
    </div>
  )
}
