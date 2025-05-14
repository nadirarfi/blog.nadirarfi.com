# nadirarfi

## Organization Profile
- **Company**: nadirarfi, Inc.
- **Industry**: Medium-sized finance company
- **Main Office**: London
- **Focus**: Finance services requiring high compliance and data security

## Existing Environment - Detailed

### Identity Environment
- Active Directory forest named **nadirarfi.com** (on-premises)
- Azure AD tenant named **nadirarfi.com** (cloud identity)
- Second Azure AD tenant named **dev.nadirarfi.com** (isolated development environment)
- **Azure AD Connect**: Currently synchronizing identities between on-premises AD and Azure AD
- **Licensing**: All users have Azure AD Premium P2 licenses (includes advanced security features like PIM, Identity Protection, etc.)
- **Conditional Access Policy**:
  - Policy name: **capolicy1**
  - Requirement: Users managing production environments via Azure portal must connect from hybrid Azure AD-joined devices
  - Scope: Production environment management
  - No MFA requirement currently configured in this policy

### Azure Environment
- **Production Tenant (nadirarfi.com)**:
  - 10 Azure subscriptions
  - Used for all production workloads
- **Development Tenant (dev.nadirarfi.com)**:
  - 5 Azure subscriptions
  - Isolated environment for development and testing
- **Subscription Management**:
  - All 15 subscriptions are part of an Enterprise Agreement (EA)
  - Consolidated billing and management
- **Custom RBAC Role**:
  - Role name: **Role1**
  - Permissions: DataActions read permission to blobs and files in Azure Storage
  - Scope: Currently not clearly defined across all subscriptions
- **Network Connectivity**:
  - ExpressRoute circuit connecting on-premises to Azure
  - High-bandwidth, low-latency private connection

### On-premises Infrastructure (Detailed)

#### Linux Environment
- **Servers**: SERVER1, SERVER2, SERVER3
- **OS**: Ubuntu 18.04 LTS
- **Virtualization**: Running as virtual machines on Hyper-V
- **Application**: Third-party app named App1
- **App1 Details**:
  - Purpose: Not explicitly stated but critical to business operations
  - Data Storage: External Apache Hadoop-compatible storage solution
  - Authentication: POSIX access control list (ACL) with file-level permissions
  - Current Challenges: Sharing physical hardware with other workloads

#### Windows Environment
- **Server**: SERVER10
- **OS**: Windows Server 2016
- **Database**: Microsoft SQL Server instance
- **Databases**:
  - DB1: Purpose and size not specified, but business-critical
  - DB2: Purpose and size not specified, but business-critical
  - No current high availability configuration mentioned

## Planned Changes - Implementation Details

### Database Migration
- **Target**: Migrate DB1 and DB2 to Azure
- **Considerations**:
  - Minimizing downtime during migration
  - Preserving data integrity
  - Implementing high availability
  - Optimizing performance
  - Maintaining security and compliance
  - Supporting automatic failover
  - Ensuring minimal I/O latency

### Application Migration
- **Target**: Migrate App1 to Azure virtual machines
- **Infrastructure Approach**:
  - Deploy on Azure dedicated hosts (isolated physical servers)
  - Implement across multiple availability zones
  - Configure for auto-scaling
  - Ensure high availability
  - Maintain data integrity and security

## Requirements - Technical Details

### Authentication and Authorization Requirements

#### User Authentication
- **Device Requirements**:
  - Users managing production must connect from hybrid Azure AD-joined devices
  - Hybrid Azure AD-joined devices are domain-joined to on-premises AD and registered in Azure AD
  - Provides strong device identity and security posture
- **MFA Requirements**:
  - Azure Multi-Factor Authentication required for all production environment management
  - Must be integrated with existing conditional access policies
  - Must ensure all users are properly registered

#### Role-Based Access Control
- **Network Administration**:
  - Network Contributor built-in role must be assigned for all virtual networks
  - Must be implemented across all 15 subscriptions
  - Must be assigned at the highest possible scope (management group level) to minimize administrative overhead
- **Storage Account Permissions**:
  - Custom Role1 must be used for all storage accounts
  - Must grant read-only permissions to blobs and files
  - Must be applied consistently across all subscriptions

#### Application Identity
- **App1 Authentication Method**:
  - Must use managed identity of host VMs
  - Eliminates need for stored credentials
  - Simplifies secret management
  - Provides automated credential rotation

### Resiliency Requirements - Technical Specifications

#### Database Resiliency (DB1 & DB2)
- **Availability Requirements**:
  - Must maintain functionality if two availability zones fail
  - Requires deployment across three or more availability zones
  - Requires active-active or active-passive configuration
- **Failover Specifications**:
  - Must support automatic failover without manual intervention
  - Must minimize failover time to maintain service continuity
  - Must ensure data consistency during failover
- **Performance Requirements**:
  - Must minimize I/O latency for database operations
  - Requires storage optimized for database workloads
  - May require local SSD or premium storage options

#### Application Resiliency (App1)
- **Regional Requirements**:
  - Must be deployed in an Azure region that supports availability zones
  - Availability zones provide physical and logical separation within a region
- **Scaling Requirements**:
  - VMs must support automatic scaling based on demand
  - Scale-out during peak times, scale-in during off-peak
  - Must maintain performance levels during scaling operations
- **Availability Requirements**:
  - Must remain available if two availability zones fail
  - Requires deployment across three or more availability zones
  - Must implement appropriate load balancing

### Security and Compliance Requirements - Detailed Controls

#### Data Protection
- **App1 Data Write Controls**:
  - New data must be writable to the application
  - Both new and existing data must be protected from modification for 3 years
  - Requires immutable storage with time-based retention policies
  - Must comply with financial data regulations

#### Network Security
- **Storage Access Requirements**:
  - On-premises users and services must have access to Azure Storage for App1
  - Must leverage existing ExpressRoute connection
  - Must not expose storage accounts to the public internet
  - Public endpoint access must be blocked
  - Must implement appropriate private connectivity solution

#### Database Security
- **Encryption Requirements**:
  - All Azure SQL databases in production must have Transparent Data Encryption (TDE)
  - TDE encrypts data at rest
  - Must be automatically enforced through policy
  - Must be verified for compliance

#### Hardware Isolation
- **App1 Hardware Requirements**:
  - Must not share physical hardware with other workloads
  - Requires dedicated hosts in Azure
  - Increases security through physical isolation
  - May help meet specific compliance requirements

### Business Requirements - Implementation Strategy

#### Administrative Efficiency
- **Objective**: Minimize administrative effort
- **Approach**:
  - Use platform-as-a-service (PaaS) options where possible
  - Implement automation for routine tasks
  - Apply policies at highest possible scope
  - Leverage managed services to reduce operational overhead
  - Configure auto-scaling to reduce manual intervention
  - Implement comprehensive monitoring and alerting

#### Cost Optimization
- **Objective**: Minimize costs
- **Strategies**:
  - Leverage existing licenses where applicable
  - Implement right-sizing for cloud resources
  - Use reservation-based pricing for predictable workloads
  - Configure auto-scaling to reduce resource wastage
  - Select appropriate service tiers based on requirements
  - Optimize storage usage and retention policies

## Exam Questions, Options, and Solutions

### Q1: Azure MFA Configuration

**Question**: You need to ensure that users managing the production environment are registered for Azure MFA and must authenticate by using Azure MFA when they sign in to the Azure portal. The solution must meet the authentication and authorization requirements. What should you do?

**Options**:
- **Box 1 Options**:
  - Security defaults in Azure AD
  - Per-user MFA in MFA management UI
  - Azure AD Identity Protection

- **Box 2 Options**:
  - Grant control in capolicy1
  - Session control in capolicy1
  - Sign-in risk policy

**Answer**:
- **Box 1**: Azure AD Identity Protection
- **Box 2**: Sign-in risk policy

**Technical Implementation**:
1. Configure Azure AD Identity Protection to identify users who haven't registered for MFA
2. Create a Conditional Access policy requiring MFA registration
3. Implement sign-in risk policies to enforce MFA during authentication to the Azure portal
4. Ensure both policies work together with existing capolicy1

### Q2: Network Connectivity for App1 Storage

**Question**: You plan to migrate App1 to Azure. You need to recommend a network connectivity solution for the Azure Storage account that will host the App1 data. The solution must meet the security and compliance requirements. What should you include in the recommendation?

**Options**:
- A. A private endpoint
- B. A service endpoint that has a service endpoint policy
- C. Azure public peering for an ExpressRoute circuit
- D. Microsoft peering for an ExpressRoute circuit

**Answer**: A. A private endpoint

**Technical Details**:
- **Implementation**:
  - Creates a private IP address for the storage account within the VNet
  - Associates the private IP with the Azure Storage account
  - Configures DNS to resolve the storage account name to the private IP

- **Network Architecture**:
  - Storage traffic remains on the Microsoft backbone network
  - No exposure to the public internet
  - Accessible from on-premises via ExpressRoute private peering
  - Accessible from Azure VMs in the same or peered VNets

### Q3: Managed Identity Token Access for App1

**Question**: You plan to migrate App1 to Azure. The solution must meet the authentication and authorization requirements. Which type of endpoint should App1 use to obtain an access token?

**Options**:
- A. Azure Instance Metadata Service (IMDS)
- B. Azure AD
- C. Azure Service Management
- D. Microsoft identity platform

**Answer**: A. Azure Instance Metadata Service (IMDS)

**Technical Implementation**:
- **Token Request Process**:
  - App1 makes a REST API call to http://169.254.169.254/metadata/identity/oauth2/token
  - Includes the resource it needs access to (e.g., Azure Storage)
  - IMDS returns an access token bound to the VM's managed identity
  - App1 uses this token in API calls to Azure services

### Q4: Azure Policy for TDE on SQL Databases

**Question**: You need to configure an Azure policy to ensure that the Azure SQL databases have TDE enabled. The solution must meet the security and compliance requirements. Which three actions should you perform in sequence?

**Options**:
1. Create an Azure policy definition that uses the deployIfNotExists identity
2. Create an Azure policy assignment
3. Invoke a remediation task
4. Configure a periodic review of the policy
5. Create an Azure policy initiative
6. Modify the permissions of the managed identity

**Answer**:
1. Create an Azure policy definition that uses the deployIfNotExists identity
2. Create an Azure policy assignment
3. Invoke a remediation task

**Technical Implementation Details**:

**Step 1: Create policy definition**
- Effect: deployIfNotExists
- Target scope: Azure SQL databases
- Policy criteria: Checks if TDE is enabled
- Remediation action: Enable TDE if not enabled

**Step 2: Create policy assignment**
- Target scope: Management group or subscription level
- Assignment parameters: Configure any parameters needed
- Managed identity: Automatically created to perform remediation

**Step 3: Invoke remediation task**
- Identify non-compliant resources
- Trigger deployIfNotExists effect
- Enable TDE on non-compliant databases

### Q5: High Availability Solution for App1

**Question**: You plan to migrate App1 to Azure. You need to recommend a high-availability solution for App1. The solution must meet the resiliency requirements. What should you include in the recommendation?

**Options**:
- Number of host groups: [?]
- Number of VM Scale Sets: [?]

**Answer**:
- Number of host groups: 3
- Number of VM Scale Sets: 1

**Technical Architecture**:
- **Host Groups Configuration**:
  - Host Group 1: Deployed in Availability Zone 1
  - Host Group 2: Deployed in Availability Zone 2
  - Host Group 3: Deployed in Availability Zone 3
  - Each host group contains dedicated hosts for App1

- **VM Scale Set Design**:
  - Single scale set spans all three availability zones
  - Configured with zone redundancy
  - Automatic scaling based on defined metrics

### Q6: Cost Estimation and Minimization

**Question**: You plan to migrate App1 to Azure. You need to estimate the compute costs for App1 in Azure. The solution must meet the security and compliance requirements. What should you use to estimate the costs, and what should you implement to minimize the costs?

**Options for estimation tool**:
- Azure Advisor
- Azure Cost Management Power BI app
- Azure TCO calculator

**Options for cost minimization**:
- Azure Reservations
- Azure Hybrid Benefit
- Azure Spot VM pricing

**Answer**:
- Estimation tool: Azure TCO calculator
- Cost minimization: Azure Hybrid Benefit

**Detailed Cost Optimization Strategy**:

**Azure TCO Calculator Usage**:
- Input current on-premises infrastructure details
- Specify workload characteristics of App1
- Include hardware, software, and operational costs

**Azure Hybrid Benefit Implementation**:
- Leverage existing Windows Server licenses
- Apply to Azure dedicated hosts
- Potential savings of up to 40% on VM costs

### Q7: Storage Solution for App1

**Question**: You plan to migrate App1 to Azure. You need to recommend a storage solution for App1 that meets the security and compliance requirements. Which type of storage should you recommend, and how should you recommend configuring the storage?

**Options**:
- Storage type: [various Azure storage options]
- Configuration: [various configuration options]

**Answer**:
- Storage type: Standard general-purpose v2
- Configuration: NFSv3

**Technical Implementation Details**:

**Storage Account Configuration**:
- Account type: Standard general-purpose v2
- Replication: Zone-redundant storage (ZRS)
- Access tier: Hot (for active workloads)

**NFSv3 Implementation**:
- Enable hierarchical namespace
- Configure NFSv3 protocol support
- Set up POSIX-compatible access control

### Q8: Data Storage Compliance for App1

**Question**: You migrate App1 to Azure. You need to ensure that the data storage for App1 meets the security and compliance requirement. What should you do?

**Options**:
- A. Create an access policy for the blob
- B. Modify the access level of the blob service
- C. Implement Azure resource locks
- D. Create Azure RBAC assignments

**Answer**: A. Create an access policy for the blob

**Technical Implementation**:
- **Policy Type**: Time-based retention policy
- **Retention Period**: 3+ years (to meet requirement)
- **Policy Scope**: Applied at the container level
- **Write Operations**:
  - Allow creation of new blobs
  - Allow deletion of blobs after retention period
  - Prevent modification of existing blob data
  - Prevent deletion during retention period

### Q9: DB1 and DB2 Azure Implementation

**Question**: How should the migrated databases DB1 and DB2 be implemented in Azure?

**Options**:
- Database type: [various Azure database options]
- Service tier: [various service tier options]

**Answer**:
- Database type: SQL Managed Instance
- Service tier: Business Critical

**Technical Architecture**:

**SQL Managed Instance Configuration**:
- **Deployment Model**: Zone-redundant deployment
- **Availability Model**: Built-in Always On availability groups
- **Instance Size**: Based on current workload requirements
- **Storage Configuration**: Local SSD for data and log files

**Business Critical Tier Features**:
- **High Availability Architecture**:
  - 4 nodes in a high-availability ring
  - 1 Primary node for read-write operations
  - 3 Secondary nodes for read operations
  - Automatic failover orchestration
  - 99.99% availability SLA

### Q10: Azure RBAC for Network Contributor

**Question**: You need to implement the Azure RBAC role assignments for the Network Contributor role. The solution must meet the authentication and authorization requirements. What is the minimum number of assignments that you must use?

**Options**:
- A. 1
- B. 2
- C. 5
- D. 10
- E. 15

**Answer**: B. 2

**Technical Implementation**:

**Management Group Structure**:
- **nadirarfi.com Tenant**:
  - Root Management Group
  - All 10 production subscriptions nested below

- **dev.nadirarfi.com Tenant**:
  - Root Management Group
  - All 5 development subscriptions nested below

**Role Assignment Strategy**:
- **Assignment 1**: Network Contributor role at root management group of nadirarfi.com tenant
- **Assignment 2**: Network Contributor role at root management group of dev.nadirarfi.com tenant