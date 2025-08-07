using StockFlowPro.Domain.Interfaces;
using StockFlowPro.Domain.Exceptions;

namespace StockFlowPro.Domain.Entities;

/// <summary>
/// Employee aggregate root with rich domain logic for profile, documents, and lifecycle workflows.
/// </summary>
public class Employee : IEntity
{
    // Core identity
    public Guid Id { get; private set; }
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PhoneNumber { get; private set; } = string.Empty;
    public DateTime? DateOfBirth { get; private set; }

    // Job details
    public string JobTitle { get; private set; } = string.Empty;
    public Guid? DepartmentId { get; private set; }
    public string? DepartmentName { get; private set; }
    public Guid? ManagerId { get; private set; }

    // Employment details
    public EmploymentStatus Status { get; private set; }
    public DateTime? HireDate { get; private set; }
    public DateTime? TerminationDate { get; private set; }
    public bool IsActive { get; private set; }

    // Audit
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    // Lifecycle timestamps
    public DateTime? OnboardingStartedAt { get; private set; }
    public DateTime? OnboardingCompletedAt { get; private set; }
    public DateTime? OffboardingStartedAt { get; private set; }
    public DateTime? OffboardingCompletedAt { get; private set; }

    // Navigation/collections (owned by aggregate)
    private readonly List<EmployeeDocument> _documents = new();
    public IReadOnlyCollection<EmployeeDocument> Documents => _documents.AsReadOnly();

    private readonly List<ChecklistItem> _onboardingChecklist = new();
    public IReadOnlyCollection<ChecklistItem> OnboardingChecklist => _onboardingChecklist.AsReadOnly();

    private readonly List<ChecklistItem> _offboardingChecklist = new();
    public IReadOnlyCollection<ChecklistItem> OffboardingChecklist => _offboardingChecklist.AsReadOnly();

    private Employee() { }

    public Employee(
        string firstName,
        string lastName,
        string email,
        string phoneNumber,
        string jobTitle,
        Guid? departmentId = null,
        string? departmentName = null,
        Guid? managerId = null,
        DateTime? hireDate = null)
    {
        if (string.IsNullOrWhiteSpace(firstName)) throw new ArgumentException("First name is required", nameof(firstName));
        if (string.IsNullOrWhiteSpace(lastName)) throw new ArgumentException("Last name is required", nameof(lastName));
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email is required", nameof(email));
        if (string.IsNullOrWhiteSpace(jobTitle)) throw new ArgumentException("Job title is required", nameof(jobTitle));

        Id = Guid.NewGuid();
        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        Email = email.Trim().ToLowerInvariant();
        PhoneNumber = phoneNumber.Trim();
        JobTitle = jobTitle.Trim();
        DepartmentId = departmentId;
        DepartmentName = departmentName;
        ManagerId = managerId;

        Status = EmploymentStatus.Onboarding;
        IsActive = false;
        CreatedAt = DateTime.UtcNow;
        HireDate = hireDate ?? DateTime.UtcNow.Date;

        InitializeDefaultOnboardingChecklist();
        OnboardingStartedAt = DateTime.UtcNow;
    }

    public string GetFullName() => $"{FirstName} {LastName}".Trim();

    public void UpdatePersonalInfo(string firstName, string lastName, string phoneNumber, DateTime? dateOfBirth)
    {
        FirstName = string.IsNullOrWhiteSpace(firstName) ? FirstName : firstName.Trim();
        LastName = string.IsNullOrWhiteSpace(lastName) ? LastName : lastName.Trim();
        PhoneNumber = string.IsNullOrWhiteSpace(phoneNumber) ? PhoneNumber : phoneNumber.Trim();
        DateOfBirth = dateOfBirth ?? DateOfBirth;
        Touch();
    }

    public void UpdateJobDetails(string jobTitle, Guid? departmentId, string? departmentName, Guid? managerId)
    {
        if (!string.IsNullOrWhiteSpace(jobTitle))
            JobTitle = jobTitle.Trim();

        DepartmentId = departmentId;
        DepartmentName = departmentName;
        ManagerId = managerId;
        Touch();
    }

    public void UpdateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email is required", nameof(email));
        Email = email.Trim().ToLowerInvariant();
        Touch();
    }

    public void Activate()
    {
        if (Status == EmploymentStatus.Terminated)
            throw new DomainException("Cannot activate a terminated employee.");

        IsActive = true;
        if (Status == EmploymentStatus.Onboarding && _onboardingChecklist.All(i => i.CompletedAt.HasValue))
        {
            Status = EmploymentStatus.Active;
            OnboardingCompletedAt = OnboardingCompletedAt ?? DateTime.UtcNow;
        }
        else if (Status == EmploymentStatus.Suspended)
        {
            Status = EmploymentStatus.Active;
        }
        Touch();
    }

    public void Suspend(string reason)
    {
        if (Status == EmploymentStatus.Terminated)
            throw new DomainException("Cannot suspend a terminated employee.");
        Status = EmploymentStatus.Suspended;
        IsActive = false;
        Touch();
    }

    public void StartOnboarding()
    {
        if (Status == EmploymentStatus.Terminated)
            throw new DomainException("Cannot onboard a terminated employee.");
        Status = EmploymentStatus.Onboarding;
        IsActive = false;
        if (_onboardingChecklist.Count == 0)
        {
            InitializeDefaultOnboardingChecklist();
        }
        OnboardingStartedAt = DateTime.UtcNow;
        Touch();
    }

    public void CompleteOnboardingTask(string code)
    {
        var item = _onboardingChecklist.FirstOrDefault(i => i.Code.Equals(code, StringComparison.OrdinalIgnoreCase));
        if (item == null) throw new DomainException($"Onboarding task '{code}' not found.");
        item.MarkCompleted();
        if (_onboardingChecklist.All(i => i.CompletedAt.HasValue))
        {
            OnboardingCompletedAt = DateTime.UtcNow;
            Status = EmploymentStatus.Active;
            IsActive = true;
        }
        Touch();
    }

    public void InitiateOffboarding(string reason)
    {
        if (Status == EmploymentStatus.Terminated)
            throw new DomainException("Employee is already terminated.");

        Status = EmploymentStatus.Offboarding;
        IsActive = false;
        _offboardingChecklist.Clear();
        InitializeDefaultOffboardingChecklist();
        OffboardingStartedAt = DateTime.UtcNow;
        Touch();
    }

    public void CompleteOffboardingTask(string code)
    {
        var item = _offboardingChecklist.FirstOrDefault(i => i.Code.Equals(code, StringComparison.OrdinalIgnoreCase));
        if (item == null) throw new DomainException($"Offboarding task '{code}' not found.");
        item.MarkCompleted();
        if (_offboardingChecklist.All(i => i.CompletedAt.HasValue))
        {
            OffboardingCompletedAt = DateTime.UtcNow;
            Terminate("Offboarding complete");
        }
        Touch();
    }

    public void Terminate(string reason)
    {
        if (Status == EmploymentStatus.Terminated)
            throw new DomainException("Employee is already terminated.");
        Status = EmploymentStatus.Terminated;
        TerminationDate = DateTime.UtcNow.Date;
        IsActive = false;
        Touch();
    }

    // Documents
    public EmployeeDocument AddDocument(string fileName, DocumentType type, string storagePath, long sizeBytes, string contentType, DateTime? issuedAt = null, DateTime? expiresAt = null)
    {
        if (string.IsNullOrWhiteSpace(fileName)) throw new ArgumentException("File name is required", nameof(fileName));
        if (string.IsNullOrWhiteSpace(storagePath)) throw new ArgumentException("Storage path is required", nameof(storagePath));
        if (sizeBytes <= 0) throw new ArgumentException("Document size must be positive", nameof(sizeBytes));

        // Versioning: increment version for same type
        var version = _documents.Where(d => d.Type == type).Select(d => d.Version).DefaultIfEmpty(0).Max() + 1;

        var doc = new EmployeeDocument(
            Guid.NewGuid(), Id, fileName.Trim(), type, storagePath.Trim(), sizeBytes, contentType.Trim(), version, issuedAt, expiresAt);
        _documents.Add(doc);
        Touch();
        return doc;
    }

    public void ArchiveDocument(Guid documentId, string reason)
    {
        var doc = _documents.FirstOrDefault(d => d.Id == documentId)
                  ?? throw new DomainException("Document not found.");
        doc.Archive(reason);
        Touch();
    }

    public void ReplaceDocument(Guid documentId, string newFileName, string newStoragePath, long sizeBytes, string contentType)
    {
        var doc = _documents.FirstOrDefault(d => d.Id == documentId)
                  ?? throw new DomainException("Document not found.");
        doc.Replace(newFileName, newStoragePath, sizeBytes, contentType);
        Touch();
    }

    private void InitializeDefaultOnboardingChecklist()
    {
        _onboardingChecklist.Clear();
        _onboardingChecklist.AddRange(new[]
        {
            ChecklistItem.Create("ACCOUNTS", "Create system accounts"),
            ChecklistItem.Create("DOCUMENTS", "Submit personal and ID documents"),
            ChecklistItem.Create("CONTRACT", "Sign employment contract"),
            ChecklistItem.Create("TRAINING", "Complete initial training"),
        });
    }

    private void InitializeDefaultOffboardingChecklist()
    {
        _offboardingChecklist.Clear();
        _offboardingChecklist.AddRange(new[]
        {
            ChecklistItem.Create("DISABLE_ACCESS", "Disable system access"),
            ChecklistItem.Create("RETURN_ASSETS", "Return company assets"),
            ChecklistItem.Create("KNOWLEDGE_TRANSFER", "Complete knowledge transfer"),
            ChecklistItem.Create("EXIT_INTERVIEW", "Conduct exit interview"),
        });
    }

    private void Touch() => UpdatedAt = DateTime.UtcNow;
}

/// <summary>
/// Department reference entity (lightweight). Full entity can be introduced later if needed.
/// </summary>
public class Department : IEntity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }

    private Department() { }

    public Department(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Department name is required", nameof(name));
        Id = Guid.NewGuid();
        Name = name.Trim();
        IsActive = true;
    }

    public void Rename(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Department name is required", nameof(name));
        Name = name.Trim();
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Employee document metadata stored in database. Binary content stored via storage service.
/// </summary>
public class EmployeeDocument : IEntity
{
    public Guid Id { get; private set; }
    public Guid EmployeeId { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public DocumentType Type { get; private set; }
    public string StoragePath { get; private set; } = string.Empty; // where the file is stored
    public long SizeBytes { get; private set; }
    public string ContentType { get; private set; } = string.Empty;
    public int Version { get; private set; }
    public bool IsArchived { get; private set; }
    public string? ArchiveReason { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? ArchivedAt { get; private set; }
    public DateTime? IssuedAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }

    private EmployeeDocument() { }

    public EmployeeDocument(Guid id, Guid employeeId, string fileName, DocumentType type, string storagePath, long sizeBytes, string contentType, int version, DateTime? issuedAt, DateTime? expiresAt)
    {
        Id = id;
        EmployeeId = employeeId;
        FileName = fileName;
        Type = type;
        StoragePath = storagePath;
        SizeBytes = sizeBytes;
        ContentType = contentType;
        Version = version;
        CreatedAt = DateTime.UtcNow;
        IssuedAt = issuedAt;
        ExpiresAt = expiresAt;
    }

    public void Archive(string reason)
    {
        if (IsArchived) return;
        IsArchived = true;
        ArchiveReason = reason;
        ArchivedAt = DateTime.UtcNow;
    }

    public void Replace(string newFileName, string newStoragePath, long sizeBytes, string contentType)
    {
        if (IsArchived) throw new DomainException("Cannot replace an archived document.");
        FileName = newFileName;
        StoragePath = newStoragePath;
        SizeBytes = sizeBytes;
        ContentType = contentType;
        Version += 1;
    }
}

/// <summary>
/// Checklist item for onboarding/offboarding workflows.
/// </summary>
public class ChecklistItem : IEntity
{
    public Guid Id { get; private set; }
    public string Code { get; private set; } = string.Empty; // e.g., ACCOUNTS, DOCUMENTS, CONTRACT
    public string Title { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    private ChecklistItem() { }

    private ChecklistItem(string code, string title)
    {
        Id = Guid.NewGuid();
        Code = code.Trim().ToUpperInvariant();
        Title = title.Trim();
        CreatedAt = DateTime.UtcNow;
    }

    public static ChecklistItem Create(string code, string title) => new(code, title);

    public void MarkCompleted()
    {
        if (CompletedAt.HasValue) return;
        CompletedAt = DateTime.UtcNow;
    }
}

/// <summary>
/// Employment lifecycle status.
/// </summary>
public enum EmploymentStatus
{
    Onboarding = 0,
    Active = 1,
    Suspended = 2,
    Offboarding = 3,
    Terminated = 4
}

/// <summary>
/// Types of documents an employee may have.
/// </summary>
public enum DocumentType
{
    Unknown = 0,
    Contract = 1,
    Identification = 2,
    Certification = 3,
    Other = 99
}
