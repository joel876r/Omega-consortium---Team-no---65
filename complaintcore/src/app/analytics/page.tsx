
"use client"

import { 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Loader2,
  ShieldAlert
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query } from "firebase/firestore"
import Link from "next/link"

const COLORS = ['#3B82F6', '#1ECED4', '#6366f1', '#a855f7']

export default function AnalyticsPage() {
  const { user, isUserLoading: authLoading } = useUser()
  const firestore = useFirestore()
  
  const ticketsQuery = useMemoFirebase(() => {
    // If not logged in or anonymous (customer), don't perform the collection-wide list
    if (!user || user.isAnonymous) return null;
    return query(collection(firestore, 'tickets'))
  }, [firestore, user])
  
  const { data: tickets, isLoading } = useCollection(ticketsQuery)

  if (authLoading || (user && isLoading)) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
  }

  // Restrict access for unauthenticated or guest users
  if (!user || user.isAnonymous) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-background p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-accent" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Analytics Restricted</h2>
          <p className="text-muted-foreground max-w-sm">Detailed system metrics are only available to authorized agents.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 glow-primary">
          <Link href="/login">Sign In to View</Link>
        </Button>
      </div>
    )
  }

  const total = tickets?.length || 0
  const resolved = tickets?.filter(t => t.status === 'Resolved').length || 0
  const open = total - resolved
  const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : "0"

  // Simple category count
  const catMap: Record<string, number> = {}
  tickets?.forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + 1
  })
  const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }))

  const trendData = [
    { name: 'Mon', total: Math.floor(total * 0.1), resolved: Math.floor(resolved * 0.1) },
    { name: 'Tue', total: Math.floor(total * 0.2), resolved: Math.floor(resolved * 0.15) },
    { name: 'Wed', total: Math.floor(total * 0.4), resolved: Math.floor(resolved * 0.3) },
    { name: 'Thu', total: Math.floor(total * 0.6), resolved: Math.floor(resolved * 0.5) },
    { name: 'Fri', total: total, resolved: resolved },
  ]

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-white">System Intelligence</h1>
          <p className="text-muted-foreground">Aggregated ticket performance from live database.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="ios-blur border-border bg-card">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Tickets", value: total.toString(), change: "+10%", icon: TrendingUp, positive: true },
          { title: "Open Tickets", value: open.toString(), change: "-5%", icon: Clock, positive: true },
          { title: "Resolution Rate", value: `${resolutionRate}%`, change: "+2.1%", icon: CheckCircle2, positive: true },
          { title: "Live Specialists", value: "12", change: "0", icon: Users, positive: null },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/50 border-border overflow-hidden relative ios-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs mt-1 flex items-center gap-1">
                {stat.positive ? <ArrowUpRight className="w-3 h-3 text-green-500" /> : <ArrowDownRight className="w-3 h-3 text-destructive" />}
                <span className={stat.positive ? 'text-green-500' : 'text-destructive'}>{stat.change}</span>
                <span className="text-muted-foreground">vs last period</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 border-border ios-blur">
          <CardHeader>
            <CardTitle>System Load</CardTitle>
            <CardDescription>Live volume tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2f3a" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="total" stroke="#3B82F6" fillOpacity={1} fill="url(#colorTotal)" />
                  <Area type="monotone" dataKey="resolved" stroke="#1ECED4" fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border ios-blur">
          <CardHeader><CardTitle>Distribution</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 w-full mt-4">
              {categoryData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
