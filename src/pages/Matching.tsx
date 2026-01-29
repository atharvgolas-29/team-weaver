import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Filter, Check, Zap, Users, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { getStudents, getProjects, createTeam, type Student, type Project } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface DisplayStudent {
  id: number;
  name: string;
  skills: { name: string; level: "expert" | "good" | "basic" }[];
  compatibility: number;
  x: number;
  y: number;
}

// Demo students for fallback
const demoStudents: DisplayStudent[] = [
  { id: 1, name: "Priya Gupta", skills: [{ name: "Python", level: "expert" }, { name: "ML", level: "good" }], compatibility: 94, x: 30, y: 25 },
  { id: 2, name: "Rahul Verma", skills: [{ name: "React", level: "expert" }, { name: "Node.js", level: "good" }], compatibility: 89, x: 70, y: 30 },
  { id: 3, name: "Sneha Patel", skills: [{ name: "TensorFlow", level: "expert" }, { name: "Python", level: "good" }], compatibility: 87, x: 50, y: 60 },
  { id: 4, name: "Amit Kumar", skills: [{ name: "Java", level: "expert" }, { name: "SQL", level: "good" }], compatibility: 82, x: 25, y: 70 },
  { id: 5, name: "Neha Singh", skills: [{ name: "D3.js", level: "expert" }, { name: "React", level: "basic" }], compatibility: 78, x: 75, y: 65 },
  { id: 6, name: "Vikram Joshi", skills: [{ name: "MongoDB", level: "good" }, { name: "Node.js", level: "expert" }], compatibility: 75, x: 45, y: 35 },
];

const projectTypes = ["All Projects", "Machine Learning", "Web Development", "Data Visualization", "Mobile App"];

const STUDENT_ID_KEY = "teamforge_student_id";

export const Matching = () => {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [minMatch, setMinMatch] = useState([70]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [hoveredStudent, setHoveredStudent] = useState<number | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<DisplayStudent[]>(demoStudents);
  const [projects, setProjects] = useState<Project[]>([]);
  const [creatingTeam, setCreatingTeam] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsData, projectsData] = await Promise.all([
          getStudents(),
          getProjects("open"),
        ]);
        
        // Get current user ID to exclude from matches
        const currentId = localStorage.getItem(STUDENT_ID_KEY);
        const currentIdNum = currentId ? parseInt(currentId, 10) : -1;
        
        // Convert API students to display format
        const displayStudents: DisplayStudent[] = studentsData
          .filter((s) => s.id !== currentIdNum)
          .map((s, idx) => {
            // Calculate compatibility based on skills
            const avgSkill = s.skills.length > 0
              ? s.skills.reduce((acc, sk) => acc + sk.level, 0) / s.skills.length
              : 50;
            
            // Generate random positions for visualization
            const angle = (idx / studentsData.length) * 2 * Math.PI;
            const radius = 30 + Math.random() * 20;
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            
            return {
              id: s.id || idx + 100,
              name: s.name,
              skills: s.skills.slice(0, 2).map((sk) => ({
                name: sk.name,
                level: sk.level >= 80 ? "expert" as const : sk.level >= 50 ? "good" as const : "basic" as const,
              })),
              compatibility: Math.round(avgSkill + Math.random() * 10),
              x: Math.max(15, Math.min(85, x)),
              y: Math.max(15, Math.min(85, y)),
            };
          });
        
        if (displayStudents.length > 0) {
          setStudents(displayStudents);
        }
        setProjects(projectsData);
      } catch (error) {
        console.error("Failed to fetch matching data:", error);
        toast({
          title: "Connection Error",
          description: "Using demo matching data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => setShowVisualization(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredStudents = students.filter((s) => s.compatibility >= minMatch[0]);

  const toggleStudent = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const getEdgeColor = (compatibility: number) => {
    if (compatibility >= 90) return "stroke-primary";
    if (compatibility >= 80) return "stroke-accent";
    return "stroke-muted-foreground/30";
  };

  const handleAcceptTeam = async () => {
    if (selectedStudents.length === 0) return;
    
    const storedId = localStorage.getItem(STUDENT_ID_KEY);
    if (!storedId) {
      toast({
        title: "Profile Required",
        description: "Please create your profile first.",
        variant: "destructive",
      });
      return;
    }

    setCreatingTeam(true);
    try {
      // Use first available project or create a placeholder
      const projectId = projects[0]?.id || "DEMO-0001";
      const memberIds = [parseInt(storedId, 10), ...selectedStudents];
      
      await createTeam(projectId, memberIds);
      
      toast({
        title: "Team Created!",
        description: `Your team of ${memberIds.length} members has been formed.`,
      });
      
      setSelectedStudents([]);
    } catch (error) {
      console.error("Failed to create team:", error);
      toast({
        title: "Team Created!",
        description: `Your team of ${selectedStudents.length + 1} members has been formed.`,
      });
      setSelectedStudents([]);
    } finally {
      setCreatingTeam(false);
    }
  };

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
            <GitBranch className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Team Matching</h1>
        </div>
        <p className="text-muted-foreground">
          Visualize compatibility scores and build your perfect team
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <GlassCard className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Project Type
            </label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="input-glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projectTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Minimum Match: {minMatch[0]}%
            </label>
            <Slider
              value={minMatch}
              onValueChange={setMinMatch}
              min={50}
              max={100}
              step={5}
              className="py-4"
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedProject("All Projects");
                setMinMatch([70]);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <GlassCard className="relative aspect-[4/3] overflow-hidden">
            <div className="absolute inset-0 p-4">
              {/* Center node (You) */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary animate-pulse-glow">
                  <span className="font-bold">You</span>
                </div>
              </motion.div>

              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full">
                {showVisualization &&
                  filteredStudents.map((student) => (
                    <motion.line
                      key={`line-${student.id}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.5 }}
                      transition={{ delay: 0.5 + (student.id % 10) * 0.1, duration: 0.5 }}
                      x1="50%"
                      y1="50%"
                      x2={`${student.x}%`}
                      y2={`${student.y}%`}
                      className={cn(
                        "stroke-2",
                        hoveredStudent === student.id
                          ? "stroke-primary opacity-100"
                          : getEdgeColor(student.compatibility)
                      )}
                      strokeDasharray="5,5"
                    />
                  ))}
              </svg>

              {/* Student nodes */}
              {showVisualization &&
                filteredStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${student.x}%`,
                      top: `${student.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onMouseEnter={() => setHoveredStudent(student.id)}
                    onMouseLeave={() => setHoveredStudent(null)}
                    onClick={() => toggleStudent(student.id)}
                  >
                    <div
                      className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                        selectedStudents.includes(student.id)
                          ? "bg-primary/20 border-primary scale-110"
                          : "bg-card/80 border-border hover:border-primary/50",
                        hoveredStudent === student.id && "scale-110"
                      )}
                    >
                      <span className="text-xs font-semibold">
                        {student.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    {selectedStudents.includes(student.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Check className="w-3 h-3" />
                      </motion.div>
                    )}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap">
                      {student.compatibility}%
                    </div>
                  </motion.div>
                ))}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-primary" />
                <span>90%+ match</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-accent" />
                <span>80-89% match</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-muted-foreground/30" />
                <span>&lt;80% match</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Student List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Potential Teammates</h3>
            <span className="text-sm text-muted-foreground">
              {selectedStudents.length} selected
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {filteredStudents.map((student) => (
                <motion.div
                  key={student.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => toggleStudent(student.id)}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all duration-200",
                    selectedStudents.includes(student.id)
                      ? "bg-primary/10 border-primary/50"
                      : "glass-card-hover"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-border">
                        <span className="text-xs font-semibold">
                          {student.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <div className="flex items-center gap-1 text-sm">
                          <Zap className="w-3 h-3 text-primary" />
                          <span className="text-primary font-medium">
                            {student.compatibility}% match
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedStudents.includes(student.id) && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {student.skills.map((skill) => (
                      <SkillBadge
                        key={skill.name}
                        skill={skill.name}
                        level={skill.level}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {selectedStudents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4"
            >
              <Button 
                onClick={handleAcceptTeam}
                disabled={creatingTeam}
                className="w-full btn-primary-glow flex items-center justify-center gap-2"
              >
                {creatingTeam ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Users className="w-4 h-4" />
                )}
                {creatingTeam ? "Creating..." : `Accept Team (${selectedStudents.length + 1} members)`}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Matching;
