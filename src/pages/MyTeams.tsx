import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MessageCircle, CheckCircle, Clock, AlertCircle, X, ThumbsUp, ThumbsDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const teams = [
  {
    id: 1,
    projectName: "ML Stock Predictor",
    projectId: "MSP-X7K2",
    status: "active",
    progress: 65,
    members: [
      { name: "Arjun Sharma", role: "ML Engineer", skills: ["Python", "TensorFlow"], skillLevel: 85 },
      { name: "Priya Gupta", role: "Data Analyst", skills: ["Pandas", "SQL"], skillLevel: 90 },
      { name: "Rahul Verma", role: "Backend Dev", skills: ["Node.js", "MongoDB"], skillLevel: 75 },
      { name: "Sneha Patel", role: "Frontend Dev", skills: ["React", "D3.js"], skillLevel: 80 },
    ],
    timeline: [
      { phase: "Research", status: "completed", date: "Jan 15" },
      { phase: "Data Collection", status: "completed", date: "Jan 25" },
      { phase: "Model Training", status: "current", date: "Feb 5" },
      { phase: "Testing", status: "upcoming", date: "Feb 15" },
      { phase: "Deployment", status: "upcoming", date: "Feb 25" },
    ],
  },
  {
    id: 2,
    projectName: "Campus Event Portal",
    projectId: "CEP-M3N8",
    status: "planning",
    progress: 20,
    members: [
      { name: "Arjun Sharma", role: "Full Stack Dev", skills: ["React", "Node.js"], skillLevel: 80 },
      { name: "Amit Kumar", role: "UI Designer", skills: ["Figma", "CSS"], skillLevel: 85 },
      { name: "Neha Singh", role: "Backend Dev", skills: ["Python", "PostgreSQL"], skillLevel: 70 },
    ],
    timeline: [
      { phase: "Planning", status: "current", date: "Jan 20" },
      { phase: "Design", status: "upcoming", date: "Feb 1" },
      { phase: "Development", status: "upcoming", date: "Feb 15" },
      { phase: "Testing", status: "upcoming", date: "Mar 1" },
    ],
  },
];

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConflictModal = ({ isOpen, onClose }: ConflictModalProps) => {
  const [votes, setVotes] = useState<Record<string, boolean>>({});

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Conflict Resolution</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm font-medium text-warning mb-2">
                  Schedule Conflict Detected
                </p>
                <p className="text-sm text-muted-foreground">
                  Team meeting time conflicts with 2 members' availability.
                  Vote for your preferred time slot.
                </p>
              </div>

              <div className="space-y-3">
                {["Monday 4 PM", "Wednesday 6 PM", "Saturday 10 AM"].map((option) => (
                  <div
                    key={option}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <span className="font-medium">{option}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={votes[option] === true ? "default" : "outline"}
                        onClick={() => setVotes({ ...votes, [option]: true })}
                        className="h-8"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={votes[option] === false ? "destructive" : "outline"}
                        onClick={() => setVotes({ ...votes, [option]: false })}
                        className="h-8"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button className="btn-primary-glow">Submit Vote</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MyTeams = () => {
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">My Teams</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your project teams and track progress
        </p>
      </motion.div>

      <div className="space-y-8">
        {teams.map((team, teamIndex) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: teamIndex * 0.1 }}
          >
            <GlassCard className="space-y-6">
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold">{team.projectName}</h2>
                    <span className="px-2 py-1 text-xs font-mono bg-secondary rounded">
                      {team.projectId}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full capitalize",
                        team.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      )}
                    >
                      {team.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {team.members.length} members
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {team.progress}% complete
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConflictModal(true)}
                    className="flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-warning" />
                    Resolve Conflicts
                  </Button>
                  <Button size="sm" className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20">
                    <MessageCircle className="w-4 h-4" />
                    Team Chat
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <Progress value={team.progress} className="h-2" />
              </div>

              {/* Team Members */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  Team Members
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {team.members.map((member, index) => (
                    <motion.div
                      key={member.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="p-4 rounded-lg bg-secondary/30 border border-border"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-border">
                          <span className="text-xs font-semibold">
                            {member.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {member.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="skill-bar">
                        <div
                          className="skill-bar-fill"
                          style={{ width: `${member.skillLevel}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  Project Timeline
                </h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {team.timeline.map((phase, index) => (
                    <div key={phase.phase} className="flex items-center">
                      <div
                        className={cn(
                          "flex flex-col items-center px-4 py-3 rounded-lg min-w-[120px]",
                          phase.status === "completed" && "bg-success/10",
                          phase.status === "current" && "bg-primary/10 border border-primary/30",
                          phase.status === "upcoming" && "bg-secondary/30"
                        )}
                      >
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center mb-2",
                            phase.status === "completed" && "bg-success text-success-foreground",
                            phase.status === "current" && "bg-primary text-primary-foreground animate-pulse",
                            phase.status === "upcoming" && "bg-muted text-muted-foreground"
                          )}
                        >
                          {phase.status === "completed" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>
                        <p className="text-sm font-medium whitespace-nowrap">{phase.phase}</p>
                        <p className="text-xs text-muted-foreground">{phase.date}</p>
                      </div>
                      {index < team.timeline.length - 1 && (
                        <div
                          className={cn(
                            "w-8 h-0.5",
                            phase.status === "completed" ? "bg-success" : "bg-border"
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <ConflictModal
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
      />
    </div>
  );
};

export default MyTeams;
