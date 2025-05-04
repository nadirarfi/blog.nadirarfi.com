# Gov

When designing Azure solutions — particularly for the AZ-305 certification — it’s essential to first understand **how Azure is built and organized**. This includes the **physical infrastructure** (regions, datacenters, and network) and the **management structure** (how resources are controlled, secured, and organized). This guide offers a breakdown of the key concepts, structured to help both exam preparation and real-world Azure usage.

---

# Azure Architect Design Prerequisites

   ## 🌍 Azure Regions, Region Pairs, and Datacenters

   ### Azure Regions

   Azure operates in **multiple geographic regions**, each consisting of one or more datacenters. These regions are strategically located around the globe to provide **low-latency** performance, **data residency compliance**, and **geographic redundancy** for customers.

   * **Examples**: West Europe, East US, Southeast Asia.
   * Some regions, such as **North Europe** and **West Europe**, are paired for **disaster recovery** and **backup** purposes.

   ### Sovereign Regions

   Azure also offers **Sovereign Regions**, tailored for specific governments or organizations with stringent regulatory requirements:

   * **Azure Government (US)**
   * **Azure China (operated by 21Vianet)**

   These regions operate separately from the public Azure network, offering services that comply with specialized data residency and regulatory laws.

   ### Region Pairs

   Azure regions are always paired with another region within the same geography. Key benefits include:

   * **High Availability**: Ensures data replication between paired regions for improved availability.
   * **Staggered Updates**: Reduces downtime by rolling out updates to each region separately.
   * **Durability**: Data replication in services like Azure Storage ensures durability.

   👉 [Learn more about Azure regions and region pairs](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview#what-are-availability-zones)

   ---

   ## 🏢 Azure Datacenters

   Azure regions consist of **datacenters** — large-scale facilities housing servers, storage, and networking equipment. Key characteristics of Azure datacenters:

   * **Physical security**: Biometric access controls, surveillance, and fencing ensure physical protection.
   * **Redundancy**: Multiple power supplies and network paths safeguard against failures.
   * **Environmental controls**: Temperature and humidity are strictly monitored to ensure optimal conditions.
   * **Compliance**: Azure datacenters adhere to standards like ISO 27001, SOC 1/2/3, and PCI DSS, ensuring they meet industry best practices for security and compliance.

   These datacenters form the foundation of Azure's **global cloud infrastructure**, ensuring both reliability and performance.

   ---

   ## ⚡ Availability Zones

   **Availability Zones** are distinct datacenters within a single Azure region, designed to increase the reliability and availability of applications and data. Key features:

   * **Failure isolation**: A failure in one zone does not impact other zones within the same region.
   * **Replication**: Data and applications can be replicated across zones for **higher availability**.

   Each zone operates with:

   * Independent **power** and **cooling** systems.
   * **Independent networking** and isolation from other zones.

   Common usage scenarios:

   * Deploying **zone-redundant** VMs to ensure high availability.
   * Running **geo-redundant** databases.
   * Hosting **load-balanced web apps** across zones.

   👉 [What are Availability Zones?](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview)

   ---

   ## 🔧 Azure Resources and Resource Groups

   ### Resources

   In Azure, a **resource** is any Azure service you use, including:

   * Virtual Machines
   * Azure SQL Databases
   * Storage Accounts
   * Virtual Networks
   * App Services

   These resources are the building blocks that you manage, monitor, and secure within Azure.

   ### Resource Groups

   A **Resource Group** is a logical container for related Azure resources.

   Key benefits:

   * Simplifies **deployment** and **management**: Resources within a group can be managed collectively.
   * **Access Control**: Role-Based Access Control (RBAC) can be applied to the resource group as a whole.
   * **Cost Tracking**: Grouping resources helps in tracking costs effectively.

   **Best practice**: Group resources based on their **lifecycle**. For example, group a web app, its database, and the associated networking components together.

   👉 [Learn how to manage Resource Groups](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal)

   ---

   ## 💳 Subscriptions

   An **Azure Subscription** serves as the container for Azure resources and is closely tied to the following:

   * **Billing**: Tracks the cost of resources used.
   * **Service Limits and Quotas**: Defines the maximum resources available within the subscription.
   * **Access Permissions**: Specifies who has access to resources within the subscription.

   You can create separate subscriptions to organize resources by teams, projects, or environments (e.g., development, test, production).

   Benefits of using separate subscriptions:

   * **Workload Isolation**: Keep production workloads separate from development or testing.
   * **Policy Enforcement**: Apply different policies and quotas per subscription.
   * **Cost Management**: Assign different billing accounts or cost centers for better cost control.

   👉 [Explore Azure Subscriptions](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/create-subscription)

   ---

   ## 🏢 Management Groups

   In enterprise environments, managing multiple subscriptions is streamlined through **Management Groups**.

   ### Key Functions:

   * **Organize Subscriptions**: Group multiple subscriptions logically.
   * **Governance**: Apply **policies** and **RBAC roles** across multiple subscriptions.
   * **Security & Compliance**: Ensure organizational compliance and security standards.

   For example:

   * A **Production** management group might include all production subscriptions, with stricter governance and security policies.
   * A **Dev/Test** management group might include less restrictive settings to support agile development.

   👉 [Learn about Management Groups](https://learn.microsoft.com/en-us/azure/governance/management-groups/overview)

   ---

   ## 🧭 Azure Management Hierarchy

   Azure resources are organized into a **hierarchical structure** that includes:

   1. **Management Groups**: High-level organizational units.
   2. **Subscriptions**: Containers for resources and billing.
   3. **Resource Groups**: Logical containers for related resources.
   4. **Resources**: Individual services and components you manage.

   This hierarchy enables you to organize resources efficiently, apply governance policies, and maintain a secure, compliant environment across multiple subscriptions and regions.

   ---
