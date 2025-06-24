using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Enums;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace StockFlowPro.Web.Tests.Integration;

public class UsersControllerIntegrationTests : IClassFixture<TestWebApplicationFactory<Program>>
{
    private readonly TestWebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public UsersControllerIntegrationTests(TestWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };
    }

    [Fact]
    public async Task GetAllUsersMock_ShouldReturnOkWithUsers()
    {

        var response = await _client.GetAsync("/api/users/mock");


        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var users = JsonSerializer.Deserialize<List<UserDto>>(content, _jsonOptions);
        
        users.Should().NotBeNull();
        users.Should().HaveCountGreaterThan(0);
    }

    [Fact]
    public async Task CreateUserMock_ValidUser_ShouldReturnCreated()
    {

        var newUser = new CreateUserDto
        {
            FirstName = "Integration",
            LastName = "Test",
            Email = "integration.test@example.com",
            PhoneNumber = "555-0123",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Role = UserRole.User
        };


        var response = await _client.PostAsJsonAsync("/api/users/mock", newUser, _jsonOptions);


        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var content = await response.Content.ReadAsStringAsync();
        var createdUser = JsonSerializer.Deserialize<UserDto>(content, _jsonOptions);
        
        createdUser.Should().NotBeNull();
        createdUser!.FirstName.Should().Be("Integration");
        createdUser.LastName.Should().Be("Test");
        createdUser.Email.Should().Be("integration.test@example.com");
        createdUser.Role.Should().Be(UserRole.User);
    }

    [Fact]
    public async Task CreateUserMock_InvalidUser_ShouldReturnBadRequest()
    {

        var invalidUser = new CreateUserDto
        {
            FirstName = "", // Invalid: empty first name
            LastName = "Test",
            Email = "invalid-email", // Invalid email format
            PhoneNumber = "",
            DateOfBirth = DateTime.MinValue,
            Role = UserRole.User
        };


        var response = await _client.PostAsJsonAsync("/api/users/mock", invalidUser, _jsonOptions);


        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateUserMock_ExistingUser_ShouldReturnOk()
    {

        var newUser = new CreateUserDto
        {
            FirstName = "Original",
            LastName = "User",
            Email = "original@example.com",
            PhoneNumber = "555-0001",
            DateOfBirth = new DateTime(1985, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Role = UserRole.User
        };

        var createResponse = await _client.PostAsJsonAsync("/api/users/mock", newUser, _jsonOptions);
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var createdContent = await createResponse.Content.ReadAsStringAsync();
        var createdUser = JsonSerializer.Deserialize<UserDto>(createdContent, _jsonOptions);


        var updateUser = new CreateUserDto
        {
            FirstName = "Updated",
            LastName = "User",
            Email = "updated@example.com",
            PhoneNumber = "555-0002",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Role = UserRole.Manager
        };


        var updateResponse = await _client.PutAsJsonAsync($"/api/users/mock/{createdUser!.Id}", updateUser, _jsonOptions);


        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var updateContent = await updateResponse.Content.ReadAsStringAsync();
        var updatedUser = JsonSerializer.Deserialize<UserDto>(updateContent, _jsonOptions);
        
        updatedUser.Should().NotBeNull();
        updatedUser!.FirstName.Should().Be("Updated");
        updatedUser.Email.Should().Be("updated@example.com");
        updatedUser.Role.Should().Be(UserRole.Manager);
    }

    [Fact]
    public async Task UpdateUserMock_NonExistingUser_ShouldReturnNotFound()
    {

        var nonExistingId = Guid.NewGuid();
        var updateUser = new CreateUserDto
        {
            FirstName = "Updated",
            LastName = "User",
            Email = "updated@example.com",
            PhoneNumber = "555-0002",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Role = UserRole.User
        };


        var response = await _client.PutAsJsonAsync($"/api/users/mock/{nonExistingId}", updateUser, _jsonOptions);


        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetAllUsersMock_WithActiveOnlyParameter_ShouldReturnUsers()
    {

        var response = await _client.GetAsync("/api/users/mock?activeOnly=true");


        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var content = await response.Content.ReadAsStringAsync();
        var users = JsonSerializer.Deserialize<List<UserDto>>(content, _jsonOptions);
        
        users.Should().NotBeNull();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("test@")]
    [InlineData("@example.com")]
    public async Task CreateUserMock_InvalidEmailFormats_ShouldHandleGracefully(string email)
    {

        var userWithInvalidEmail = new CreateUserDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = email,
            PhoneNumber = "555-0123",
            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            Role = UserRole.User
        };


        var response = await _client.PostAsJsonAsync("/api/users/mock", userWithInvalidEmail, _jsonOptions);


        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateAndRetrieveUser_FullWorkflow_ShouldWork()
    {

        var newUser = new CreateUserDto
        {
            FirstName = "Workflow",
            LastName = "Test",
            Email = "workflow.test@example.com",
            PhoneNumber = "555-9999",
            DateOfBirth = new DateTime(1992, 6, 15, 0, 0, 0, DateTimeKind.Utc),
            Role = UserRole.Manager
        };


        var createResponse = await _client.PostAsJsonAsync("/api/users/mock", newUser, _jsonOptions);
        

        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var createContent = await createResponse.Content.ReadAsStringAsync();
        var createdUser = JsonSerializer.Deserialize<UserDto>(createContent, _jsonOptions);
        createdUser.Should().NotBeNull();


        var getAllResponse = await _client.GetAsync("/api/users/mock");
        

        getAllResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var getAllContent = await getAllResponse.Content.ReadAsStringAsync();
        var allUsers = JsonSerializer.Deserialize<List<UserDto>>(getAllContent, _jsonOptions);
        
        allUsers.Should().NotBeNull();
        allUsers.Should().Contain(u => u.Email == "workflow.test@example.com");
        
        var retrievedUser = allUsers!.First(u => u.Email == "workflow.test@example.com");
        retrievedUser.FirstName.Should().Be("Workflow");
        retrievedUser.LastName.Should().Be("Test");
        retrievedUser.Role.Should().Be(UserRole.Manager);
    }

    [Fact]
    public async Task ConcurrentUserCreation_ShouldHandleMultipleRequests()
    {

        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var tasks = new List<Task<HttpResponseMessage>>();
        
        for (int i = 0; i < 5; i++)
        {
            var user = new CreateUserDto
            {
                FirstName = $"Concurrent{i}",
                LastName = "Test",
                Email = $"concurrent{i}-{timestamp}@example.com",
                PhoneNumber = $"555-000{i}",
                DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                Role = UserRole.User
            };
            
            tasks.Add(_client.PostAsJsonAsync("/api/users/mock", user, _jsonOptions));
        }


        var responses = await Task.WhenAll(tasks);


        responses.Should().HaveCount(5);
        responses.Should().OnlyContain(r => r.StatusCode == HttpStatusCode.Created);
        
        var createdUsers = new List<UserDto>();
        foreach (var response in responses)
        {
            var content = await response.Content.ReadAsStringAsync();
            var user = JsonSerializer.Deserialize<UserDto>(content, _jsonOptions);
            if (user != null)
            {
                createdUsers.Add(user);
            }
        }
        
        createdUsers.Should().HaveCount(5);
        for (int i = 0; i < 5; i++)
        {
            createdUsers.Should().Contain(u => u.Email == $"concurrent{i}-{timestamp}@example.com");
        }
    }
}
