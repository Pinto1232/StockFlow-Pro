using Microsoft.Extensions.Logging;
using StockFlowPro.Application.Interfaces;
using StockFlowPro.Domain.Entities;
using StockFlowPro.Domain.Enums;
using StockFlowPro.Domain.Repositories;
using System.Text.RegularExpressions;

namespace StockFlowPro.Application.Services;

/// <summary>
/// Service for managing notification templates.
/// </summary>
public class NotificationTemplateService : INotificationTemplateService
{
    private readonly INotificationTemplateRepository _templateRepository;
    private readonly ILogger<NotificationTemplateService> _logger;

    public NotificationTemplateService(
        INotificationTemplateRepository templateRepository,
        ILogger<NotificationTemplateService> logger)
    {
        _templateRepository = templateRepository;
        _logger = logger;
    }

    public async Task<NotificationTemplate> CreateTemplateAsync(
        string name,
        string description,
        string titleTemplate,
        string messageTemplate,
        NotificationType type,
        Guid createdBy,
        NotificationPriority defaultPriority = NotificationPriority.Normal,
        NotificationChannel defaultChannels = NotificationChannel.InApp,
        bool isPersistent = true,
        bool isDismissible = true,
        CancellationToken cancellationToken = default)
    {
        // Check if template name already exists
        if (await _templateRepository.ExistsByNameAsync(name, null, cancellationToken))
        {
            throw new InvalidOperationException($"A template with the name '{name}' already exists.");
        }

        // Validate template syntax
        var validationResult = await ValidateTemplateAsync(titleTemplate, messageTemplate, new Dictionary<string, object>(), cancellationToken);
        if (!validationResult)
        {
            throw new ArgumentException("Template contains invalid syntax.");
        }

        var template = new NotificationTemplate(
            name,
            description,
            titleTemplate,
            messageTemplate,
            type,
            createdBy,
            defaultPriority,
            defaultChannels,
            isPersistent,
            isDismissible);

        await _templateRepository.AddAsync(template, cancellationToken);

        _logger.LogInformation("Notification template '{TemplateName}' created by user {CreatedBy}", name, createdBy);

        return template;
    }

    public async Task<NotificationTemplate> UpdateTemplateAsync(
        Guid templateId,
        string name,
        string description,
        string titleTemplate,
        string messageTemplate,
        CancellationToken cancellationToken = default)
    {
        var template = await _templateRepository.GetByIdAsync(templateId, cancellationToken);
        if (template == null)
        {
            throw new InvalidOperationException($"Template with ID {templateId} not found.");
        }

        // Check if new name conflicts with existing templates (excluding current template)
        if (template.Name != name && await _templateRepository.ExistsByNameAsync(name, templateId, cancellationToken))
        {
            throw new InvalidOperationException($"A template with the name '{name}' already exists.");
        }

        // Validate template syntax
        var validationResult = await ValidateTemplateAsync(titleTemplate, messageTemplate, new Dictionary<string, object>(), cancellationToken);
        if (!validationResult)
        {
            throw new ArgumentException("Template contains invalid syntax.");
        }

        template.UpdateTemplate(name, description, titleTemplate, messageTemplate);
        await _templateRepository.UpdateAsync(template, cancellationToken);

        _logger.LogInformation("Notification template '{TemplateName}' updated", name);

        return template;
    }

    public async Task DeleteTemplateAsync(Guid templateId, CancellationToken cancellationToken = default)
    {
        var template = await _templateRepository.GetByIdAsync(templateId, cancellationToken);
        if (template == null)
        {
            throw new InvalidOperationException($"Template with ID {templateId} not found.");
        }

        await _templateRepository.DeleteAsync(template, cancellationToken);

        _logger.LogInformation("Notification template '{TemplateName}' deleted", template.Name);
    }

    public async Task<NotificationTemplate?> GetTemplateAsync(Guid templateId, CancellationToken cancellationToken = default)
    {
        return await _templateRepository.GetByIdAsync(templateId, cancellationToken);
    }

    public async Task<NotificationTemplate?> GetTemplateByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _templateRepository.GetByNameAsync(name, cancellationToken);
    }

    public async Task<IEnumerable<NotificationTemplate>> GetActiveTemplatesAsync(CancellationToken cancellationToken = default)
    {
        return await _templateRepository.GetActiveAsync(cancellationToken);
    }

    public async Task<IEnumerable<NotificationTemplate>> GetTemplatesByTypeAsync(NotificationType type, CancellationToken cancellationToken = default)
    {
        return await _templateRepository.GetByTypeAsync(type, cancellationToken);
    }

    public async Task ActivateTemplateAsync(Guid templateId, CancellationToken cancellationToken = default)
    {
        var template = await _templateRepository.GetByIdAsync(templateId, cancellationToken);
        if (template == null)
        {
            throw new InvalidOperationException($"Template with ID {templateId} not found.");
        }

        template.Activate();
        await _templateRepository.UpdateAsync(template, cancellationToken);

        _logger.LogInformation("Notification template '{TemplateName}' activated", template.Name);
    }

    public async Task DeactivateTemplateAsync(Guid templateId, CancellationToken cancellationToken = default)
    {
        var template = await _templateRepository.GetByIdAsync(templateId, cancellationToken);
        if (template == null)
        {
            throw new InvalidOperationException($"Template with ID {templateId} not found.");
        }

        template.Deactivate();
        await _templateRepository.UpdateAsync(template, cancellationToken);

        _logger.LogInformation("Notification template '{TemplateName}' deactivated", template.Name);
    }

    public async Task<bool> ValidateTemplateAsync(string titleTemplate, string messageTemplate, Dictionary<string, object> sampleParameters, CancellationToken cancellationToken = default)
    {
        try
        {
            // Check for valid parameter syntax
            var parameterPattern = @"\{([^}]+)\}";
            var titleMatches = Regex.Matches(titleTemplate, parameterPattern);
            var messageMatches = Regex.Matches(messageTemplate, parameterPattern);

            // Validate that all parameters are properly formatted
            foreach (Match match in titleMatches.Concat(messageMatches))
            {
                var parameterName = match.Groups[1].Value;
                if (string.IsNullOrWhiteSpace(parameterName))
                {
                    return false;
                }

                // Check for invalid characters in parameter names
                if (!Regex.IsMatch(parameterName, @"^[a-zA-Z_][a-zA-Z0-9_]*$"))
                {
                    return false;
                }
            }

            // Try to render with sample parameters
            await PreviewTemplateAsync(titleTemplate, messageTemplate, sampleParameters, cancellationToken);

            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<(string title, string message)> PreviewTemplateAsync(string titleTemplate, string messageTemplate, Dictionary<string, object> parameters, CancellationToken cancellationToken = default)
    {
        await Task.CompletedTask; // For async consistency

        try
        {
            var title = ReplaceTemplateParameters(titleTemplate, parameters);
            var message = ReplaceTemplateParameters(messageTemplate, parameters);

            return (title, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error previewing template");
            throw new ArgumentException("Error processing template parameters", ex);
        }
    }

    public async Task CreateDefaultTemplatesAsync(Guid createdBy, CancellationToken cancellationToken = default)
    {
        var defaultTemplates = new[]
        {
            new
            {
                Name = "LowStockAlert",
                Description = "Alert when product stock is running low",
                TitleTemplate = "Low Stock Alert: {ProductName}",
                MessageTemplate = "Product {ProductName} has only {CurrentStock} units remaining. Minimum required: {MinimumStock}",
                Type = NotificationType.StockAlert,
                Priority = NotificationPriority.High,
                Channels = NotificationChannel.InApp | NotificationChannel.Email
            },
            new
            {
                Name = "OutOfStockAlert",
                Description = "Alert when product is out of stock",
                TitleTemplate = "Out of Stock: {ProductName}",
                MessageTemplate = "Product {ProductName} is now out of stock. Please reorder immediately.",
                Type = NotificationType.StockAlert,
                Priority = NotificationPriority.Critical,
                Channels = NotificationChannel.InApp | NotificationChannel.Email
            },
            new
            {
                Name = "InvoiceGenerated",
                Description = "Notification when an invoice is generated",
                TitleTemplate = "Invoice #{InvoiceNumber} Generated",
                MessageTemplate = "Invoice #{InvoiceNumber} for {CustomerName} has been generated. Amount: ${Amount}",
                Type = NotificationType.Invoice,
                Priority = NotificationPriority.Normal,
                Channels = NotificationChannel.InApp | NotificationChannel.Email
            },
            new
            {
                Name = "PaymentReceived",
                Description = "Notification when payment is received",
                TitleTemplate = "Payment Received: ${Amount}",
                MessageTemplate = "Payment of ${Amount} has been received for invoice #{InvoiceNumber} from {CustomerName}.",
                Type = NotificationType.Payment,
                Priority = NotificationPriority.Normal,
                Channels = NotificationChannel.InApp | NotificationChannel.Email
            },
            new
            {
                Name = "UserAccountCreated",
                Description = "Welcome notification for new users",
                TitleTemplate = "Welcome to StockFlow Pro, {FirstName}!",
                MessageTemplate = "Your account has been successfully created. You can now start managing your inventory.",
                Type = NotificationType.Account,
                Priority = NotificationPriority.Normal,
                Channels = NotificationChannel.InApp | NotificationChannel.Email
            },
            new
            {
                Name = "SystemMaintenance",
                Description = "System maintenance notification",
                TitleTemplate = "Scheduled Maintenance: {MaintenanceDate}",
                MessageTemplate = "System maintenance is scheduled for {MaintenanceDate} from {StartTime} to {EndTime}. Please save your work.",
                Type = NotificationType.System,
                Priority = NotificationPriority.High,
                Channels = NotificationChannel.InApp | NotificationChannel.Email
            },
            new
            {
                Name = "SecurityAlert",
                Description = "Security-related notifications",
                TitleTemplate = "Security Alert: {AlertType}",
                MessageTemplate = "A security event has been detected: {AlertDescription}. Please review your account activity.",
                Type = NotificationType.Security,
                Priority = NotificationPriority.Critical,
                Channels = NotificationChannel.InApp | NotificationChannel.Email
            }
        };

        foreach (var templateData in defaultTemplates)
        {
            // Check if template already exists
            if (!await _templateRepository.ExistsByNameAsync(templateData.Name, null, cancellationToken))
            {
                var template = new NotificationTemplate(
                    templateData.Name,
                    templateData.Description,
                    templateData.TitleTemplate,
                    templateData.MessageTemplate,
                    templateData.Type,
                    createdBy,
                    templateData.Priority,
                    templateData.Channels);

                await _templateRepository.AddAsync(template, cancellationToken);
                _logger.LogInformation("Created default template: {TemplateName}", templateData.Name);
            }
        }
    }

    private static string ReplaceTemplateParameters(string template, Dictionary<string, object> parameters)
    {
        var result = template;
        foreach (var parameter in parameters)
        {
            var placeholder = $"{{{parameter.Key}}}";
            result = result.Replace(placeholder, parameter.Value?.ToString() ?? string.Empty);
        }
        return result;
    }
}