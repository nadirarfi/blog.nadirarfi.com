# Design Identity Governance

Welcome! These are my personal notes about how to design governance solutions in Azure, especially useful if you're preparing for the AZ-305 exam. Think of Azure governance as the rules and guardrails that keep your cloud environment secure, organized, and running smoothly.

## What Is Azure Governance?

Simply put, governance means setting up clear rules and processes to manage your Azure resources effectively. It’s like creating company policies for how your cloud environment should be used and maintained. Azure gives you a structure to organize and apply these rules at different levels, so you can manage everything from a high level or down to individual resources.

The main tools we’ll talk about here are **Azure Policy** and **Resource Tags**.

## Understanding Azure’s Structure

Before setting rules, it helps to know how Azure organizes everything:

* **Tenant Root Group:** The top-level container for your entire Azure environment, linked to your company’s Azure Active Directory.
* **Management Groups:** Containers that group multiple subscriptions so you can apply policies and permissions across them all.
* **Subscriptions:** Logical units that contain your resources. They’re also billing boundaries.
* **Resource Groups:** Containers where you group related resources (like virtual machines, databases) that share the same lifecycle.
* **Resources:** The actual services you use, like VMs, storage, or apps.

Policies and permissions applied higher in this hierarchy flow down to the levels below.

## Management Groups — Why They Matter

Management groups help you manage many subscriptions at once. For example, you can apply security policies or access rules to all sales-related subscriptions in one place.

**Tips for Management Groups:**

* Keep your hierarchy simple — usually 3-4 levels deep is enough.
* Group subscriptions by departments or regions for easy management.
* Create special groups for production environments, sandboxes, or sensitive data.
* Use management groups to apply policies and permissions efficiently.

## Using Resource Tags

Tags are labels (like key-value pairs) you add to your Azure resources to help organize and manage them.

Examples of tags:

* `Environment = Production`
* `Owner = JohnDoe`
* `CostCenter = Finance`

**Why use tags?**

* Track costs by department or project
* Find resources quickly
* Enforce policies based on tags

Start with a few important tags and use Azure Policy to make sure they’re always applied.

## Azure Policy — Your Rule Enforcer

Azure Policy lets you create rules that ensure your resources follow your company’s standards. For example, you can:

* Block resources being created in disallowed regions
* Require certain tags on resources
* Automatically fix noncompliant resources

You assign policies at different levels (management groups, subscriptions, or resource groups), and Azure checks if resources comply. If not, it can block actions or just flag the issues for review.

## Role-Based Access Control (RBAC) — Who Can Do What

RBAC controls who can access Azure resources and what they can do with them. You assign roles like Owner, Contributor, or Reader to users or groups, at different levels in the hierarchy.

Key points:

* RBAC answers the question: *Who can do what?*
* Azure Policy answers: *Are resources configured properly?*
* Use both together for strong governance.

## Subscriptions — Organizing Your Azure Environment

Subscriptions are where your Azure resources live and how your costs are tracked. You might have separate subscriptions for development, testing, and production to keep things organized.

When designing subscriptions:

* Align them with your teams or business units.
* Group them under management groups for easier policy and access control.
* Consider a shared subscription for common services like networking or security.
* Be aware of Azure service limits per subscription to avoid bottlenecks.

## Resource Groups — Grouping Related Resources

Resource groups help you manage resources that share a common lifecycle, like all the components of an app’s production environment. When you delete a resource group, all resources inside get deleted too — so use this wisely.

## Azure Landing Zones — Your Cloud Foundation

An Azure landing zone is a pre-configured environment with all the basics ready: networking, security, monitoring, and policies. Think of it like a well-prepared building site with utilities ready before construction begins.

Landing zones help you:

* Scale your cloud environment
* Keep everything consistent and secure
* Support both migrating existing apps and building new cloud-native ones

Use Infrastructure as Code tools to set up landing zones so you can automate, version, and repeat the process easily.