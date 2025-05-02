# 🚀 Personal Blog: Cloud & DevOps Technologies

*A comprehensive, end-to-end solution to build, deploy, and manage a static blog website using Astro.js, AWS CDK, and GitHub Actions.*

---

## 📋 Table of Contents

1. [✨ Summary](#-summary)
2. [🖥 Application](#-application)

   * [Local Development](#local-development)
   * [Content Structure](#content-structure)
3. [☁️ Infrastructure](#️-infrastructure)

   * [Overview](#overview)
   * [Setup Script (`setup.sh`)](#setup-script-setupsh)
   * [Configuration (`config/*.yaml`)](#configuration-configyaml)
   * [CDK Stacks](#cdk-stacks)

     * [ACM Certificate Stack](#acm-certificate-stack)
     * [Static Website Stack](#static-website-stack)
     * [Route 53 DNS Stack](#route-53-dns-stack)
   * [GitHub OIDC Role](#github-oidc-role)
4. [📈 CI/CD with GitHub Actions](#-cicd-with-github-actions)

   * [Website Pipeline](#website-pipeline)
   * [Infrastructure Pipeline](#infrastructure-pipeline)

---



