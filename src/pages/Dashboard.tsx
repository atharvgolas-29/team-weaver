import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, FolderOpen, GitMerge, TrendingUp, ArrowRight, ChevronRight, Loader2 } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getStats, getProjects, getStudents, type Stats, type Project, type Student } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export const Dashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, projectsData, studentsData] = await Promise.all([
          getStats(),
          getProjects("open"),
          getStudents(),
        ]);
        setStats(statsData);
        setProjects(projectsData.slice(0, 3)); // Show top 3 featured
        setStudents(studentsData.slice(0, 3)); // Show top 3 recent matches
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
          title: "Connection Error",
          description: "Unable to connect to backend. Using demo data.",
          variant: "destructive",
        });
        // Fallback to demo data
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
    }
    fetchData();
  }, [toast]);

  // Fallback demo projects if API returns empty
  const displayProjects = projects.length > 0 ? projects : [
    {
      id: "MSP-X7K2",
      title: "ML Stock Predictor",
      description: "Build a machine learning model to predict stock prices using LSTM networks",
      required_skills: ["Python", "TensorFlow", "Pandas"],
      team_size: 4,
      deadline: "Feb 15, 2026",
      creator_id: 1,
      status: "open",
    },
    {
      id: "CEP-M3N8",
      title: "Campus Event Portal",
      description: "Full-stack web app for managing university events with real-time notifications",
      required_skills: ["React", "Node.js", "MongoDB"],
      team_size: 5,
      deadline: "Mar 1, 2026",
      creator_id: 1,
      status: "open",
    },
    {
      id: "DVD-P5Q1",
      title: "Data Visualization Dashboard",
      description: "Interactive dashboard for visualizing COVID-19 data trends across regions",
      required_skills: ["D3.js", "SQL", "Python"],
      team_size: 3,
      deadline: "Feb 28, 2026",
      creator_id: 1,
      status: "open",
    },
  ];

  // Fallback demo matches
  const recentMatches = students.length > 0 
    ? students.map((s) => ({
        name: s.name,
        skill: s.skills[0]?.name ? `${s.skills[0].name} Expert` : "Developer",
        compatibility: Math.round(s.skills.reduce((acc, sk) => acc + sk.level, 0) / Math.max(s.skills.length, 1)),
      }))
    : [
        { name: "Priya Gupta", skill: "Python Expert", compatibility: 94 },
        { name: "Rahul Verma", skill: "React Developer", compatibility: 89 },
        { name: "Sneha Patel", skill: "ML Specialist", compatibility: 87 },
      ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="glass-card p-8 lg:p-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">New semester matching now live</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-5xl font-bold mb-4"
            >
              Find Your Perfect
              <span className="gradient-text"> Teammates</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground max-w-2xl mb-8"
            >
              Our AI-powered matching algorithm connects you with complementary skills
              and compatible schedules for maximum project success.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/matching">
                <Button className="btn-primary-glow flex items-center gap-2">
                  Start Matching
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/create-project">
                <Button variant="outline" className="btn-secondary-glass">
                  Create Project
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {loading ? (
          <div className="col-span-4 flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="Total Students"
              value={stats?.total_students?.toString() || "0"}
              trend={{ value: 12, positive: true }}
              delay={0.1}
            />
            <StatCard
              icon={<FolderOpen className="w-6 h-6" />}
              label="Projects Live"
              value={stats?.active_projects?.toString() || "0"}
              trend={{ value: 8, positive: true }}
              delay={0.2}
            />
            <StatCard
              icon={<GitMerge className="w-6 h-6" />}
              label="Matches Made"
              value={stats?.total_matches?.toString() || "0"}
              trend={{ value: 23, positive: true }}
              delay={0.3}
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="Avg Compatibility"
              value={`${stats?.avg_team_compatibility || 0}%`}
              trend={{ value: 5, positive: true }}
              delay={0.4}
            />
          </>
        )}
      </section>

      {/* Featured Projects & Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Featured Projects */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Featured Projects</h2>
            <Link
              to="/create-project"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {displayProjects.map((project, index) => (
              <GlassCard
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.required_skills.map((skill) => (
                        <SkillBadge key={skill} skill={skill} level="good" />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{project.team_size} members</span>
                    </div>
                    <span className="text-muted-foreground">{project.deadline}</span>
                    <Button size="sm" variant="outline" className="text-primary border-primary/30 hover:bg-primary/10">
                      Apply
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.section>

        {/* Recent Matches */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Matches</h2>
            <Link
              to="/matching"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentMatches.map((match, index) => (
              <GlassCard
                key={match.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-border">
                    <span className="font-semibold text-sm">
                      {match.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{match.name}</h4>
                    <p className="text-sm text-muted-foreground">{match.skill}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">
                      {match.compatibility}%
                    </span>
                    <p className="text-xs text-muted-foreground">match</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Dashboard;
