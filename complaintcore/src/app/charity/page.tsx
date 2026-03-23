"use client"

import { Heart, Gift, Users, Globe, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export default function CharityPage() {
  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8 text-center py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
          <Heart className="w-4 h-4 fill-primary" />
          <span>Support & Impact</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Giving Back with AI</h1>
        <p className="text-lg text-muted-foreground">Every ticket resolved through ComplaintCore contributes to our global community fund for social impact.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            title: "Tech for Good", 
            description: "Bridging the digital divide in underserved communities.",
            raised: 12400,
            goal: 20000,
            icon: Globe
          },
          { 
            title: "Support Education", 
            description: "Providing resources for the next generation of AI engineers.",
            raised: 8500,
            goal: 10000,
            icon: Users
          },
          { 
            title: "Disaster Relief", 
            description: "Fast-tracked support for NGOs in crisis areas.",
            raised: 45000,
            goal: 50000,
            icon: Heart
          }
        ].map((cause, i) => (
          <Card key={i} className="bg-card/50 border-border hover:bg-card transition-all group ios-blur">
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:glow-primary transition-all">
                <cause.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-white">{cause.title}</CardTitle>
              <CardDescription>{cause.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>${cause.raised.toLocaleString()} Raised</span>
                  <span>Goal: ${cause.goal.toLocaleString()}</span>
                </div>
                <Progress value={(cause.raised / cause.goal) * 100} className="h-2" />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white glow-primary">
                Donate Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
