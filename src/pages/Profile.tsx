import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Save, Calendar, Clock, BookOpen, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createStudent, updateStudent, getStudent, type Student, type Skill } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const defaultSkills = [
  { name: "Python/Pandas", level: 50 },
  { name: "LeetCode", level: 50 },
  { name: "Java", level: 50 },
  { name: "SQL", level: 50 },
  { name: "React", level: 50 },
  { name: "Machine Learning", level: 50 },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeSlots = ["Morning", "Afternoon", "Evening"];

const projectPreferences = [
  { id: "ml", label: "Machine Learning" },
  { id: "dataviz", label: "Data Visualization" },
  { id: "webdev", label: "Web Development" },
  { id: "mobile", label: "Mobile App" },
  { id: "iot", label: "IoT Project" },
  { id: "gamedev", label: "Game Development" },
];

// Store student ID in localStorage for demo purposes
const STUDENT_ID_KEY = "teamforge_student_id";

export const Profile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);
  
  // Form fields
  const [name, setName] = useState("Arjun Sharma");
  const [email, setEmail] = useState("arjun.sharma@gla.ac.in");
  const [year, setYear] = useState("3rd Year");
  const [section, setSection] = useState("A");
  
  const [skillLevels, setSkillLevels] = useState(
    defaultSkills.reduce((acc, skill) => ({ ...acc, [skill.name]: skill.level }), {} as Record<string, number>)
  );
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>(["ml", "webdev"]);

  // Load existing student data
  useEffect(() => {
    const storedId = localStorage.getItem(STUDENT_ID_KEY);
    if (storedId) {
      const id = parseInt(storedId, 10);
      setStudentId(id);
      loadStudentData(id);
    }
  }, []);

  const loadStudentData = async (id: number) => {
    setLoading(true);
    try {
      const student = await getStudent(id);
      setName(student.name);
      setEmail(student.email);
      setYear(student.year);
      setSection(student.section);
      setAvailability(student.availability);
      setSelectedPrefs(student.preferences);
      
      // Map skills to skill levels
      const levels: Record<string, number> = {};
      student.skills.forEach((skill) => {
        levels[skill.name] = skill.level;
      });
      setSkillLevels((prev) => ({ ...prev, ...levels }));
    } catch (error) {
      console.error("Failed to load student:", error);
      // Student might not exist, that's okay
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = (day: string, slot: string) => {
    const key = `${day}-${slot}`;
    setAvailability((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getSkillLabel = (value: number) => {
    if (value >= 80) return { text: "Expert", color: "text-primary" };
    if (value >= 50) return { text: "Good", color: "text-accent" };
    return { text: "Basic", color: "text-muted-foreground" };
  };

  const handleSave = async () => {
    if (!name || !email) {
      toast({
        title: "Missing fields",
        description: "Please fill in your name and email",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Convert skill levels to Skill array
      const skills: Skill[] = Object.entries(skillLevels).map(([name, level]) => ({
        name,
        level,
      }));

      const studentData = {
        name,
        email,
        year,
        section,
        skills,
        availability,
        preferences: selectedPrefs,
      };

      let savedStudent: Student;
      if (studentId) {
        savedStudent = await updateStudent(studentId, studentData);
      } else {
        savedStudent = await createStudent(studentData);
        if (savedStudent.id) {
          localStorage.setItem(STUDENT_ID_KEY, savedStudent.id.toString());
          setStudentId(savedStudent.id);
        }
      }

      toast({
        title: "Profile Saved!",
        description: studentId ? "Your profile has been updated." : "Your profile has been created.",
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({
        title: "Save Failed",
        description: "Unable to save profile. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Update your skills and availability to get better team matches
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="text-center" gradient>
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border-4 border-border mx-auto">
                <span className="text-4xl font-bold">
                  {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="input-glass text-center"
              />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="input-glass text-center"
                type="email"
              />
              <div className="flex gap-2">
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="input-glass">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={section} onValueChange={setSection}>
                  <SelectTrigger className="input-glass">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                    <SelectItem value="D">Section D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {Object.entries(skillLevels)
                .filter(([, level]) => level >= 70)
                .slice(0, 3)
                .map(([name, level]) => (
                  <SkillBadge 
                    key={name} 
                    skill={name.split("/")[0]} 
                    level={level >= 80 ? "expert" : "good"} 
                  />
                ))}
            </div>
            
            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {Object.values(skillLevels).filter((l) => l >= 70).length}
                  </p>
                  <p className="text-muted-foreground">Skills 70%+</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">
                    {Object.values(availability).filter(Boolean).length}
                  </p>
                  <p className="text-muted-foreground">Time Slots</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Skills & Expertise</h3>
            </div>
            <div className="space-y-6">
              {defaultSkills.map((skill) => {
                const level = skillLevels[skill.name] || 50;
                const label = getSkillLabel(level);
                return (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{skill.name}</span>
                      <span className={cn("text-sm font-medium", label.color)}>
                        {label.text}
                      </span>
                    </div>
                    <Slider
                      value={[level]}
                      onValueChange={([value]) =>
                        setSkillLevels((prev) => ({ ...prev, [skill.name]: value }))
                      }
                      max={100}
                      step={5}
                      className="py-2"
                    />
                    <div className="skill-bar mt-2">
                      <motion.div
                        className="skill-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${level}%` }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Availability Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent/10">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Availability Schedule</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                    </th>
                    {weekDays.map((day) => (
                      <th
                        key={day}
                        className="p-2 text-center text-sm font-medium text-muted-foreground"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot}>
                      <td className="p-2 text-sm text-muted-foreground whitespace-nowrap">
                        {slot}
                      </td>
                      {weekDays.map((day) => {
                        const key = `${day}-${slot}`;
                        const isAvailable = availability[key];
                        return (
                          <td key={key} className="p-1">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleAvailability(day, slot)}
                              className={cn(
                                "w-full h-10 rounded-lg border transition-all",
                                isAvailable
                                  ? "bg-primary/20 border-primary/50 text-primary"
                                  : "bg-secondary/30 border-border hover:border-primary/30"
                              )}
                            >
                              {isAvailable && "✓"}
                            </motion.button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Click cells to toggle your availability for team meetings
            </p>
          </GlassCard>
        </motion.div>

        {/* Project Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Project Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Primary Interest
                </label>
                <Select 
                  value={selectedPrefs[0] || "ml"} 
                  onValueChange={(val) => setSelectedPrefs([val, selectedPrefs[1] || ""])}
                >
                  <SelectTrigger className="input-glass">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectPreferences.map((pref) => (
                      <SelectItem key={pref.id} value={pref.id}>
                        {pref.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Secondary Interest
                </label>
                <Select 
                  value={selectedPrefs[1] || "webdev"} 
                  onValueChange={(val) => setSelectedPrefs([selectedPrefs[0] || "", val])}
                >
                  <SelectTrigger className="input-glass">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectPreferences.map((pref) => (
                      <SelectItem key={pref.id} value={pref.id}>
                        {pref.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Preferred Team Size
                </label>
                <Select defaultValue="4">
                  <SelectTrigger className="input-glass">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 members</SelectItem>
                    <SelectItem value="4">4 members</SelectItem>
                    <SelectItem value="5">5 members</SelectItem>
                    <SelectItem value="6">6 members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex justify-end"
      >
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-primary-glow flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </motion.div>
    </div>
  );
};

export default Profile;
