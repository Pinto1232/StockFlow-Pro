using AutoMapper;
using StockFlowPro.Application.Commands.Users;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Domain.Entities;

namespace StockFlowPro.Application.Mappings;

public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.GetFullName()))
            .ForMember(dest => dest.Age, opt => opt.MapFrom(src => src.GetAge()));

        CreateMap<CreateUserCommand, User>()
            .ConstructUsing(src => new User(src.FirstName, src.LastName, src.Email, src.PhoneNumber, src.DateOfBirth));

        CreateMap<CreateUserDto, CreateUserCommand>();
        CreateMap<UpdateUserDto, UpdateUserCommand>();
        CreateMap<UpdateUserEmailDto, UpdateUserEmailCommand>();
    }
}