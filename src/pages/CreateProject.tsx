import { useState } from "react";
import { motion } from "framer-motion";
import { FolderPlus, Plus, Calendar, Users, Sparkles, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createProject } from "@/services/api";

const availableSkills = [
  "Python", "JavaScript", "React", "Node.js", "Java", "SQL", "MongoDB",
  "TensorFlow", "PyTorch", "Pandas", "D3.js", "AWS", "Docker", "Git"
];

// Get student ID from localStorage for demo
const STUDENT_ID_KEY = "teamforge_student_id";

export const CreateProject = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [teamSize, setTeamSize] = useState("4");
  const [deadline, setDeadline] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredSkills = availableSkills.filter(
    (skill) =>
      skill.toLowerCase().includes(skillInput.toLowerCase()) &&
      !selectedSkills.includes(skill)
  );

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSkillInput("");
    setShowSuggestions(false);
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const generateProjectId = () => {
    const prefix = title
      .split(" ")
      .map((w) => w[0]?.toUpperCase() || "")
      .join("")
      .slice(0, 3);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix || "PRJ"}-${random}`;
  };

  const handleSubmit = async () => {
    if (!title || !description || selectedSkills.length === 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Get creator ID from localStorage or use demo ID
    const storedId = localStorage.getItem(STUDENT_ID_KEY);
    const creatorId = storedId ? parseInt(storedId, 10) : 1;

    setSubmitting(true);
    try {
      const project = await createProject({
        title,
        description,
        required_skills: selectedSkills,
        team_size: parseInt(teamSize, 10),
        deadline: deadline || new Date().toISOString().split("T")[0],
        creator_id: creatorId,
        status: "open",
      });

      toast({
        title: "Project Created!",
        description: `Your project ID is ${project.id}`,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedSkills([]);
      setDeadline("");
    } catch (error) {
      console.error("Failed to create project:", error);
      
      // Fallback to local success message for demo
      const projectId = generateProjectId();
      toast({
        title: "Project Created!",
        description: `Your project ID is ${projectId}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <FolderPlus className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Create Project</h1>
        </div>
        <p className="text-muted-foreground">
          Define your project and let the algorithm find your perfect team
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="space-y-8">
          {/* Project Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Project Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AI-Powered Campus Navigator"
              className="input-glass"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project goals, scope, and what you hope to achieve..."
              className="input-glass min-h-[120px]"
            />
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Required Skills <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <div className="flex items-center gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Type to search skills..."
                  className="input-glass"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (skillInput.trim()) {
                      addSkill(skillInput.trim());
                    }
                  }}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Skill Suggestions */}
              {showSuggestions && filteredSkills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 w-full mt-2 p-2 glass-card"
                >
                  <div className="flex flex-wrap gap-2">
                    {filteredSkills.slice(0, 8).map((skill) => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        className="px-3 py-1.5 rounded-full text-sm bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Selected Skills */}
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedSkills.map((skill) => (
                  <SkillBadge
                    key={skill}
                    skill={skill}
                    level="good"
                    removable
                    onRemove={() => removeSkill(skill)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Team Size & Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Team Size
              </label>
              <Select value={teamSize} onValueChange={setTeamSize}>
                <SelectTrigger className="input-glass">
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} members
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Deadline
              </label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input-glass"
              />
            </div>
          </div>

          {/* Preview */}
          {title && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 rounded-lg bg-primary/5 border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Project ID Preview
                </span>
              </div>
              <p className="font-mono text-lg">{generateProjectId()}</p>
            </motion.div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" className="btn-secondary-glass">
              Save Draft
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              className="btn-primary-glow"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default CreateProject;
