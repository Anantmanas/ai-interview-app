'use client'

import { useResume } from '@/components/resume/resume-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, User, Briefcase, Clock, FileText } from 'lucide-react'
import { SkillIcon } from '@/components/resume/skill-icon'

export function ResumeSummary() {
  const { resumeData, resumeMeta, isResumeReady } = useResume()

  if (!isResumeReady || !resumeData) {
    return null
  }

  const yearsExp = resumeData.experience?.reduce((sum, exp) => sum + (exp.years || 0), 0) ?? 0
  const currentPosition = resumeData.experience?.[0]?.role || resumeData.targetRole || 'Software Engineer'

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden shadow-sm">
      <CardHeader className="pb-4 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">{resumeData.name || 'Candidate Profile'}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {currentPosition}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {yearsExp > 0 ? `${yearsExp}+ yrs experience` : 'New Professional'}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {resumeData.summary && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <FileText className="h-3 w-3" />
              Overview
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {resumeData.summary}
            </p>
          </div>
        )}

        {resumeData.skills && resumeData.skills.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Technical Skills
            </div>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="flex items-center gap-2 py-1 px-3 bg-background/80 backdrop-blur-sm border-border hover:border-primary/40 transition-colors shadow-xs"
                >
                  <SkillIcon skill={skill} className="h-3.5 w-3.5" size={14} />
                  <span className="text-xs font-medium">{skill}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {resumeMeta && (
          <div className="pt-4 border-t flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground italic">
              Verified from {resumeMeta.fileName}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
              <CheckCircle2 className="h-3 w-3" />
              AI Analyzed & Active
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
