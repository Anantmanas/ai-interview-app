'use client'

import { useResume } from '@/components/resume/resume-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, User, Briefcase, Clock, FileText } from 'lucide-react'
import { SkillIcon } from '@/components/resume/skill-icon'

export function ResumeSummary() {
  const { resumeData, resumeMeta, isResumeReady } = useResume()

  if (!isResumeReady || !resumeData) {
    // #region agent log
    fetch('http://127.0.0.1:7657/ingest/ebbc3a05-84d1-4f07-893b-01831b601aad',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd394d'},body:JSON.stringify({sessionId:'bd394d',runId:'pre-fix',hypothesisId:'E',location:'resume-summary.tsx:render',message:'ResumeSummary hidden - not ready',data:{isResumeReady,hasResumeData:!!resumeData},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return null
  }

  // #region agent log
  fetch('http://127.0.0.1:7657/ingest/ebbc3a05-84d1-4f07-893b-01831b601aad',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd394d'},body:JSON.stringify({sessionId:'bd394d',runId:'pre-fix',hypothesisId:'E',location:'resume-summary.tsx:render',message:'ResumeSummary rendering',data:{skillsCount:resumeData.skills?.length??0,experienceCount:resumeData.experience?.length??0,name:resumeData.name||null,hasSummary:!!resumeData.summary},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const yearsExp = resumeData.experience.reduce((sum, exp) => sum + (exp.years || 0), 0)
  const currentPosition = resumeData.experience[0]?.role || resumeData.targetRole || 'Software Engineer'

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
      <CardHeader className="pb-4 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">{resumeData.name}</CardTitle>
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

        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Technical Skills
          </div>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill) => (
              <Badge 
                key={skill} 
                variant="outline" 
                className="flex items-center gap-1.5 py-1 px-2.5 bg-background border-primary/10 hover:border-primary/30 transition-colors"
              >
                <SkillIcon skill={skill} className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium">{skill}</span>
              </Badge>
            ))}
          </div>
        </div>

        {resumeMeta && (
          <div className="pt-4 border-t flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground italic">
              Verified from {resumeMeta.fileName}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
              <CheckCircle2 className="h-3 w-3" />
              AI Analyzed
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
