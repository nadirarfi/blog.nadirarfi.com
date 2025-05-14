# Case Study #1

## Overview:

**Nadirarfi Inc.** is an engineering company with offices throughout Europe. The company has a main office in **Paris**, and branch offices in **London**, **Sweden**, and **Rome**.

### Active Directory Environment:
The network contains two **Active Directory forests**: 
- **corp.nadirarfi.com** (production forest)
- **rd.nadirarfi.com** (used only for the Research and Development (R&D) department).

There are **no trust relationships** between the forests, and **corp.nadirarfi.com** is used for **internal user and computer authentication**. The **rd.nadirarfi.com** forest is **restricted to on-premises resources only**.

### Network Infrastructure:
Each office has at least one **domain controller** from the **corp.nadirarfi.com** domain, with the main office containing all domain controllers for the **rd.nadirarfi.com** forest. All offices are connected with a high-speed connection to the internet.

An existing application, **WebApp1**, is hosted in the **Paris office's data center**. **WebApp1** is used by customers to place and track orders. It has:
- **Web tier** using **IIS**.
- **Database tier** running **SQL Server 2016** on virtual machines in a **Hyper-V** environment.

### Problem Statement:
- The use of **WebApp1** is **unpredictable**. During peak times, users report delays, and during off-peak times, resources are underutilized.

### Planned Changes:
- **Nadirarfi Inc.** plans to move most of its production workloads to **Azure** over the next few years.
- The company is planning a **hybrid identity model** for **Microsoft Office 365 deployment**, while **R&D operations** will remain **on-premises**.
- The initial project involves migrating the **production** and **test instances** of **WebApp1** to **Azure**.

### Technical Requirements:
- Website content must be **easily updated** from a **single point**.
- User input must be minimized when provisioning new app instances.
- Whenever possible, **existing on-premises licenses** should be used to reduce cost.
- Users must always authenticate using their **corp.nadirarfi.com UPN identity**.
- New deployments to **Azure** must be **redundant** in case an **Azure region** fails.
- Solutions should be deployed using **Platform as a Service (PaaS)** wherever possible.
- An **email distribution group** named **IT Support** must be notified of any **directory synchronization** issues.
- Directory synchronization between **Azure Active Directory (AAD)** and **corp.nadirarfi.com** should not be impacted by a **link failure** between Azure and on-premises.

### Database Requirements:
- Database metrics for **WebApp1's production instance** should be available for performance analysis and optimization.
- **Database downtime** during migration should be minimized to avoid disrupting customer access.
- **Database backups** should be retained for a minimum of **seven years** to meet compliance requirements.

### Security Requirements:
- Company information, including policies, templates, and data, should remain inaccessible to anyone outside the company.
- Users on the **on-premises network** must be able to authenticate to **corp.nadirarfi.com** if the **internet link fails**.
- Administrators should be able to authenticate to the **Azure portal** using **corp.nadirarfi.com** credentials.
- All administrative access to the **Azure portal** must be secured with **multi-factor authentication (MFA)**.
- The testing of **WebApp1 updates** must not be visible to anyone outside the company.

---

## Questions & Answers:

### 1. **What should you include in the identity management strategy to support the planned changes?**
**Options:**
- **A.** Move all the domain controllers from **corp.nadirarfi.com** to virtual networks in Azure.
- **B.** Deploy domain controllers for **corp.nadirarfi.com** to virtual networks in Azure.
- **C.** Deploy a new Azure AD tenant for the authentication of new R&D projects.
- **D.** Deploy domain controllers for the **rd.nadirarfi.com** forest to virtual networks in Azure.

**Answer:**
- **B. Deploy domain controllers for corp.nadirarfi.com to virtual networks in Azure.**

**Explanation:**
Deploying domain controllers for **corp.nadirarfi.com** to Azure allows for **hybrid identity** and **low-latency authentication**. This meets the need to extend the **corporate identity** to Azure, ensuring consistent authentication across cloud and on-premises services. The R&D department will remain on-premises and does not need Azure integration.

---

### 2. **What should you recommend for migrating the database content of WebApp1 to Azure?**
**Options:**
- **A.** Use Azure Site Recovery to replicate the SQL servers to Azure.
- **B.** Use SQL Server transactional replication.
- **C.** Copy the BACPAC file that contains the Azure SQL database file to Azure Blob storage.
- **D.** Copy the VHD that contains the Azure SQL database files to Azure Blob storage.

**Answer:**
- **C. Copy the BACPAC file that contains the Azure SQL database file to Azure Blob storage.**

**Explanation:**
The **BACPAC** file is the correct way to **migrate** an Azure SQL database as it enables both **database schema** and **data** migration to Azure. This method minimizes downtime and can be used to import the database into **Azure SQL Database**.

---

### 3. **What is the minimum number of Azure AD tenants needed for Nadirarfi Inc.?**
**Options:**
- **A.** 1
- **B.** 2
- **C.** 3
- **D.** 4

**Answer:**
- **A. 1**

**Explanation:**
Nadirarfi Inc. only needs **1 Azure AD tenant** for managing users, including both **corp.nadirarfi.com** and **Azure AD** identities. There is no need for a second tenant since both corporate identities and Azure-based services can be managed in a **single Azure AD tenant**.

---

### 4. **What should you recommend for the web tier of WebApp1 to minimize resource underutilization during off-peak times?**
**Options:**
- **A.** Create a runbook that resizes virtual machines automatically to a smaller size outside of business hours.
- **B.** Configure the Scale Up settings for a web app.
- **C.** Deploy a virtual machine scale set that scales out on a 75 percent CPU threshold.
- **D.** Configure the Scale Out settings for a web app.

**Answer:**
- **D. Configure the Scale Out settings for a web app.**

**Explanation:**
Scaling out allows Azure to automatically **add instances of the web app** to handle **increased traffic** during peak times. This prevents **underutilization** of resources when traffic is low and ensures that resources are allocated efficiently.

---

### 5. **What is the solution to meet the database retention requirement for Nadirarfi Inc.?**
**Options:**
- **A.** Configure a long-term retention policy for the database.
- **B.** Configure Azure Site Recovery.
- **C.** Configure geo-replication of the database.
- **D.** Use automatic Azure SQL Database backups.

**Answer:**
- **A. Configure a long-term retention policy for the database.**

**Explanation:**
**Long-Term Retention (LTR)** policies are specifically designed to store **Azure SQL Database backups** for **up to 10 years**. This meets the **7-year retention requirement** for compliance purposes. Geo-replication and automatic backups do not offer the long-term retention needed.

---

### 6. **What should you recommend as a notification solution for the IT Support distribution group?**
**Options:**
- **A.** Azure Network Watcher
- **B.** An action group
- **C.** A SendGrid account with advanced reporting
- **D.** Azure AD Connect Health

**Answer:**
- **D. Azure AD Connect Health**

**Explanation:**
**Azure AD Connect Health** is specifically designed to monitor directory synchronization services and can be configured to send notifications about synchronization issues to the IT Support distribution group. This meets the requirement of notifying the IT Support team about directory synchronization problems.

---

### 7. **How can you ensure that directory synchronization continues to function if the link between Azure and on-premises fails?**
**Options:**
- **A.** Configure Azure AD Connect with staging mode
- **B.** Use Azure AD Connect cloud sync
- **C.** Deploy additional domain controllers in Azure
- **D.** Configure Azure AD Connect with additional sync servers

**Answer:**
- **B. Use Azure AD Connect cloud sync**

**Explanation:**
Azure AD Connect cloud sync provides **resilience** to network link failures by allowing synchronization to continue even when the on-premises network connection is disrupted. This meets the case study requirement that "Directory synchronization between Azure Active Directory (AAD) and corp.nadirarfi.com should not be impacted by a link failure between Azure and on-premises."



## Conclusion:
This case study focuses on **Azure migrations**, **hybrid identity management**, and **database migration strategies**. The goal is to ensure that **Nadirarfi Inc.** can smoothly migrate to Azure, maintain secure access and compliance, and optimize the use of resources. By leveraging Azure’s **PaaS offerings** and **long-term retention policies**, the company can achieve its technical and business goals efficiently.

---