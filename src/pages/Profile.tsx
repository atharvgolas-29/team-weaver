import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Save, Calendar, Clock, BookOpen } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const skills = [
  { name: "Python/Pandas", level: 85 },
  { name: "LeetCode", level: 65 },
  { name: "Java", level: 75 },
  { name: "SQL", level: 80 },
  { name: "React", level: 70 },
  { name: "Machine Learning", level: 60 },
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

export const Profile = () => {
  const [skillLevels, setSkillLevels] = useState(
    skills.reduce((acc, skill) => ({ ...acc, [skill.name]: skill.level }), {} as Record<string, number>)
  );
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>(["ml", "webdev"]);

  const toggleAvailability = (day: string, slot: string) => {
    const key = `${day}-${slot}`;
    setAvailability((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getSkillLabel = (value: number) => {
    if (value >= 80) return { text: "Expert", color: "text-primary" };
    if (value >= 50) return { text: "Good", color: "text-accent" };
    return { text: "Basic", color: "text-muted-foreground" };
  };

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
                <span className="text-4xl font-bold">AS</span>
              </div>
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold mb-1">Arjun Sharma</h2>
            <p className="text-muted-foreground mb-4">CS 3rd Year • Section A</p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <SkillBadge skill="Python" level="expert" />
              <SkillBadge skill="React" level="good" />
            </div>
            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-2xl font-bold text-primary">3</p>
                  <p className="text-muted-foreground">Projects</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">8</p>
                  <p className="text-muted-foreground">Teammates</p>
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
              {skills.map((skill) => {
                const level = skillLevels[skill.name];
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
                <Select defaultValue="ml">
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
                <Select defaultValue="webdev">
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
        <Button className="btn-primary-glow flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </motion.div>
    </div>
  );
};

export default Profile;
