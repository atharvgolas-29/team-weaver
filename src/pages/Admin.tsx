import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users, GitMerge, TrendingUp, BarChart3, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { getStats, getTeams, getProjects, getStudents, type Stats, type Team, type Project } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const matchData = [
  { week: "W1", success: 85, total: 20 },
  { week: "W2", success: 88, total: 24 },
  { week: "W3", success: 92, total: 28 },
  { week: "W4", success: 90, total: 32 },
  { week: "W5", success: 94, total: 35 },
  { week: "W6", success: 96, total: 40 },
];

const teamBalanceData = [
  { name: "Balanced", value: 65, color: "#22c55e" },
  { name: "Slightly Imbalanced", value: 25, color: "#f59e0b" },
  { name: "Needs Review", value: 10, color: "#ef4444" },
];

export const Admin = () => {
  const { toast } = useToast();
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skillDistribution, setSkillDistribution] = useState([
    { skill: "Python", count: 89, color: "#06b6d4" },
    { skill: "React", count: 76, color: "#a855f7" },
    { skill: "Java", count: 65, color: "#22c55e" },
    { skill: "SQL", count: 58, color: "#f59e0b" },
    { skill: "ML/AI", count: 45, color: "#ef4444" },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, teamsData, projectsData, studentsData] = await Promise.all([
        getStats(),
        getTeams(),
        getProjects(),
        getStudents(),
      ]);
      
      setStats(statsData);
      setTeams(teamsData);
      setProjects(projectsData);

      // Calculate skill distribution from students
      const skillCounts: Record<string, number> = {};
      studentsData.forEach((student) => {
        student.skills.forEach((skill) => {
          skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
        });
      });

      const colors = ["#06b6d4", "#a855f7", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"];
      const distribution = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skill, count], idx) => ({
          skill,
          count,
          color: colors[idx % colors.length],
        }));

      if (distribution.length > 0) {
        setSkillDistribution(distribution);
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      toast({
        title: "Connection Error",
        description: "Using demo analytics data.",
        variant: "destructive",
      });
      // Keep default demo data
      setStats({
        total_students: 245,
        active_projects: 12,
        total_teams: 156,
        total_matches: 156,
        avg_team_compatibility: 94,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Build recent matches from teams and projects
  const recentMatches = teams.length > 0
    ? teams.slice(0, 5).map((team, idx) => {
        const project = projects.find((p) => p.id === team.project_id);
        return {
          id: team.id || idx + 1,
          project: project?.title || team.project_id,
          members: team.members.length,
          score: Math.round(team.compatibility_score),
          status: team.compatibility_score >= 85 ? "active" : team.compatibility_score >= 70 ? "pending" : "conflict",
        };
      })
    : [
        { id: 1, project: "ML Stock Predictor", members: 4, score: 94, status: "active" },
        { id: 2, project: "Campus Event Portal", members: 5, score: 89, status: "pending" },
        { id: 3, project: "Data Viz Dashboard", members: 3, score: 87, status: "active" },
        { id: 4, project: "IoT Weather Station", members: 4, score: 82, status: "conflict" },
        { id: 5, project: "E-Commerce Platform", members: 5, score: 91, status: "active" },
      ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground">
          Monitor system performance and manage team allocations
        </p>
      </motion.div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Active Students"
          value={stats?.total_students?.toString() || "0"}
          trend={{ value: 12, positive: true }}
          delay={0.1}
        />
        <StatCard
          icon={<GitMerge className="w-6 h-6" />}
          label="Total Matches"
          value={stats?.total_matches?.toString() || "0"}
          trend={{ value: 18, positive: true }}
          delay={0.2}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Success Rate"
          value={`${stats?.avg_team_compatibility || 0}%`}
          trend={{ value: 3, positive: true }}
          delay={0.3}
        />
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          label="Active Projects"
          value={stats?.active_projects?.toString() || "0"}
          trend={{ value: 2, positive: true }}
          delay={0.4}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Match Success Rate Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard>
            <h3 className="text-lg font-semibold mb-6">Match Success Rate</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={matchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[70, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="success"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Team Balance Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard>
            <h3 className="text-lg font-semibold mb-6">Team Skill Balance</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={teamBalanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {teamBalanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {teamBalanceData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Skill Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-8"
      >
        <GlassCard>
          <h3 className="text-lg font-semibold mb-6">Skill Distribution Across Students</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="skill" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={60} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {skillDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* Recent Matches Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Matches</h3>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={fetchData}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Project</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Members</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Match Score</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentMatches.map((match, index) => (
                  <motion.tr
                    key={match.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.05 }}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium">{match.project}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{match.members}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={match.score} className="w-16 h-2" />
                        <span className="text-sm font-medium text-primary">{match.score}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded-full capitalize",
                          match.status === "active" && "bg-success/10 text-success",
                          match.status === "pending" && "bg-warning/10 text-warning",
                          match.status === "conflict" && "bg-destructive/10 text-destructive"
                        )}
                      >
                        {match.status === "conflict" && (
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                        )}
                        {match.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setSelectedMatch(match.id)}
                      >
                        Override
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Admin;
