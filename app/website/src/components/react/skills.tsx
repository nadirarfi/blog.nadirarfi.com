import { technologies, type Category } from '../../consts'
import { type IconType } from 'react-icons'
import { FaQuestionCircle } from 'react-icons/fa'


import { 
  VscAzure,
  VscAzureDevops  
} from "react-icons/vsc";

import {
  FaAws,
  } from 'react-icons/fa';

import { 
  SiKubernetes, 
  SiTerraform,
  SiHelm,
  SiPython,
  SiGnubash,
  SiLinux,
  SiGit,
  SiGithub,
  SiGitlab,
  SiAnsible,
  SiJenkins,
  SiDocker,
  SiDatadog,
  SiElastic,
  SiAmazoncloudwatch,
  
} from 'react-icons/si';

import { DiAws } from "react-icons/di";
import { BsCloudFog } from "react-icons/bs";
import { TbSdk } from "react-icons/tb";

const iconMap: { [key: string]: IconType } = {
  // Cloud & Infrastructure
  'logos:aws': FaAws,
  'logos:microsoft-azure': VscAzure,
  'logos:kubernetes': SiKubernetes,
  'logos:terraform-icon': SiTerraform,
  'logos:helm': SiHelm,
  'logos:cdk': DiAws ,
  'logos:cloudformation': BsCloudFog,
  
  // Programming & Scripting
  'logos:python': SiPython,
  'logos:bash-icon': SiGnubash,
  
  // DevOps
  'logos:linux': SiLinux,
  'logos:git': SiGit,
  'logos:Github': SiGithub,
  'logos:Gitlab': SiGitlab,
  'logos:Azure DevOps': VscAzureDevops,
  'logos:ansible': SiAnsible,
  'logos:jenkins': SiJenkins,
  'logos:docker-icon': SiDocker,
  'logos:sdk': TbSdk,
  
  // Monitoring & Logging
  'logos:Datadog': SiDatadog,
  'logos:Elastic': SiElastic,
  'logos:CloudWatch': SiAmazoncloudwatch
}


const Skills: React.FC = () => {
  return (
    <div className="w-full space-y-10">
      {/* Iterate through each category of technologies */}
      {Object.entries(technologies).map(([category, skills]) => (
        <div key={category} className="space-y-4">
          {/* Category header */}
          <h3 className="text-lg md:text-xl font-semibold text-foreground/90">
            {category}
          </h3>
          
          {/* Skills grid for this category */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {skills.map((tech: Category, techIndex: number) => {
              const IconComponent = iconMap[tech.logo] || FaQuestionCircle;
              
              return (
                <div
                  key={`${category}-${techIndex}`}
                  className="flex items-center gap-3 p-3 bg-card/50 rounded-lg hover:bg-card/70 transition-colors group"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-lg group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="text-primary" />
                  </span>
                  <span className="text-foreground text-sm md:text-base">
                    {tech.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skills;
