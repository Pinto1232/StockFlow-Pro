using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Xunit;
using StockFlowPro.Application.Interfaces;

namespace StockFlowPro.Web.Tests.Integration
{
    public class EmailVerificationIntegrationTests : IClassFixture<TestWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly TestWebApplicationFactory<Program> _factory;

        public EmailVerificationIntegrationTests(TestWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task CheckEmail_WithNewEmail_ReturnsNewAccountStatus()
        {
            // Arrange
            var request = new { email = "newuser@example.com" };
            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/checkout/check-email", content);

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
            
            Assert.False(result.GetProperty("accountExists").GetBoolean());
            Assert.Equal("success", result.GetProperty("status").GetString());
        }

        [Fact]
        public async Task CheckEmail_WithExistingEmail_ReturnsExistingAccountStatus()
        {
            // Arrange - First create a user
            using var scope = _factory.Services.CreateScope();
            var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
            
            // Create a test user
            await userService.CreateAsync(new StockFlowPro.Application.DTOs.CreateUserDto
            {
                Email = "existing@example.com",
                FirstName = "Test",
                LastName = "User",
                DateOfBirth = DateTime.Now.AddYears(-25),
                PasswordHash = "TestPasswordHash123!"
            });

            var request = new { email = "existing@example.com" };
            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/checkout/check-email", content);

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
            
            Assert.True(result.GetProperty("accountExists").GetBoolean());
            Assert.Equal("success", result.GetProperty("status").GetString());
        }

        [Fact]
        public async Task SendVerificationEmail_WithValidData_ReturnsSuccess()
        {
            // Arrange
            var request = new 
            { 
                email = "test@example.com",
                sessionId = "test_session_123",
                planId = "test_plan_456"
            };
            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/checkout/send-verification", content);

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
            
            Assert.True(result.GetProperty("sent").GetBoolean());
            Assert.Equal("success", result.GetProperty("status").GetString());
        }

        [Fact]
        public async Task SendVerificationEmail_WithInvalidEmail_ReturnsBadRequest()
        {
            // Arrange
            var request = new 
            { 
                email = "invalid-email",
                sessionId = "test_session_123",
                planId = "test_plan_456"
            };
            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/checkout/send-verification", content);

            // Assert
            Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task VerifyEmail_WithInvalidToken_ReturnsFailure()
        {
            // Arrange
            var request = new 
            { 
                token = "invalid_token",
                sessionId = "test_session_123"
            };
            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/checkout/verify-email", content);

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(responseContent);
            
            Assert.False(result.GetProperty("verified").GetBoolean());
            Assert.Equal("error", result.GetProperty("status").GetString());
        }
    }
}